import { when } from "jest-when";

// By default, use EN language
// TODO: change this when multi-language is supported
import messageDict from "../_locales/en/messages.json";

/* -------------------------------------------------------------------------- */
/*                                    Utils                                   */
/* -------------------------------------------------------------------------- */

export function expectMessage(type, data) {
  const message = { type: type, ...(data !== undefined ? { data } : {}) };
  expect(browser.runtime.sendMessage).toBeCalledWith(message);
}

export function mockMessageReturnValue(type, data, result) {
  const message = { type: type, ...(data !== undefined ? { data } : {}) };
  when(browser.runtime.sendMessage)
    .calledWith(message)
    .mockReturnValue({ response: result });
}

export function mockStorageResolvedValue(name, data) {
  when(browser.storage.local.get)
    .calledWith(name)
    .mockResolvedValueOnce({ [name]: data });
}

export function mockAnyi18nMessage() {
  when(browser.i18n.getMessage).mockImplementation((selector) =>
    geti18nMessage(selector)
  );
}

export function geti18nMessage(selector) {
  return messageDict[selector].message;
}

export const cleanup = () => {
  browser.runtime.sendMessage.mockClear();
};

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
