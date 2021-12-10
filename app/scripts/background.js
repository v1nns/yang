import { filter, isEmpty, isEqual, pick, remove } from "lodash";
import axios from "axios";
import API, { Notifications } from "../scripts/api";

// TODO: maybe remove this
// browser.runtime.onInstalled.addListener((details) => {
//   console.log("previousVersion", details.previousVersion);
// });

/* -------------------------------------------------------------------------- */
/*                               Initialization                               */
/* -------------------------------------------------------------------------- */

var polling = null,
  restart = false;

async function init() {
  const data = await getChangesFromStorage();
  if (data.length > 0) {
    startService();
  }
}

init();

/* -------------------------------------------------------------------------- */
/*                                    Utils                                   */
/* -------------------------------------------------------------------------- */

async function startService() {
  console.log("initializing update service");
  const options = await getOptionsFromStorage();
  if (options.refreshTime !== undefined) {
    service();
    polling = setInterval(service, options.refreshTime * 1000);
  }
}

function stopService() {
  console.log("stopping update service");
  clearInterval(polling);
  polling = null;
  restart = false;
}

function restartService() {
  console.log("restarting update service");
  stopService();
  startService();
}

/* ----------------------------- Browser-related ---------------------------- */

function clear() {
  browser.browserAction.setBadgeText({
    text: ``,
  });
  browser.storage.local.set({ changes: [] });
}

function getChangesFromStorage() {
  return browser.storage.local
    .get("changes")
    .then((result) =>
      !isEmpty(result.changes) ? JSON.parse(result.changes) : []
    );
}

function getUpdatedChangesFromStorage() {
  const updated = browser.storage.local
    .get("updated")
    .then((result) =>
      !isEmpty(result.updated) ? JSON.parse(result.updated) : []
    );

  // Just clear it
  saveUpdatedChangesToStorage(null);
  return updated;
}

function getOptionsFromStorage() {
  return browser.storage.local
    .get("options")
    .then((result) =>
      !isEmpty(result.options) ? JSON.parse(result.options) : {}
    );
}

function saveChangesToStorage(data) {
  browser.storage.local.set({ changes: JSON.stringify(data) });
}

function saveUpdatedChangesToStorage(data) {
  browser.storage.local.set({
    updated: data !== null ? JSON.stringify(data) : [],
  });
}

async function isConfigSet() {
  // TODO: maybe change this for something like "validateConfig"
  const options = await getOptionsFromStorage();
  const existsConfig =
    !isEmpty(options) &&
    options.endpoint.length > 0 &&
    options.credentials.email.length > 0 &&
    options.credentials.password.length > 0;

  return existsConfig;
}

/* -------------------------------------------------------------------------- */
/*                               Gerrit-related                               */
/* -------------------------------------------------------------------------- */

async function queryOnGerrit(options, chid) {
  const url = `${options.endpoint}/changes/${chid}/detail`;

  let data = null;
  try {
    data = await axios
      .get(
        url,
        {},
        {
          auth: {
            username: options.credentials.email,
            password: options.credentials.password,
          },
        }
      )
      .then((response) => (response.status == 200 ? response.data : {}));
  } catch (err) {
    console.log("chid:", chid, "err code:", err.response.status);
    data = { id: chid.toString(), error: true };
  }

  // Simply return empty
  if (isEmpty(data) || data.error) {
    return data;
  }

  // Otherwise, parse it
  const object = JSON.parse(data.toString().replace(")]}'", ""));
  const raw = pick(object, ["_number", "subject", "status", "labels"]);
  const change = convertGerritData(raw);

  return change;
}

/* ------ Get latest label entry (considering date value) in array list ----- */

const filterLabel = (items) => {
  let value = 0,
    date = null;
  for (const item of items) {
    if (item.date) {
      if (item.value == -2) {
        return item.value;
      }

      if (date == null || Date.parse(item.date) > date) {
        value = item.value;
        date = Date.parse(item.date);
      }
    }
  }
  return value;
};

/* ----------- Convert JSON object from REST API to custom object ----------- */

function convertGerritData(raw) {
  const change = pick(raw, ["subject", "status"]);
  change.id = raw._number.toString();
  change.verified = 0;
  change.codeReview = 0;

  // filter "Verified" label
  if (raw.labels["Verified"]["all"] !== undefined) {
    change.verified = filterLabel(raw.labels["Verified"]["all"]);
  }

  // filter "Code-Review" label
  if (raw.labels["Code-Review"]["all"] !== undefined) {
    change.codeReview = filterLabel(raw.labels["Code-Review"]["all"]);
  }

  return change;
}

/* -------------------------------------------------------------------------- */
/*                               Message Handler                              */
/* -------------------------------------------------------------------------- */

function handleMessage(request, sender, sendResponse) {
  console.log(`background received a message: ${request.type}`);
  switch (request.type) {
    case API.GET_DATA:
      return getChanges();
    case API.ADD_CHANGE:
      return addChange(request);
    case API.REMOVE_CHANGES:
      return removeChanges(request);
    case API.TEST_ENDPOINT:
      return testEndpoint(request);
    case API.RESTART_SERVICE:
      return triggerRestartService();
    case API.EXISTS_CONFIG:
      return existsConfig();
  }
  return false;
}

