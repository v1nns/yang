import { filter } from "lodash";

import API from "../../api";

import Storage from "./storage";
import Service from "./polling";
import Gerrit from "./gerrit";

// TODO: maybe remove this
// browser.runtime.onInstalled.addListener((details) => {
//   console.log("previousVersion", details.previousVersion);
// });

/* -------------------------------------------------------------------------- */
/*                               Initialization                               */
/* -------------------------------------------------------------------------- */

export var polling = false,
  restart = false;

export async function init() {
  // Register message listener
  browser.runtime.onMessage.addListener(handleMessage);

  // Polling service initialization
  const data = await Storage.getChanges();
  if (data.length > 0) {
    await startService();
  }
}

export function reset() {
  polling = false;
  restart = false;
}

/* -------------------------------------------------------------------------- */
/*                               Polling Service                              */
/* -------------------------------------------------------------------------- */

async function startService() {
  console.log("Initializing update service");
  const options = await Storage.getOptions();

  if (options.refreshTime !== undefined) {
    service();
    polling = setInterval(service, options.refreshTime * 1000);
  }
}

function stopService() {
  console.log("Stopping update service");
  clearInterval(polling);
  reset();
}

function restartService() {
  console.log("Restarting update service");
  stopService();
  startService();
}

// Need this, otherwise it will crash by some CSP policy error in development mode
function service() {
  Service.run(restart, restartService, stopService);
}

/* -------------------------------------------------------------------------- */
/*                               Message Handler                              */
/* -------------------------------------------------------------------------- */

export function handleMessage(request) {
  console.log(`Background received a message: ${request.type}`);
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
    case API.OPEN_CHANGE:
      return openChange(request);
  }
  return false;
}

/* ------------------------ Get Changes from Storage ------------------------ */

async function getChanges() {
  const changes = await Storage.getChanges();
  const updated = await Storage.getUpdatedChanges();

  let ids = new Set(updated.map((d) => d.id));
  let merged = [...updated, ...changes.filter((d) => !ids.has(d.id))];

  return Promise.resolve({ response: merged });
}

/* ------------------------ Add new Change to Storage ----------------------- */

async function addChange(request) {
  console.log(`addChange received data: ${request.data}`);
  const changes = await Storage.getChanges();
  const updated = [
    {
      id: request.data,
      codeReview: 0,
      verified: 0,
    },
    ...changes,
  ];

  // enable update service
  if (updated.length > 0 && polling === false) {
    await startService();
  }

  Storage.saveChanges(updated);
  return true;
}

/* ----------------- Remove one or more Changes from Storage ---------------- */

async function removeChanges(request) {
  console.log(`removeChanges received data: ${request.data}`);
  const changes = await Storage.getChanges();
  const updated = filter(changes, (o) => !request.data.includes(o.id));

  // disable update service
  if (updated.length == 0) {
    await stopService();
  }

  Storage.saveChanges(updated);
  return true;
}

/* ------------------------ Get Changes from Storage ------------------------ */

async function testEndpoint(request) {
  console.log(`testEndpoint received data: ${request.data}`);
  const { endpoint, credentials } = request.data;

  const result = await Gerrit.test(endpoint, credentials);
  return Promise.resolve({ response: result });
}

/* ------------------------- Restart Update Service ------------------------- */

async function triggerRestartService() {
  console.log(`restartService called`);
  if (polling != false) {
    restart = true;
  }

  return true;
}

/* --------------------- Get info about Config existence -------------------- */

async function existsConfig() {
  console.log(`existsConfig called`);
  const result = await Storage.isConfigSet();

  return Promise.resolve({ response: result });
}

/* ---------------------- Open Change-Id in a new page ---------------------- */

async function openChange(request) {
  console.log(`openChange received data: ${request.data}`);
  const options = await Storage.getOptions();

  if (options.endpoint !== undefined) {
    const url = `${options.endpoint}/${request.data}`;
    browser.tabs.create({
      url: url,
    });
  }

  return true;
}
