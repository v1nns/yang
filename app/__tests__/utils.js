import axios from "axios";
import { when } from "jest-when";

import { Notifications } from "../scripts/api";

// Mock Axios
jest.mock("axios");

/* -------------------------------------------------------------------------- */
/*                                 Dictionary                                 */
/* -------------------------------------------------------------------------- */

// By default, use EN language
// TODO: change this when multi-language gets supported
import messageDict from "../_locales/en/messages.json";

export function geti18nMessage(selector) {
  return messageDict[selector].message;
}

/* -------------------------------------------------------------------------- */
/*                                Expectations                                */
/* -------------------------------------------------------------------------- */

export function expectMessage(type, data) {
  const message = { type: type, ...(data !== undefined ? { data } : {}) };
  expect(browser.runtime.sendMessage).toBeCalledWith(message);
}

export function expectStorageSave(data) {
  expect(browser.storage.local.set).toBeCalledWith(data);
}

export function expectOpenNewPage(data) {
  expect(browser.tabs.create).toBeCalledWith(data);
}

export function expectCreateNotification(changesUpdated) {
  const message = `Updated ${changesUpdated} Change-Id${
    changesUpdated > 1 ? "s" : ""
  }`;

  expect(browser.browserAction.setBadgeText).toBeCalledWith({
    text: `${changesUpdated}`,
  });

  expect(browser.notifications.create).toBeCalledWith(
    Notifications.CHANGE_UPDATE,
    {
      type: "basic",
      priority: 1,
      iconUrl: browser.runtime.getURL("images/icon-128.png"),
      title: "Yet Another Notifier for Gerrit",
      message: message,
    }
  );
}

/* -------------------------------------------------------------------------- */
/*                             Mock Initialization                            */
/* -------------------------------------------------------------------------- */

export function initNotificationMock() {
  browser.extension.getViews = jest.fn();
  browser.browserAction.setBadgeText = jest.fn();
  browser.notifications.create = jest.fn();
}

export function destroyNotificationMock() {
  browser.extension.getViews.mockRestore();
  browser.browserAction.setBadgeText.mockRestore();
  browser.notifications.create.mockRestore();
}

/* -------------------------------------------------------------------------- */
/*                             Mock Return Values                             */
/* -------------------------------------------------------------------------- */

export function mockMessageReturnValue(type, data, result) {
  const message = { type: type, ...(data !== undefined ? { data } : {}) };
  when(browser.runtime.sendMessage)
    .calledWith(message)
    .mockReturnValue({ response: result });
}

export function mockStorageValueOnce(name, data) {
  when(browser.storage.local.get)
    .calledWith(name)
    .mockResolvedValueOnce({ [name]: data });
}

export function mockStorageValue(name, data) {
  when(browser.storage.local.get)
    .calledWith(name)
    .mockResolvedValue({ [name]: data });
}

export function mockAnyi18nMessage() {
  when(browser.i18n.getMessage).mockImplementation((selector) =>
    geti18nMessage(selector)
  );
}

export function mockPopupState(opened) {
  const result = opened ? [1] : [];
  when(browser.extension.getViews)
    .calledWith({ type: "popup" })
    .mockReturnValue(result);
}

/* -------------------------------------------------------------------------- */
/*                          HTTP requests using Axios                         */
/* -------------------------------------------------------------------------- */

export function mockResolvedAxiosGetOnce(url, options, result) {
  when(axios.get)
    .calledWith(
      url,
      {},
      {
        auth: {
          username: options.credentials.email,
          password: options.credentials.password,
        },
      }
    )
    .mockResolvedValueOnce(result);
}

export function mockRejectedAxiosGetOnce(url, options, result) {
  when(axios.get)
    .calledWith(
      url,
      {},
      {
        auth: {
          username: options.credentials.email,
          password: options.credentials.password,
        },
      }
    )
    .mockRejectedValueOnce({ response: result });
}
