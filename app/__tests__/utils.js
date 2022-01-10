import axios from "axios";
import { when } from "jest-when";

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

/* -------------------------------------------------------------------------- */
/*                               Mock Functions                               */
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
  const result = opened ? 1 : 0;
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
    .mockResolvedValueOnce({ response: result });
}

/* -------------------------------------------------------------------------- */
/*                                  Mock Data                                 */
/* -------------------------------------------------------------------------- */

export const chids = [
  {
    subject: "Expose index of the group for a line",
    status: "NEW",
    id: "326205",
    verified: -1,
    codeReview: 0,
  },
  {
    subject: "Validate reviewer filters",
    status: "NEW",
    id: "269047",
    verified: 1,
    codeReview: 0,
  },
  {
    subject: "Abstract Publisher/Subscriber into generic interfaces",
    status: "MERGED",
    id: "321037",
    verified: 1,
    codeReview: 2,
  },
];

export const config = {
  refreshTime: 30,
  endpoint: "https://hereweare.testing.it",
  credentials: {
    email: "johnny@b.goode",
    password: "ultrasecretpassword",
  },
};
