import { isEqual, remove } from "lodash";

import API, { Notifications } from "../../api";

import Gerrit from "./gerrit";
import Storage from "./storage";

/* -------------------------------------------------------------------------- */
/*                               Polling Service                              */
/* -------------------------------------------------------------------------- */

const polling = {
  async run(restart, restartService, stopService) {
    const existsConfig = await Storage.isConfigSet();
    if (!existsConfig) {
      // TODO: send some kind of notification telling about this
      await stopService();
      return;
    }

    let options = await Storage.getOptions();
    let changes = await Storage.getChanges();
    let updated = [];

    // Query on gerrit
    for (const [index, elem] of changes.entries()) {
      if (restart) {
        await restartService();
        return;
      }

      // Do not query if status is merged
      if (elem.status === "MERGED") {
        continue;
      }

      const result = await Gerrit.query(options, elem.id);

      if (result.error || !isEqual(elem, result)) {
        changes[index] = result;
        updated.push({ ...result, updated: true });
      }
    }

    if (restart) {
      await restartService();
      return;
    }

    // Save data and send message (if popup is open)
    if (updated.length > 0) {
      // In case there was any error, remove entry from cache
      // TODO: maybe inform it through notification
      remove(changes, (c) => c.error === true);

      // Update storage
      await Storage.saveChanges(changes);

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
        await Storage.saveUpdatedChanges(updated);

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
          // TODO: use dictionary here
          message: `Updated ${updated.length} Change-Id${
            updated.length > 1 ? "s" : ""
          }`,
        });
      }
    }

    // If there is no more chid to query, must disable the service
    const noChidToQuery = changes.every((obj) => obj.status === "MERGED");
    if (noChidToQuery) {
      await stopService();
    }
  },
};

function ignore() {
  console.log("ignoring");
}

export default polling;
