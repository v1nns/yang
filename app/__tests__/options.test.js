import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import API from "../scripts/api";
import Options from "../scripts/components/options/options";

import {
  config,
  expectStorageSave,
  expectMessage,
  geti18nMessage,
  mockAnyi18nMessage,
  mockMessageReturnValue,
  mockStorageResolvedValue,
} from "./utils";

/* -------------------------------------------------------------------------- */
/*                                Empty Options                               */
/* -------------------------------------------------------------------------- */

describe("options without config", () => {
  beforeEach(() => {
    // Config saved in storage
    mockStorageResolvedValue("options", {});

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

  /* ------------------------------------------------------------------------ */

  test("test gerrit api with success", async () => {
    render(<Options />);

    // Get components from DOM
    const endpoint = screen
      .getByTestId("input-endpoint")
      .querySelector("input");
    const email = screen.getByTestId("input-email").querySelector("input");
    const password = screen
      .getByTestId("input-password")
      .querySelector("input");

    // Simulate a click on "credentials" accordion
    userEvent.click(screen.getByTestId("credentials"));

    // Simulate a user event typing endpoint, email address and HTTP password
    userEvent.type(endpoint, "https://hereweare.testing.it");
    userEvent.type(email, "johnny@b.goode");
    userEvent.type(password, "ultrasecretpassword");

    // Mock result when Option sends a TEST_ENDPOINT message
    mockMessageReturnValue(API.TEST_ENDPOINT, config, true);

    // Simulate a click on "credentials" accordion
    userEvent.click(screen.getByLabelText("test-config"));

    // Wait until snackbar appears with some status message
    await waitFor(() => screen.getByLabelText("snackbar"));

    // Check status message
    expect(screen.getByLabelText("snackbar")).toHaveTextContent(
      geti18nMessage("optionsMessageTestSuccess")
    );
  });

  /* ------------------------------------------------------------------------ */

  test("test gerrit api with error", async () => {
    render(<Options />);

    // Get components from DOM
    const endpoint = screen
      .getByTestId("input-endpoint")
      .querySelector("input");
    const email = screen.getByTestId("input-email").querySelector("input");
    const password = screen
      .getByTestId("input-password")
      .querySelector("input");

    // Simulate a click on "credentials" accordion
    userEvent.click(screen.getByTestId("credentials"));

    // Simulate a user event typing endpoint, email address and HTTP password
    userEvent.type(endpoint, "https://hereweare.testing.it");
    userEvent.type(email, "johnny@b.goode");
    userEvent.type(password, "ultrasecretpassword");

    // Mock result when Option sends a TEST_ENDPOINT message
    mockMessageReturnValue(API.TEST_ENDPOINT, config, false);

    // Simulate a click on "credentials" accordion
    userEvent.click(screen.getByLabelText("test-config"));

    // Wait until snackbar appears with some status message
    await waitFor(() => screen.getByLabelText("snackbar"));

    // Check status message
    expect(screen.getByLabelText("snackbar")).toHaveTextContent(
      geti18nMessage("optionsMessageTestFailed")
    );
  });

  /* ------------------------------------------------------------------------ */

  test("save credentials with success", async () => {
    render(<Options />);

    // Get components from DOM
    const endpoint = screen
      .getByTestId("input-endpoint")
      .querySelector("input");
    const email = screen.getByTestId("input-email").querySelector("input");
    const password = screen
      .getByTestId("input-password")
      .querySelector("input");

    // Simulate a click on "credentials" accordion
    userEvent.click(screen.getByTestId("credentials"));

    // Simulate a user event typing endpoint, email address and HTTP password
    userEvent.type(endpoint, "https://hereweare.testing.it");
    userEvent.type(email, "johnny@b.goode");
    userEvent.type(password, "ultrasecretpassword");

    // Simulate a click on "credentials" accordion
    userEvent.click(screen.getByLabelText("save-config"));

    // Create expectations
    expectStorageSave({ options: JSON.stringify(config) });
    expectMessage(API.RESTART_SERVICE);

    // Wait until snackbar appears with some status message
    await waitFor(() => screen.getByLabelText("snackbar"));

    // Check status message
    expect(screen.getByLabelText("snackbar")).toHaveTextContent(
      geti18nMessage("optionsMessageSaveSuccess")
    );
  });

  /* ------------------------------------------------------------------------ */

  test("save credentials with config missing", async () => {
    render(<Options />);

    // Get components from DOM
    const endpoint = screen
      .getByTestId("input-endpoint")
      .querySelector("input");
    const email = screen.getByTestId("input-email").querySelector("input");
    const password = screen
      .getByTestId("input-password")
      .querySelector("input");

    // Simulate a click on "credentials" accordion
    userEvent.click(screen.getByTestId("credentials"));

    // Simulate a user event typing email address and HTTP password
    userEvent.type(email, "johnny@b.goode");
    userEvent.type(password, "ultrasecretpassword");

    // Simulate a click on "credentials" accordion
    userEvent.click(screen.getByLabelText("save-config"));

    // Wait until snackbar appears with some status message
    await waitFor(() => screen.getByLabelText("snackbar"));

    // Check status message
    expect(screen.getByLabelText("snackbar")).toHaveTextContent(
      geti18nMessage("optionsMessageMissingConfig")
    );
  });

  /* ------------------------------------------------------------------------ */

  test("save credentials with wrong email", async () => {
    render(<Options />);

    // Get components from DOM
    const endpoint = screen
      .getByTestId("input-endpoint")
      .querySelector("input");
    const email = screen.getByTestId("input-email").querySelector("input");
    const password = screen
      .getByTestId("input-password")
      .querySelector("input");

    // Simulate a click on "credentials" accordion
    userEvent.click(screen.getByTestId("credentials"));

    // Simulate a user event typing endpoing, wrong email address and HTTP password
    userEvent.type(endpoint, "https://hereweare.testing.it");
    userEvent.type(email, "baby.shark");
    userEvent.type(password, "dododo");

    // Simulate a click on "credentials" accordion
    userEvent.click(screen.getByLabelText("save-config"));

    // Wait until snackbar appears with some status message
    await waitFor(() => screen.getByLabelText("snackbar"));

    // Check status message
    expect(screen.getByLabelText("snackbar")).toHaveTextContent(
      geti18nMessage("optionsMessageInvalidEmail")
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                          Options with some config                          */
/* -------------------------------------------------------------------------- */

describe("options with config", () => {
  beforeEach(() => {
    // Config saved in storage
    mockStorageResolvedValue("options", JSON.stringify(config));

    // Add implementation to return value for any i18n.getMessage call
    mockAnyi18nMessage();
  });

  /* ------------------------------------------------------------------------ */

  test("show saved config", async () => {
    render(<Options />);

    await waitFor(() =>
      expect(browser.storage.local.get).toBeCalledWith("options")
    );

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
    expect(endpoint.getAttribute("value")).toEqual(config.endpoint);
    expect(email.getAttribute("value")).toEqual(config.credentials.email);
    expect(password.getAttribute("value")).toEqual(config.credentials.password);

    // Credentials shouldn't be visible
    expect(email).not.toBeVisible();
    expect(password).not.toBeVisible();
  });
});
