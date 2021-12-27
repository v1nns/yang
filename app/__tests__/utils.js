import { when } from "jest-when";

/* -------------------------------------------------------------------------- */
/*                                    Utils                                   */
/* -------------------------------------------------------------------------- */

export function expectMessage(type, data) {
  const message = { type: type, ...(data !== undefined ? { data } : {}) };
  expect(browser.runtime.sendMessage).toBeCalledWith(message);
}

export function mockMessageReturnValue(type, data) {
  when(browser.runtime.sendMessage)
    .calledWith({
      type: type,
    })
    .mockReturnValue({ response: data });
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
