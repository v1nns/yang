import axios from "axios";

import API from "../scripts/api";
import {
  chids,
  config,
  expectStorageSave,
  mockStorageResolvedValue,
} from "./utils";
import {
  init,
  handleMessage,
  polling,
  restart,
} from "../scripts/components/background/background";

// Mock Axios
jest.mock("axios");

/* -------------------------------------------------------------------------- */
/*                             Background Service                             */
/* -------------------------------------------------------------------------- */

describe("background service with empty config", () => {
  beforeAll(() => {
    // console.log = jest.fn();
    mockStorageResolvedValue("options", {});
  });

  /* ------------------------------------------------------------------------ */

  test("should not start gerrot polling service", async () => {
    // Mock storage to return a list of change-ids
    mockStorageResolvedValue("changes", JSON.stringify(chids));

    await init();

    expect(browser.runtime.onMessage.addListener).toBeCalled();
    expect(polling).toBe(null);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive get data message without any change-id", async () => {
    // Mock storage to return a list of change-ids
    mockStorageResolvedValue("changes", []);
    mockStorageResolvedValue("updated", []);

    const request = { type: API.GET_DATA };
    const result = await handleMessage(request);

    expect(result).toEqual({ response: [] });
    expect(polling).toBe(null);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive get data message without updates", async () => {
    // Mock storage to return a list of change-ids
    mockStorageResolvedValue("changes", JSON.stringify(chids));
    mockStorageResolvedValue("updated", []);

    const request = { type: API.GET_DATA };
    const result = await handleMessage(request);

    expect(result).toEqual({ response: chids });
    expect(polling).toBe(null);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive get data message with updates", async () => {
    // Get a random chid and enable updated flag and split into two arrays
    const chid = { ...chids[1], updated: true };
    const updated = [chid];
    const notUpdated = [chids[0], chids[2]];

    // Mock storage to return a list of change-ids
    mockStorageResolvedValue("changes", JSON.stringify(chids));
    mockStorageResolvedValue("updated", JSON.stringify(updated));

    const request = { type: API.GET_DATA };
    const result = await handleMessage(request);

    // Response must have both arrays merged (updated and notUpdated)
    expect(result).toEqual({ response: [...updated, ...notUpdated] });
    expect(polling).toBe(null);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive add change message", async () => {
    const request = {
      type: API.ADD_CHANGE,
      data: 12345,
    };

    const result = await handleMessage(request);

    expect(result).toBe(true);
    expect(polling).toBe(null);
  });

  /* ------------------------------------------------------------------------ */

  test("receive remove changes message", async () => {
    // Mock storage to return a list of change-ids
    mockStorageResolvedValue("changes", JSON.stringify(chids));

    const request = { type: API.REMOVE_CHANGES, data: ["326205"] };
    const result = await handleMessage(request);

    // Create expectation for storage save
    const updated = [chids[1], chids[2]];
    expectStorageSave({ changes: JSON.stringify(updated) });

    expect(result).toBe(true);
    expect(polling).toBe(null);
  });

  /* ------------------------------------------------------------------------ */

  test("receive test endpoint message and return with success", async () => {
    const request = {
      type: API.TEST_ENDPOINT,
      data: { endpoint: config.endpoint, credentials: config.credentials },
    };

    axios.get.mockResolvedValueOnce({ status: 200, data: {} });
    const result = await handleMessage(request);

    expect(axios.get).toBeCalled();
    expect(result).toEqual({ response: true });
    expect(polling).toBe(null);
  });

  /* ------------------------------------------------------------------------ */

  test("receive test endpoint message and return with error", async () => {
    const request = {
      type: API.TEST_ENDPOINT,
      data: { endpoint: config.endpoint, credentials: config.credentials },
    };

    // Maybe this never occurs in "real life"
    axios.get.mockResolvedValueOnce({ status: 400, data: {} });
    const result = await handleMessage(request);

    expect(axios.get).toBeCalled();
    expect(result).toEqual({ response: false });
    expect(polling).toBe(null);
  });

  /* ------------------------------------------------------------------------ */

  test("receive test endpoint message and get unexpect error", async () => {
    const request = {
      type: API.TEST_ENDPOINT,
      data: { endpoint: config.endpoint, credentials: config.credentials },
    };

    axios.get.mockRejectedValueOnce({ response: { status: 404, data: {} } });
    const result = await handleMessage(request);

    expect(axios.get).toBeCalled();
    expect(result).toEqual({ response: false });
    expect(polling).toBe(null);
  });

  /* ------------------------------------------------------------------------ */

  test("receive restart service message", async () => {
    const request = { type: API.RESTART_SERVICE };
    const result = await handleMessage(request);

    // As we have no update service running, shouldn't set restart flag
    expect(result).toBe(true);
    expect(polling).toBe(null);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive exists config message", async () => {
    const request = { type: API.EXISTS_CONFIG };
    const result = await handleMessage(request);

    expect(result).toEqual({ response: false });
    expect(polling).toBe(null);
    expect(restart).toBe(false);
  });
});
