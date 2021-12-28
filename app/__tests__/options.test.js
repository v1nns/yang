import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { mockAnyi18nMessage, mockStorageReturnValue } from "./utils";
import Options from "../scripts/components/options/options";

/* -------------------------------------------------------------------------- */
/*                                Empty Options                               */
/* -------------------------------------------------------------------------- */

describe("options without config", () => {
  beforeEach(() => {
    // Config saved in storage
    mockStorageReturnValue("options", {});

    // Add implementation to return value for any i18n.getMessage call
    mockAnyi18nMessage();
  });

  /* ------------------------------------------------------------------------ */

  test("show empty config", async () => {
    render(<Options />);

    // Get components from DOM
    const refresh = screen.getByLabelText("refreshtime");
    const endpoint = screen
      .getByTestId("input-endpoint")
      .querySelector("input");
    const email = screen.getByTestId("input-email").querySelector("input");
    const password = screen
      .getByTestId("input-password")
      .querySelector("input");

    // Create expectations
    expect(refresh.getAttribute("aria-valuenow")).toEqual("30");
    expect(endpoint.getAttribute("value")).toEqual("");
    expect(email.getAttribute("value")).toEqual("");
    expect(password.getAttribute("value")).toEqual("");

    // Credentials shouldn't be visible
    expect(email).not.toBeVisible();
    expect(password).not.toBeVisible();
  });

  /* ------------------------------------------------------------------------ */

  test("open and show gerrit credential", async () => {
    render(<Options />);

    // Get components from DOM
    const email = screen.getByTestId("input-email").querySelector("input");
    const password = screen
      .getByTestId("input-password")
      .querySelector("input");

    // Simulate a click on "credentials" accordion
    userEvent.click(screen.getByTestId("credentials"));

    // Credentials should be visible
    expect(email).toBeVisible();
    expect(password).toBeVisible();
  });
});
