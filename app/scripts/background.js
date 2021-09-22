import { filter, isEmpty, isEqual, pick, remove } from "lodash";
import axios from "axios";
import API from "../scripts/api";

// browser.runtime.onInstalled.addListener((details) => {
//   console.log("previousVersion", details.previousVersion);
// });

/* -------------------------------------------------------------------------- */
/*                               Initialization                               */
/* -------------------------------------------------------------------------- */

var polling = null;

async function init() {
  const data = await getChangesFromStorage();
  if (data.length > 0) {
    console.log("initializing update service");
    polling = setInterval(service, 5000);
  }
}

init();

/* -------------------------------------------------------------------------- */
/*                                    Utils                                   */
/* -------------------------------------------------------------------------- */

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
      isEmpty(result.changes) ? [] : JSON.parse(result.changes)
    );
}

function saveChangesToStorage(data) {
  browser.storage.local.set({ changes: JSON.stringify(data) });
}

async function queryOnGerrit(chid) {
  // TODO: get these info from storage CANNOT COMMIT THIS, OK?
  const url = `https://gerrit-review.googlesource.com/changes/${chid}/detail`;
  const user = "dummy";
  const pw = `dummy`;

  let data = null;
  try {
    data = await axios
      .get(
        url,
        {},
        {
          auth: {
            username: user,
            password: pw,
          },
        }
      )
      .then((response) => (response.status == 200 ? response.data : {}));
  } catch (err) {
    console.log("chid:", chid, "err code:", err.response.status);
    data = { id: chid, error: true };
  }

  // Simply return empty
  if (isEmpty(data) || data.error) return data;

  // Otherwise, parse it
  const object = JSON.parse(data.toString().replace(")]}'", ""));
  const raw = pick(object, ["_number", "subject", "status", "labels"]);
  const change = convertGerritData(raw);

  return change;
}

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

function convertGerritData(raw) {
  const change = pick(raw, ["subject", "status"]);
  change.id = raw._number;

  // filter labels
  change.verified = filterLabel(raw.labels["Verified"]["all"]);
  change.codeReview = filterLabel(raw.labels["Code-Review"]["all"]);

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
  }
  return false;
}

browser.runtime.onMessage.addListener(handleMessage);

/* ------------------------ Get Changes from Storage ------------------------ */

async function getChanges() {
  const changes = await getChangesFromStorage();
  return Promise.resolve({ response: changes });
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
  if (updated.length > 0) {
    polling = setInterval(service, 5000);
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
    polling = null;
  }

  saveChangesToStorage(updated);
  return true;
}

/* -------------------------------------------------------------------------- */
/*                               Update service                               */
/* -------------------------------------------------------------------------- */

const service = async function () {
  let changes = await getChangesFromStorage();
  let updated = [];

  // Query on gerrit
  for (const [index, elem] of changes.entries()) {
    // Do not query if status is merged
    if (elem.status === "MERGED") {
      continue;
    }

    const result = await queryOnGerrit(elem.id);

    if (result.error || !isEqual(elem, result)) {
      changes[index] = result;
      updated.push(result);
    }
  }

  // Send events (if popup is open, it will receive it)
  if (updated.length > 0) {
    // In case there was any error, remove entry from cache
    remove(changes, (c) => c.error === true);

    // Update storage
    await saveChangesToStorage(changes);

    // Set badge on extension icon
    browser.browserAction.setBadgeText({
      text: `${updated.length}`,
    });

    // Send message to popup
    browser.runtime
      .sendMessage({ type: API.UPDATE_DATA, data: updated })
      .then(ignore, ignore);

    // TODO: send notification
  }

  clearInterval(polling);
};

function ignore() {
  console.log("ignoring");
}
