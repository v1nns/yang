import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import API from "../scripts/api";
import { ThemeDark } from "../scripts/components/popup/theme";
import Popup from "../scripts/components/popup/popup";

import {
  expectMessage,
  mockAnyi18nMessage,
  mockMessageReturnValue,
  toLabelName,
} from "./utils";
import { chids, multipleChids } from "./mock";

/* -------------------------------------------------------------------------- */
/*                                 Empty Popup                                */
/* -------------------------------------------------------------------------- */

describe("popup with no change-ids", () => {
  beforeEach(() => {
    mockMessageReturnValue(API.EXISTS_CONFIG, undefined, false);
    mockMessageReturnValue(API.GET_DATA, undefined, {});

    // Add implementation to return value for any i18n.getMessage call
    mockAnyi18nMessage();
  });

  /* ------------------------------------------------------------------------ */

  test("change style on dark mode", async () => {
    render(<Popup isTesting={true} />);

    // Simulate a click on Dark Mode button
    userEvent.click(screen.getByLabelText("dark-mode"));

    // Expect background color to change
    await waitFor(() =>
      expect(screen.getByLabelText("popup")).toHaveStyle(
        `background-color: ${ThemeDark.background}`
      )
    );
  });

  /* ------------------------------------------------------------------------ */

  test("open settings", async () => {
    render(<Popup isTesting={true} />);

    // Simulate a click on Settings button
    userEvent.click(screen.getByLabelText("settings"));

    // Expect webextension api to be called
    await waitFor(() => expect(browser.runtime.openOptionsPage).toBeCalled());
  });

  /* ------------------------------------------------------------------------ */

  test("show text about empty settings", async () => {
    render(<Popup isTesting={true} />);

    // Popup asks background service for chids
    await waitFor(() => {
      expectMessage(API.EXISTS_CONFIG);
      expectMessage(API.GET_DATA);
    });

    const actionButtons = screen.getAllByLabelText("table-action");

    // Context action buttons must be disabled
    expect(actionButtons).toHaveLength(2);
    expect(actionButtons[0]).toBeDisabled();
    expect(actionButtons[1]).toBeDisabled();

    const tableInfo = screen.getAllByLabelText("table-info");

    // Table info must show message about empty settings
    expect(tableInfo).toHaveLength(2);
    expect(tableInfo[0]).toHaveTextContent("Empty Settings");
    expect(tableInfo[1]).toHaveTextContent(
      "Before you can add a Change-Id, you need to configure Gerrit."
    );
  });

  /* ------------------------------------------------------------------------ */

  test("show text about empty data", async () => {
    mockMessageReturnValue(API.EXISTS_CONFIG, undefined, true);

    render(<Popup isTesting={true} />);

    // Popup asks background service for chids
    await waitFor(() => {
      expectMessage(API.EXISTS_CONFIG);
      expectMessage(API.GET_DATA);
    });

    const actionButtons = screen.getAllByLabelText("table-action");

    // Context action buttons must be disabled
    expect(actionButtons).toHaveLength(2);
    expect(actionButtons[0]).toBeEnabled();
    expect(actionButtons[1]).toBeEnabled();

    const tableInfo = screen.getAllByLabelText("table-info");

    // Table info must show message about empty data
    expect(tableInfo).toHaveLength(2);
    expect(tableInfo[0]).toHaveTextContent("Empty Data");
    expect(tableInfo[1]).toHaveTextContent("Add new Change-Id to show here.");
  });
});

/* -------------------------------------------------------------------------- */
/*                            Popup containing data                           */
/* -------------------------------------------------------------------------- */

