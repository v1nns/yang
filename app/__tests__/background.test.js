import API from "../scripts/api";

import {
  expectStorageSave,
  expectOpenNewPage,
  mockStorageValue,
  mockStorageValueOnce,
  mockResolvedAxiosGetOnce,
  mockRejectedAxiosGetOnce,
  mockPopupState,
  initNotificationMock,
  destroyNotificationMock,
  expectCreateNotification,
} from "./utils";

import {
  init,
  reset,
  handleMessage,
  polling,
  restart,
} from "../scripts/components/background/background";

import Service from "../scripts/components/background/polling";

import { chids, config, labelApproved, labelRejected } from "./mock";

/* -------------------------------------------------------------------------- */
/*                           Empty Background Script                          */
/* -------------------------------------------------------------------------- */

describe("background script with empty config", () => {
  beforeAll(() => {
    console.log = jest.fn();
    mockStorageValue("options", {});
  });

  /* ------------------------------------------------------------------------ */

  test("should not start gerrit polling service", async () => {
    // Mock storage to return a list of change-ids
    mockStorageValueOnce("changes", JSON.stringify(chids));

    await init();

    expect(browser.runtime.onMessage.addListener).toBeCalled();
    expect(polling).toBe(false);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive get data message without any change-id", async () => {
    // Mock storage to return a list of change-ids
    mockStorageValueOnce("changes", []);
    mockStorageValueOnce("updated", []);

    const request = { type: API.GET_DATA };
    const result = await handleMessage(request);

    expect(result).toEqual({ response: [] });
    expect(polling).toBe(false);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive get data message without updates", async () => {
    // Mock storage to return a list of change-ids
    mockStorageValueOnce("changes", JSON.stringify(chids));
    mockStorageValueOnce("updated", []);

    const request = { type: API.GET_DATA };
    const result = await handleMessage(request);

    expect(result).toEqual({ response: chids });
    expect(polling).toBe(false);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive get data message with updates", async () => {
    // Get a random chid and enable updated flag and split into two arrays
    const chid = { ...chids[1], updated: true };
    const updated = [chid];
    const notUpdated = [chids[0], chids[2]];

    // Mock storage to return a list of change-ids
    mockStorageValueOnce("changes", JSON.stringify(chids));
    mockStorageValueOnce("updated", JSON.stringify(updated));

    const request = { type: API.GET_DATA };
    const result = await handleMessage(request);

    // Response must have both arrays merged (updated and notUpdated)
    expect(result).toEqual({ response: [...updated, ...notUpdated] });
    expect(polling).toBe(false);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive add change-id message", async () => {
    const request = {
      type: API.ADD_CHANGE,
      data: 12345,
    };

    const result = await handleMessage(request);

    expect(result).toBe(true);
    expect(polling).toBe(false);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive remove change-ids message", async () => {
    // Mock storage to return a list of change-ids
    mockStorageValueOnce("changes", JSON.stringify(chids));

    const request = { type: API.REMOVE_CHANGES, data: ["326205"] };
    const result = await handleMessage(request);

    // Create expectation for storage save
    const updated = [chids[1], chids[2]];
    expectStorageSave({ changes: JSON.stringify(updated) });

    expect(result).toBe(true);
    expect(polling).toBe(false);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive test endpoint message and return with success", async () => {
    const request = {
      type: API.TEST_ENDPOINT,
      data: { endpoint: config.endpoint, credentials: config.credentials },
    };

    // Mock HTTP get response
    const url = `${config.endpoint}/config/server/version`;
    mockResolvedAxiosGetOnce(url, config, { status: 200, data: {} });

    const result = await handleMessage(request);

    expect(result).toEqual({ response: true });
    expect(polling).toBe(false);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive test endpoint message and return with error", async () => {
    const request = {
      type: API.TEST_ENDPOINT,
      data: { endpoint: config.endpoint, credentials: config.credentials },
    };

    // Mock HTTP get response (maybe this never occurs in "real life")
    const url = `${config.endpoint}/config/server/version`;
    mockResolvedAxiosGetOnce(url, config, { status: 400, data: {} });

    const result = await handleMessage(request);

    expect(result).toEqual({ response: false });
    expect(polling).toBe(false);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive test endpoint message and get unexpect error", async () => {
    const request = {
      type: API.TEST_ENDPOINT,
      data: { endpoint: config.endpoint, credentials: config.credentials },
    };

    // Mock HTTP get response
    const url = `${config.endpoint}/config/server/version`;
    mockRejectedAxiosGetOnce(url, config, { status: 404, data: {} });

    const result = await handleMessage(request);

    expect(result).toEqual({ response: false });
    expect(polling).toBe(false);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive restart service message", async () => {
    const request = { type: API.RESTART_SERVICE };
    const result = await handleMessage(request);

    // As we have no polling service running, shouldn't set restart flag
    expect(result).toBe(true);
    expect(polling).toBe(false);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive exists config message", async () => {
    const request = { type: API.EXISTS_CONFIG };
    const result = await handleMessage(request);

    expect(result).toEqual({ response: false });
    expect(polling).toBe(false);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive open change message", async () => {
    const request = { type: API.OPEN_CHANGE, data: "123456" };
    const result = await handleMessage(request);

    expect(result).toEqual(true);
    expect(polling).toBe(false);
    expect(restart).toBe(false);
    expect(browser.tabs.create).not.toBeCalled();
  });
});