browser.runtime.onMessage.addListener(handleMessage);

/* ------------------------ Get Changes from Storage ------------------------ */

async function getChanges() {
  const changes = await getChangesFromStorage();
  const updated = await getUpdatedChangesFromStorage();

  let ids = new Set(updated.map((d) => d.id));
  let merged = [...updated, ...changes.filter((d) => !ids.has(d.id))];

  return Promise.resolve({ response: merged });
}

/* ------------------------ Add new Change to Storage ----------------------- */

async function addChange(request) {
  console.log(`addChange received data: ${request.data}`);
  const changes = await getChangesFromStorage();
  const updated = [
    {
      id: request.data,
      codeReview: 0,
      verified: 0,
    },
    ...changes,
  ];

  // enable update service
  if (updated.length > 0 && polling === null) {
    const options = await getOptionsFromStorage();
    if (options.refreshTime !== undefined) {
      service();
      polling = setInterval(service, options.refreshTime * 1000);
    }
  }

  saveChangesToStorage(updated);
  return true;
}

/* ----------------- Remove one or more Changes from Storage ---------------- */

async function removeChanges(request) {
  console.log(`removeChanges received data: ${request.data}`);
  const changes = await getChangesFromStorage();
  const updated = filter(changes, (o) => !request.data.includes(o.id));

  // disable update service
  if (updated.length == 0) {
    stopService();
  }

  saveChangesToStorage(updated);
  return true;
}

/* ------------------------ Get Changes from Storage ------------------------ */

async function testEndpoint(request) {
  console.log(`testEndpoint received data: ${request.data}`);
  const { endpoint, credentials } = request.data;
  const url = `${endpoint}/config/server/version`;

  let result = false;
  try {
    result = await axios
      .get(
        url,
        {},
        {
          auth: {
            username: credentials.email,
            password: credentials.password,
          },
        }
      )
      .then((response) => (response.status == 200 ? true : false));
  } catch (err) {
    console.log("error testing endpoint:", endpoint);
    if (err.response !== undefined) {
      console.log("err code:", err.response.status);
    }
  }

  return Promise.resolve({ response: result });
}

/* ------------------------- Restart Update Service ------------------------- */

async function triggerRestartService() {
  console.log(`restartService called`);
  if (polling != null) {
    restart = true;
  }

  return true;
}

/* --------------------- Get info about Config existence -------------------- */

async function existsConfig() {
  console.log(`existsConfig called`);
  const result = await isConfigSet();

  return Promise.resolve({ response: result });
}

/* -------------------------------------------------------------------------- */
/*                               Update Service                               */
/* -------------------------------------------------------------------------- */

const service = async function () {
  const existsConfig = await isConfigSet();
  if (!existsConfig) {
    // TODO: send some kind of notification telling about this
    stopService();
    return;
  }

  let options = await getOptionsFromStorage();
  let changes = await getChangesFromStorage();
  let updated = [];

  // Query on gerrit
  for (const [index, elem] of changes.entries()) {
    if (restart) {
      restartService();
      return;
    }

    // Do not query if status is merged
    if (elem.status === "MERGED") {
      continue;
    }

    const result = await queryOnGerrit(options, elem.id);

    if (result.error || !isEqual(elem, result)) {
      changes[index] = result;
      updated.push({ ...result, updated: true });
    }
  }

  if (restart) {
    restartService();
    return;
  }

  // Save data and send message (if popup is open)
  if (updated.length > 0) {
    // In case there was any error, remove entry from cache
    // TODO: maybe inform it through notification
    remove(changes, (c) => c.error === true);

    // Update storage
    await saveChangesToStorage(changes);

    const isPopupActive =
      (await browser.extension.getViews({ type: "popup" }).length) > 0;

    if (isPopupActive) {
      // Send message to popup
      browser.runtime
        .sendMessage({ type: API.UPDATE_DATA, data: updated })
        .then(ignore, ignore);
    } else {
      // Save these updated changes in a different object, so the user can
      // distinguish it when popup is opened
      await saveUpdatedChangesToStorage(updated);

      // Set badge on extension icon
      browser.browserAction.setBadgeText({
        text: `${updated.length}`,
      });

      // Display a notification informing about these updates
      browser.notifications.create(Notifications.CHANGE_UPDATE, {
        type: "basic",
        priority: 1,
        iconUrl: browser.runtime.getURL("images/icon-128.png"),
        title: "Yet Another Notifier for Gerrit",
        message: `Updated ${updated.length} change${
          updated.length > 1 ? "s" : ""
        }`,
      });
    }
  }

  // If there is no more chid to query, must disable the service
  const noChidToQuery = changes.every((obj) => obj.status === "MERGED");
  if (noChidToQuery) {
    stopService();
  }
};

function ignore() {
  console.log("ignoring");
}
