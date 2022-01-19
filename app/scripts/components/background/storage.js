import { isEmpty } from "lodash";

/* -------------------------------------------------------------------------- */
/*                            Browser Storage Utils                           */
/* -------------------------------------------------------------------------- */

const storage = {
  clear() {
    browser.browserAction.setBadgeText({
      text: ``,
    });
    browser.storage.local.set({ changes: [] });
  },

  /* ------------------------------------------------------------------------ */

  saveChanges(data) {
    browser.storage.local.set({ changes: JSON.stringify(data) });
  },

  /* ------------------------------------------------------------------------ */

  saveUpdatedChanges(data) {
    browser.storage.local.set({
      updated: data !== null ? JSON.stringify(data) : [],
    });
  },

  /* ------------------------------------------------------------------------ */

  getChanges() {
    return browser.storage.local
      .get("changes")
      .then((result) =>
        !isEmpty(result.changes) ? JSON.parse(result.changes) : []
      );
  },

  /* ------------------------------------------------------------------------ */

  getUpdatedChanges() {
    const updated = browser.storage.local
      .get("updated")
      .then((result) =>
        !isEmpty(result.updated) ? JSON.parse(result.updated) : []
      );

    // Just clear it
    this.saveUpdatedChanges(null);
    return updated;
  },

  /* ------------------------------------------------------------------------ */

  getOptions() {
    return browser.storage.local
      .get("options")
      .then((result) =>
        !isEmpty(result.options) ? JSON.parse(result.options) : {}
      );
  },

  /* ------------------------------------------------------------------------ */

  async isConfigSet() {
    // TODO: maybe improve this and change for something like "validateConfig"
    const options = await this.getOptions();
    const existsConfig =
      !isEmpty(options) &&
      options.endpoint.length > 0 &&
      options.credentials.email.length > 0 &&
      options.credentials.password.length > 0;

    return existsConfig;
  },

  /* ------------------------------------------------------------------------ */

  isChangeEmpty(elem) {
    if (elem.subject !== undefined && elem.status !== undefined) {
      return false;
    }
    return true;
  },
};

export default storage;