/* -------------------------------------------------------------------------- */
/*                        Background Script with config                       */
/* -------------------------------------------------------------------------- */

describe("background script with config and no service running", () => {
  // Mock polling service
  let serviceSpy;

  beforeAll(() => {
    console.log = jest.fn();
    mockStorageValue("options", JSON.stringify(config));

    // Mock implementation
    serviceSpy = jest.spyOn(Service, "run").mockImplementation(() => {
      return true;
    });
  });

  beforeEach(() => {
    // Clear global variables
    reset();
  });

  afterAll(() => {
    serviceSpy.mockRestore();
  });

  /* ------------------------------------------------------------------------ */

  test("should start gerrit polling service", async () => {
    // Mock storage to return a list of change-ids
    mockStorageValueOnce("changes", JSON.stringify(chids));

    await init();

    expect(browser.runtime.onMessage.addListener).toBeCalled();
    expect(polling).not.toBe(false);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("should not start gerrit polling service", async () => {
    // Mock storage to return an empty list
    mockStorageValueOnce("changes", []);

    await init();

    expect(browser.runtime.onMessage.addListener).toBeCalled();
    expect(polling).toBe(false);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive add change-id message and start polling service", async () => {
    // Mock storage to return an empty list
    mockStorageValueOnce("changes", []);

    const request = { type: API.ADD_CHANGE, data: 222222 };
    const result = await handleMessage(request);

    expectStorageSave({
      changes: JSON.stringify([{ id: 222222, codeReview: 0, verified: 0 }]),
    });

    expect(result).toBe(true);
    expect(polling).not.toBe(false);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive remove change-ids message with a single entry", async () => {
    // Mock storage to return a list of change-ids
    mockStorageValueOnce("changes", JSON.stringify(chids));

    await init();

    expect(polling).not.toBe(false);
    expect(restart).toBe(false);

    // Mock storage to return a list of change-ids
    mockStorageValueOnce("changes", JSON.stringify(chids));

    const request = { type: API.REMOVE_CHANGES, data: ["326205"] };
    const result = await handleMessage(request);

    // Create expectations
    const updated = [chids[1], chids[2]];
    expectStorageSave({ changes: JSON.stringify(updated) });

    expect(result).toBe(true);
    expect(polling).not.toBe(false);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive remove change-ids message with all entries", async () => {
    // Mock storage to return a list of change-ids
    mockStorageValueOnce("changes", JSON.stringify(chids));

    await init();

    expect(polling).not.toBe(false);
    expect(restart).toBe(false);

    // Mock storage to return a list of change-ids
    mockStorageValueOnce("changes", JSON.stringify(chids));

    const request = {
      type: API.REMOVE_CHANGES,
      data: ["326205", "269047", "321037"],
    };
    const result = await handleMessage(request);

    // Create expectations
    expectStorageSave({ changes: JSON.stringify([]) });

    expect(result).toBe(true);
    expect(polling).toBe(false);
    expect(restart).toBe(false);
  });

  /* ------------------------------------------------------------------------ */

  test("receive open change message", async () => {
    const request = {
      type: API.OPEN_CHANGE,
      data: "326205",
    };
    const result = await handleMessage(request);

    expect(result).toBe(true);
    expect(polling).toBe(false);
    expect(restart).toBe(false);

    const url = `${config.endpoint}/326205`;
    expectOpenNewPage({ url });
  });
});

/* -------------------------------------------------------------------------- */
/*                               Polling Service                              */
/* -------------------------------------------------------------------------- */

describe("polling service running with popup closed", () => {
  // Internal functions used by service
  const mockRestart = jest.fn();
  const mockStop = jest.fn();

  beforeAll(() => {
    console.log = jest.fn();
    initNotificationMock();

    mockStorageValue("options", JSON.stringify(config));
    mockPopupState(false);
  });

  afterAll(() => {
    destroyNotificationMock();
  });

  beforeEach(() => {
    mockRestart.mockClear();
    mockStop.mockClear();
  });

  /* ------------------------------------------------------------------------ */

  test("query a single change-id with both labels approved and merged status", async () => {
    // Mock storage to return a single change-id
    const chid = chids[0];
    mockStorageValue("changes", JSON.stringify([chid]));

    // Create a mock for HTTP get response
    const url = `${config.endpoint}/changes/${chid.id}/detail`;
    const result = {
      _number: Number(chid.id),
      subject: chid.subject,
      status: "MERGED",
      labels: {
        Verified: labelApproved,
        "Code-Review": labelApproved,
      },
    };
    mockResolvedAxiosGetOnce(url, config, {
      status: 200,
      data: JSON.stringify(result),
    });

    await Service.run(restart, mockRestart, mockStop);

    // Create expectation for change-ids and updated
    const changes = [{ ...chid, status: "MERGED", verified: 1, codeReview: 1 }];
    const updated = [
      {
        ...chid,
        status: "MERGED",
        verified: 1,
        codeReview: 1,
        updated: true,
      },
    ];

    // Create expectations
    expectStorageSave({ changes: JSON.stringify(changes) });
    expectStorageSave({ updated: JSON.stringify(updated) });

    expectCreateNotification(1);

    expect(mockRestart).not.toBeCalled();
    expect(mockStop).toBeCalled();
  });

  /* ------------------------------------------------------------------------ */

  test("query a single change-id with codeReview rejected", async () => {
    // Mock storage to return a single change-id
    const chid = chids[0];
    mockStorageValue("changes", JSON.stringify([chid]));

    // Create a mock for HTTP get response
    const url = `${config.endpoint}/changes/${chid.id}/detail`;
    const result = {
      _number: Number(chid.id),
      subject: chid.subject,
      status: "NEW",
      labels: {
        Verified: labelApproved,
        "Code-Review": labelRejected,
      },
    };
    mockResolvedAxiosGetOnce(url, config, {
      status: 200,
      data: JSON.stringify(result),
    });

    await Service.run(restart, mockRestart, mockStop);

    // Create expectation for change-ids and updated
    const changes = [{ ...chid, status: "NEW", verified: 1, codeReview: -2 }];
    const updated = [
      {
        ...chid,
        status: "NEW",
        verified: 1,
        codeReview: -2,
        updated: true,
      },
    ];

    // Create expectations
    expectStorageSave({ changes: JSON.stringify(changes) });
    expectStorageSave({ updated: JSON.stringify(updated) });

    expectCreateNotification(1);

    expect(mockRestart).not.toBeCalled();
    expect(mockStop).not.toBeCalled();
  });

  /* ------------------------------------------------------------------------ */

  test("query a single change-id with verify rejected", async () => {
    // Mock storage to return a single change-id
    const chid = chids[0];
    mockStorageValue("changes", JSON.stringify([chid]));

    // Create a mock for HTTP get response
    const url = `${config.endpoint}/changes/${chid.id}/detail`;
    const result = {
      _number: Number(chid.id),
      subject: chid.subject,
      status: "NEW",
      labels: {
        Verified: labelRejected,
        "Code-Review": labelApproved,
      },
    };
    mockResolvedAxiosGetOnce(url, config, {
      status: 200,
      data: JSON.stringify(result),
    });

    await Service.run(restart, mockRestart, mockStop);

    // Create expectation for change-ids and updated
    const changes = [{ ...chid, status: "NEW", verified: -2, codeReview: 1 }];
    const updated = [
      {
        ...chid,
        status: "NEW",
        verified: -2,
        codeReview: 1,
        updated: true,
      },
    ];

    // Create expectations
    expectStorageSave({ changes: JSON.stringify(changes) });
    expectStorageSave({ updated: JSON.stringify(updated) });

    expectCreateNotification(1);

    expect(mockRestart).not.toBeCalled();
    expect(mockStop).not.toBeCalled();
  });

  /* ------------------------------------------------------------------------ */

  test("query a single change-id with both labels rejected", async () => {
    // Mock storage to return a single change-id
    const chid = chids[0];
    mockStorageValue("changes", JSON.stringify([chid]));

    // Create a mock for HTTP get response
    const url = `${config.endpoint}/changes/${chid.id}/detail`;
    const result = {
      _number: Number(chid.id),
      subject: chid.subject,
      status: "NEW",
      labels: {
        Verified: labelRejected,
        "Code-Review": labelRejected,
      },
    };
    mockResolvedAxiosGetOnce(url, config, {
      status: 200,
      data: JSON.stringify(result),
    });

    await Service.run(restart, mockRestart, mockStop);

    // Create expectation for change-ids and updated
    const changes = [{ ...chid, status: "NEW", verified: -2, codeReview: -2 }];
    const updated = [
      {
        ...chid,
        status: "NEW",
        verified: -2,
        codeReview: -2,
        updated: true,
      },
    ];

    // Create expectations
    expectStorageSave({ changes: JSON.stringify(changes) });
    expectStorageSave({ updated: JSON.stringify(updated) });

    expectCreateNotification(1);

    expect(mockRestart).not.toBeCalled();
    expect(mockStop).not.toBeCalled();
  });

  /* ------------------------------------------------------------------------ */

  test("run service, query existent change-ids and get merged status", async () => {
    // Mock storage to return a list of change-ids
    mockStorageValue("changes", JSON.stringify(chids));

    // Create a mock for every HTTP get response
    for (const chid of chids) {
      if (chid.status !== "MERGED") {
        const url = `${config.endpoint}/changes/${chid.id}/detail`;
        const result = {
          _number: Number(chid.id),
          subject: chid.subject,
          status: "MERGED",
          labels: {
            Verified: labelApproved,
            "Code-Review": labelApproved,
          },
        };
        mockResolvedAxiosGetOnce(url, config, {
          status: 200,
          data: JSON.stringify(result),
        });
      }
    }

    await Service.run(restart, mockRestart, mockStop);

    // Create expectation for all change-ids
    const changes = chids.map((obj) => {
      return {
        ...obj,
        ...(obj.status != "MERGED"
          ? {
              status: "MERGED",
              verified: 1,
              codeReview: 1,
            }
          : {}),
      };
    });

    // Create expectation for all change-ids with an update
    const updated = chids
      .filter((obj) => obj.status != "MERGED")
      .map((filtered) => {
        return {
          ...filtered,
          status: "MERGED",
          verified: 1,
          codeReview: 1,
          updated: true,
        };
      });

    // Create expectations
    expectStorageSave({ changes: JSON.stringify(changes) });
    expectStorageSave({ updated: JSON.stringify(updated) });

    expectCreateNotification(2);

    expect(mockRestart).not.toBeCalled();
    expect(mockStop).toBeCalled();
  });
});