describe("popup with change-ids", () => {
  beforeEach(() => {
    console.log = jest.fn();
    mockMessageReturnValue(API.EXISTS_CONFIG, undefined, true);
    mockMessageReturnValue(API.GET_DATA, undefined, chids);

    // Add implementation to return value for any i18n.getMessage call
    mockAnyi18nMessage();
  });

  /* ------------------------------------------------------------------------ */

  test("show change-ids and action buttons are enabled", async () => {
    render(<Popup isTesting={true} />);

    // In the first render, popup asks background service for chids
    await waitFor(() => {
      expectMessage(API.EXISTS_CONFIG);
      expectMessage(API.GET_DATA);
    });

    const rows = screen.queryAllByRole("row");

    // Check TableHead row
    expect(rows[0]).toHaveTextContent("ID");
    expect(rows[0]).toHaveTextContent("Subject");
    expect(rows[0]).toHaveTextContent("CR");
    expect(rows[0]).toHaveTextContent("V");

    // Skip table header row (that's why the "+ 1")
    for (const [index, elem] of chids.entries()) {
      expect(rows[index + 1]).toHaveTextContent(elem.id);
      expect(rows[index + 1]).toHaveTextContent(elem.subject);

      const labelCR = toLabelName(elem.codeReview);
      const codeReview = within(rows[index + 1]).getByLabelText(labelCR);
      expect(codeReview).not.toBeNull();

      const labelV = toLabelName(elem.verified);
      const verified = within(rows[index + 1]).getByLabelText(labelV);
      expect(verified).not.toBeNull();
    }
  });

  /* ------------------------------------------------------------------------ */

  test("add a new change-id", async () => {
    render(<Popup isTesting={true} />);

    // Wait until render action buttons
    await waitFor(() => screen.getAllByLabelText("table-action"));

    // Get add a new change button
    const buttonAddChange = screen.getAllByLabelText("table-action")[0];

    // Simulate a click on button to add a new change
    userEvent.click(buttonAddChange);

    // Expect for input component to be shown
    await waitFor(() => screen.getByLabelText("input-change"));

    // Simulate a user event typing chid
    userEvent.type(screen.getByLabelText("input-change"), "123456");

    // Cleanup any mock call to webextension api
    browser.runtime.sendMessage.mockClear();

    // Simulate button click to add new change
    userEvent.click(screen.getByLabelText("save-change"));

    // Popup will send a message informing to add new change
    await waitFor(() => expectMessage(API.ADD_CHANGE, "123456"));
  });

  /* ------------------------------------------------------------------------ */

  test("open input to add a new change-id and discard operation", async () => {
    render(<Popup isTesting={true} />);

    // Wait until render action buttons
    await waitFor(() => screen.getAllByLabelText("table-action"));

    // Get add a new change button
    const buttonAddChange = screen.getAllByLabelText("table-action")[0];

    // Simulate a click on button to add a new change
    userEvent.click(buttonAddChange);

    // Expect for input component to be shown
    await waitFor(() => screen.getByLabelText("input-change"));

    // Simulate a user event typing chid
    userEvent.type(screen.getByLabelText("input-change"), "123456");

    // Cleanup any mock call to webextension api
    browser.runtime.sendMessage.mockClear();

    // Simulate button click to add new change
    userEvent.click(screen.getByLabelText("discard-change"));

    // Input field must not exist anymore
    const inputChange = screen.queryByLabelText("input-change");
    expect(inputChange).toBeNull();

    // And no message should be sent
    expect(browser.runtime.sendMessage).not.toBeCalled();
  });

  /* ------------------------------------------------------------------------ */

  test("remove a change-id", async () => {
    render(<Popup isTesting={true} />);

    // Wait until render action buttons
    await waitFor(() => screen.getAllByLabelText("table-action"));

    // Get selection mode button
    const buttonSelectionMode = screen.getAllByLabelText("table-action")[1];

    // Simulate a click for toggling selection mode
    userEvent.click(buttonSelectionMode);

    // Get specific checkbox
    const checkbox = screen.getByLabelText(`select-row-${chids[1].id}`);

    // Cleanup any mock call to webextension api
    browser.runtime.sendMessage.mockClear();

    // Simulate button click on checkbox
    userEvent.click(checkbox);

    // Simulate button click to remove change
    const buttonDelete = screen.getByLabelText("delete-changes");
    userEvent.click(buttonDelete);

    // Popup will send a message informing to remove change
    await waitFor(() => expectMessage(API.REMOVE_CHANGES, [chids[1].id]));

    // Expect three rows (header and two chids)
    expect(screen.queryAllByRole("row")).toHaveLength(3);
  });

  /* ------------------------------------------------------------------------ */

  test("remove two change-ids", async () => {
    render(<Popup isTesting={true} />);

    // Wait until render action buttons
    await waitFor(() => screen.getAllByLabelText("table-action"));

    // Get selection mode button
    const buttonSelectionMode = screen.getAllByLabelText("table-action")[1];

    // Simulate a click for toggling selection mode
    userEvent.click(buttonSelectionMode);

    // Get specific checkbox
    const checkbox1 = screen.getByLabelText(`select-row-${chids[1].id}`);
    const checkbox2 = screen.getByLabelText(`select-row-${chids[2].id}`);

    // Cleanup any mock call to webextension api
    browser.runtime.sendMessage.mockClear();

    // Simulate button click on checkboxes
    userEvent.click(checkbox1);
    userEvent.click(checkbox2);

    // Simulate button click to remove change
    const buttonDelete = screen.getByLabelText("delete-changes");
    userEvent.click(buttonDelete);

    // Popup will send a message informing to remove change
    await waitFor(() =>
      expectMessage(API.REMOVE_CHANGES, [chids[2].id, chids[1].id])
    );

    // Expect two rows (header and one chid)
    expect(screen.queryAllByRole("row")).toHaveLength(2);
  });

  /* ------------------------------------------------------------------------ */

  test("remove all change-ids", async () => {
    render(<Popup isTesting={true} />);

    // Wait until render action buttons
    await waitFor(() => screen.getAllByLabelText("table-action"));

    // Get selection mode button
    const buttonSelectionMode = screen.getAllByLabelText("table-action")[1];

    // Simulate a click for toggling selection mode
    userEvent.click(buttonSelectionMode);

    // Get specific checkbox
    const checkboxes = screen.getByLabelText("select-all-rows");

    // Cleanup any mock call to webextension api
    browser.runtime.sendMessage.mockClear();

    // Simulate button click on checkboxes
    userEvent.click(checkboxes);

    // Simulate button click to remove change
    const buttonDelete = screen.getByLabelText("delete-changes");
    userEvent.click(buttonDelete);

    // Popup will send a message informing to remove change
    await waitFor(() =>
      expectMessage(API.REMOVE_CHANGES, [chids[0].id, chids[1].id, chids[2].id])
    );

    // Expect no rows
    expect(screen.queryAllByRole("row")).toHaveLength(0);

    const tableInfo = screen.getAllByLabelText("table-info");

    // Table info must show message about empty data
    expect(tableInfo).toHaveLength(2);
    expect(tableInfo[0]).toHaveTextContent("Empty Data");
    expect(tableInfo[1]).toHaveTextContent("Add new Change-Id to show here.");
  });

  /* ------------------------------------------------------------------------ */

  test("add a new change-id and receive a success update", async () => {
    render(<Popup isTesting={true} />);

    // Wait until render action buttons
    await waitFor(() => screen.getAllByLabelText("table-action"));

    // Get add a new change button
    const buttonAddChange = screen.getAllByLabelText("table-action")[0];

    // Simulate a click on button to add a new change
    userEvent.click(buttonAddChange);

    // Expect for input component to be shown
    await waitFor(() => screen.getByLabelText("input-change"));

    // Simulate a user event typing chid
    userEvent.type(screen.getByLabelText("input-change"), "223344");

    // Cleanup any mock call to webextension api
    browser.runtime.sendMessage.mockClear();

    // Simulate button click to add new change
    userEvent.click(screen.getByLabelText("save-change"));

    // Popup will send a message informing to add new change
    await waitFor(() => expectMessage(API.ADD_CHANGE, "223344"));

    const dummy = {
      subject: "Some dummy change here",
      status: "NEW",
      id: "223344",
      verified: 1,
      codeReview: 1,
    };

    // Simulate a message from background and wait for state update on popup
    await waitFor(() => {
      browser.runtime.sendMessage({ type: API.UPDATE_DATA, data: [dummy] });
      expectMessage(API.UPDATE_DATA, [dummy]);
    });

    const rows = screen.queryAllByRole("row");

    // Expect 5 rows (header + 3 chids + new chid )
    expect(rows).toHaveLength(5);

    // First row after table header
    expect(rows[1]).toHaveTextContent(dummy.id);
    expect(rows[1]).toHaveTextContent(dummy.subject);
  });

  /* ------------------------------------------------------------------------ */

  test("add a new change-id and receive a fail update", async () => {
    render(<Popup isTesting={true} />);

    // Wait until render action buttons
    await waitFor(() => screen.getAllByLabelText("table-action"));

    // Get add a new change button
    const buttonAddChange = screen.getAllByLabelText("table-action")[0];

    // Simulate a click on button to add a new change
    userEvent.click(buttonAddChange);

    // Expect for input component to be shown
    await waitFor(() => screen.getByLabelText("input-change"));

    // Simulate a user event typing chid
    userEvent.type(screen.getByLabelText("input-change"), "223344");

    // Cleanup any mock call to webextension api
    browser.runtime.sendMessage.mockClear();

    // Simulate button click to add new change
    userEvent.click(screen.getByLabelText("save-change"));

    // Popup will send a message informing to add new change
    await waitFor(() => expectMessage(API.ADD_CHANGE, "223344"));

    const dummy = {
      id: "223344",
      error: true,
    };

    // Simulate a message from background and wait for state update on popup
    await waitFor(() => {
      browser.runtime.sendMessage({ type: API.UPDATE_DATA, data: [dummy] });
      expectMessage(API.UPDATE_DATA, [dummy]);
    });

    // Expect 5 rows (header + 3 chids + new chid)
    expect(screen.queryAllByRole("row")).toHaveLength(5);

    // Popup removes it after 2 seconds ("css" animation)
    await waitFor(() => {
      // Expect 4 rows (header + 3 chids)
      expect(screen.queryAllByRole("row")).toHaveLength(4);
    });
  });

  /* ------------------------------------------------------------------------ */

  test("add two change-ids and receive a success update", async () => {
    render(<Popup isTesting={true} />);

    // Wait until render action buttons
    await waitFor(() => screen.getAllByLabelText("table-action"));

    // Get add a new change button
    const buttonAddChange = screen.getAllByLabelText("table-action")[0];

    // Simulate a click on button to add a new change
    userEvent.click(buttonAddChange);

    // Expect for input component to be shown
    await waitFor(() => screen.getByLabelText("input-change"));

    // Simulate a user event typing chid
    userEvent.type(screen.getByLabelText("input-change"), "223344");

    // Cleanup any mock call to webextension api
    browser.runtime.sendMessage.mockClear();

    // Simulate button click to add new change
    userEvent.click(screen.getByLabelText("save-change"));

    // Popup will send a message informing to add new change
    await waitFor(() => expectMessage(API.ADD_CHANGE, "223344"));

    // Simulate a click on button to add a second change
    userEvent.click(buttonAddChange);

    // Expect for input component to be shown
    await waitFor(() => screen.getByLabelText("input-change"));

    // Simulate a user event typing chid
    userEvent.type(screen.getByLabelText("input-change"), "556677");

    // Cleanup any mock call to webextension api
    browser.runtime.sendMessage.mockClear();

    // Simulate button click to add new change
    userEvent.click(screen.getByLabelText("save-change"));

    // Popup will send a message informing to add new change
    await waitFor(() => expectMessage(API.ADD_CHANGE, "556677"));

    const dummies = [
      {
        subject: "Some dummy change here",
        status: "NEW",
        id: "223344",
        verified: 1,
        codeReview: 1,
      },
      {
        subject: "Another dummy change",
        status: "MERGED",
        id: "556677",
        verified: 1,
        codeReview: 2,
      },
    ];

    // Simulate a message from background and wait for state update on popup
    await waitFor(() => {
      browser.runtime.sendMessage({ type: API.UPDATE_DATA, data: dummies });
      expectMessage(API.UPDATE_DATA, dummies);
    });

    const rows = screen.queryAllByRole("row");

    // Expect 6 rows (header + 3 chids + 2 new chids )
    expect(rows).toHaveLength(6);

    // First and second rows after table header
    expect(rows[1]).toHaveTextContent(dummies[1].id);
    expect(rows[1]).toHaveTextContent(dummies[1].subject);
    expect(rows[2]).toHaveTextContent(dummies[0].id);
    expect(rows[2]).toHaveTextContent(dummies[0].subject);
  });

  /* ------------------------------------------------------------------------ */

  test("add two change-ids and receive a fail update", async () => {
    render(<Popup isTesting={true} />);

    // Wait until render action buttons
    await waitFor(() => screen.getAllByLabelText("table-action"));

    // Get add a new change button
    const buttonAddChange = screen.getAllByLabelText("table-action")[0];

    // Simulate a click on button to add a new change
    userEvent.click(buttonAddChange);

    // Expect for input component to be shown
    await waitFor(() => screen.getByLabelText("input-change"));

    // Simulate a user event typing chid
    userEvent.type(screen.getByLabelText("input-change"), "223344");

    // Cleanup any mock call to webextension api
    browser.runtime.sendMessage.mockClear();

    // Simulate button click to add new change
    userEvent.click(screen.getByLabelText("save-change"));

    // Popup will send a message informing to add new change
    await waitFor(() => expectMessage(API.ADD_CHANGE, "223344"));

    // Simulate a click on button to add a second change
    userEvent.click(buttonAddChange);

    // Expect for input component to be shown
    await waitFor(() => screen.getByLabelText("input-change"));

    // Simulate a user event typing chid
    userEvent.type(screen.getByLabelText("input-change"), "556677");

    // Cleanup any mock call to webextension api
    browser.runtime.sendMessage.mockClear();

    // Simulate button click to add new change
    userEvent.click(screen.getByLabelText("save-change"));

    // Popup will send a message informing to add new change
    await waitFor(() => expectMessage(API.ADD_CHANGE, "556677"));

    const dummies = [
      {
        id: "223344",
        error: true,
      },
      {
        id: "556677",
        error: true,
      },
    ];

    // Simulate a message from background and wait for state update on popup
    await waitFor(() => {
      browser.runtime.sendMessage({ type: API.UPDATE_DATA, data: dummies });
      expectMessage(API.UPDATE_DATA, dummies);
    });

    // Expect 6 rows (header + 3 chids + 2 new chids)
    expect(screen.queryAllByRole("row")).toHaveLength(6);

    // Popup removes it after 2 seconds ("css" animation)
    await waitFor(() => {
      // Expect 4 rows (header + 3 chids)
      expect(screen.queryAllByRole("row")).toHaveLength(4);
    });
  });

  /* ------------------------------------------------------------------------ */

  test("add two change-ids and receive a mixed update", async () => {
    render(<Popup isTesting={true} />);

    // Wait until render action buttons
    await waitFor(() => screen.getAllByLabelText("table-action"));

    // Get add a new change button
    const buttonAddChange = screen.getAllByLabelText("table-action")[0];

    // Simulate a click on button to add a new change
    userEvent.click(buttonAddChange);

    // Expect for input component to be shown
    await waitFor(() => screen.getByLabelText("input-change"));

    // Simulate a user event typing chid
    userEvent.type(screen.getByLabelText("input-change"), "223344");

    // Cleanup any mock call to webextension api
    browser.runtime.sendMessage.mockClear();

    // Simulate button click to add new change
    userEvent.click(screen.getByLabelText("save-change"));

    // Popup will send a message informing to add new change
    await waitFor(() => expectMessage(API.ADD_CHANGE, "223344"));

    // Simulate a click on button to add a second change
    userEvent.click(buttonAddChange);

    // Expect for input component to be shown
    await waitFor(() => screen.getByLabelText("input-change"));

    // Simulate a user event typing chid
    userEvent.type(screen.getByLabelText("input-change"), "556677");

    // Cleanup any mock call to webextension api
    browser.runtime.sendMessage.mockClear();

    // Simulate button click to add new change
    userEvent.click(screen.getByLabelText("save-change"));

    // Popup will send a message informing to add new change
    await waitFor(() => expectMessage(API.ADD_CHANGE, "556677"));

    const dummies = [
      {
        id: "223344",
        error: true,
      },
      {
        subject: "Another dummy change",
        status: "MERGED",
        id: "556677",
        verified: 1,
        codeReview: 2,
      },
    ];

    // Simulate a message from background and wait for state update on popup
    await waitFor(() => {
      browser.runtime.sendMessage({ type: API.UPDATE_DATA, data: dummies });
      expectMessage(API.UPDATE_DATA, dummies);
    });

    // Expect 6 rows (header + 3 chids + 2 new chids)
    expect(screen.queryAllByRole("row")).toHaveLength(6);

    // Popup removes it after 2 seconds ("css" animation)
    await waitFor(() => {
      // Expect 4 rows (header + 3 chids + new chid)
      expect(screen.queryAllByRole("row")).toHaveLength(5);
    });
  });
});

