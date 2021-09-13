import API from "../scripts/api";
import mockChanges from "../scripts/background/mockData";

// browser.runtime.onInstalled.addListener((details) => {
//   console.log("previousVersion", details.previousVersion);
// });

// browser.browserAction.setBadgeText({
//   text: `3`,
// });

/* -------------------------------------------------------------------------- */
/*                               Message Handler                              */
/* -------------------------------------------------------------------------- */

function handleMessage(request, sender, sendResponse) {
  console.log(`background received a message: ${request.type}`);
  switch (request.type) {
    case API.GET_DATA:
      return getChanges();
  }
  return false;
}

browser.runtime.onMessage.addListener(handleMessage);

/* ------------------------ Get Changes from Storage ------------------------ */

function getChanges() {
  // TODO: get from storage
  return Promise.resolve({ response: mockChanges });
}

// TODO: remove, it was only for testing purpose
var dummy = setInterval(function () {
  browser.extension.sendMessage({ type: API.UPDATE_DATA, data: "hahahaha" });
  clearInterval(dummy);
}, 4000);
