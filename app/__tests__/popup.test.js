import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { when } from "jest-when";

import API from "../scripts/api";
import { ThemeDark } from "../scripts/components/popup/theme";
import Popup from "../scripts/components/popup/popup";

/* -------------------------------------------------------------------------- */
/*                                 Empty Popup                                */
/* -------------------------------------------------------------------------- */

describe("popup with no chids", () => {
  beforeEach(() => {
    when(browser.runtime.sendMessage)
      .calledWith({
        type: API.GET_DATA,
      })
      .mockReturnValue({ response: {} });
  });

  /* ------------------------------------------------------------------------ */

  test("change style on dark mode", async () => {
    render(<Popup />);

    // Popup asks background service for chids
    await waitFor(() => {
      expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
        type: API.GET_DATA,
      });
    });

    // Simulate a click on Dark Mode button
    fireEvent.click(screen.getByLabelText("darkmode"));

    // Expect background color to change
    await waitFor(() => {
      expect(screen.getByLabelText("popup")).toHaveStyle(
        `background-color: ${ThemeDark.background}`
      );
    });
  });

  /* ------------------------------------------------------------------------ */

  test("open settings", async () => {
    render(<Popup />);

    // Popup asks background service for chids
    await waitFor(() => {
      expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
        type: API.GET_DATA,
      });
    });

    // Simulate a click on Settings button
    fireEvent.click(screen.getByLabelText("settings"));

    // Expect background color to change
    await waitFor(() => {
      expect(browser.runtime.openOptionsPage).toBeCalled();
    });
  });

  /* ------------------------------------------------------------------------ */

  test("show text about empty data", async () => {
    render(<Popup />);

    // Popup asks background service for chids
    await waitFor(() => {
      expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
        type: API.GET_DATA,
      });

      expect(screen.getByLabelText("table")).toHaveTextContent("Empty data");
      expect(screen.getByLabelText("table")).toHaveTextContent(
        "Add a Change-Id and it will show up here."
      );
    });
  });
});