/* ------------------------------------------------------------------------ */
/*                     Popup with a bigger list of chids                    */
/* ------------------------------------------------------------------------ */

describe("popup with multiple pages", () => {
  beforeEach(() => {
    console.log = jest.fn();
    mockMessageReturnValue(API.EXISTS_CONFIG, undefined, true);
    mockMessageReturnValue(API.GET_DATA, undefined, multipleChids);

    // Add implementation to return value for any i18n.getMessage call
    mockAnyi18nMessage();
  });

  /* ------------------------------------------------------------------------ */

  test("go to second page", async () => {
    render(<Popup isTesting={true} />);

    // Wait until render rows
    await waitFor(() => screen.queryAllByRole("row"));

    let rows = screen.queryAllByRole("row");

    // Expect 6 rows (header + 5 chids)
    expect(rows).toHaveLength(6);

    // Expect the first 5 change-ids to be visible
    for (let i = 0, len = multipleChids.length - 1; i < len; i++) {
      expect(rows[i + 1]).toHaveTextContent(multipleChids[i].subject);
      expect(rows[i + 1]).toBeVisible();
    }

    // Get next page button
    const buttonNextPage = screen.getByLabelText("next-page");

    // Simulate a click on button to next page
    userEvent.click(buttonNextPage);

    await waitFor(() => {
      // Expect 2 rows (header + 1 chid)
      expect(screen.queryAllByRole("row")).toHaveLength(2);
    });

    rows = screen.queryAllByRole("row");

    // Expect only the last change-id to be visible
    expect(rows[1]).toHaveTextContent(multipleChids[5].subject);
    expect(rows[1]).toBeVisible();
  });

  /* ------------------------------------------------------------------------ */

  test("go to second page and go back to the first page", async () => {
    render(<Popup isTesting={true} />);

    // Wait until render rows
    await waitFor(() => screen.queryAllByRole("row"));

    let rows = screen.queryAllByRole("row");

    // Expect 6 rows (header + 5 chids)
    expect(rows).toHaveLength(6);

    // Expect the first 5 change-ids to be visible
    for (let i = 0, len = multipleChids.length - 1; i < len; i++) {
      expect(rows[i + 1]).toHaveTextContent(multipleChids[i].subject);
      expect(rows[i + 1]).toBeVisible();
    }

    // Get next page button
    const buttonNextPage = screen.getByLabelText("next-page");

    // Simulate a click on button to next page
    userEvent.click(buttonNextPage);

    await waitFor(() => {
      // Expect 2 rows (header + 1 chid)
      expect(screen.queryAllByRole("row")).toHaveLength(2);
    });

    // Get previous page button
    const buttonPreviousPage = screen.getByLabelText("previous-page");

    // Simulate a click on button to next page
    userEvent.click(buttonPreviousPage);

    await waitFor(() => {
      // Expect 6 rows (header + 5 chids)
      expect(screen.queryAllByRole("row")).toHaveLength(6);
    });

    rows = screen.queryAllByRole("row");

    // Expect the first 5 change-ids to be visible again
    for (let i = 0, len = multipleChids.length - 1; i < len; i++) {
      expect(rows[i + 1]).toHaveTextContent(multipleChids[i].subject);
      expect(rows[i + 1]).toBeVisible();
    }
  });
});
