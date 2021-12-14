import React, { useEffect, useState } from "react";
import { isEmpty } from "lodash";

import { ThemeDark } from "./theme";

import AppBar from "./appbar";
import ChidTable from "./table";

import API from "../../api";

function Popup() {
  const [changes, setChanges] = useState([]);
  const [updated, setUpdated] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  /* ------------------------------------------------------------------------ */
  /*                             Load initial data                            */
  /* ------------------------------------------------------------------------ */

  // Add/remove listener and fetch changes list from background script
  useEffect(() => {
    browser.runtime.onMessage.addListener(handleUpdate);
    fetchData();
    return () => browser.runtime.onMessage.removeListener(handleUpdate);
  }, []);

  function handleUpdate(request, sender) {
    console.log(`popup received a message: ${request.type}`);
    if (request.type == API.UPDATE_DATA) {
      setUpdated(request.data);
    }
    return false;
  }

  const fetchData = async () => {
    // Remove badge from extension icon
    browser.browserAction.setBadgeText({
      text: ``,
    });

    // Dark Mode
    const isDarkMode = await browser.storage.local
      .get("darkMode")
      .then((result) =>
        !isEmpty(result.darkMode) ? JSON.parse(result.darkMode) : false
      );

    setDarkMode(isDarkMode);

    // Check if config exists
    const existsConfig = await browser.runtime.sendMessage({
      type: API.EXISTS_CONFIG,
    });
    setDisabled(!existsConfig.response);

    // Changes
    const result = await browser.runtime.sendMessage({ type: API.GET_DATA });
    setChanges(result.response);
  };

  /* ------------------------------------------------------------------------ */
  /*                                 Handlers                                 */
  /* ------------------------------------------------------------------------ */

  const handleClickSettings = (e) => {
    browser.runtime.openOptionsPage();
  };

  const handleClickDarkMode = (e) => {
    // save it into browser local storage
    browser.storage.local.set({ darkMode: JSON.stringify(!darkMode) });

    setDarkMode(!darkMode);
  };

  // Send change-id to background service to start querying for it
  const handleAddChange = (id) => {
    browser.runtime.sendMessage({ type: API.ADD_CHANGE, data: id });
  };

  const handleRemoveChanges = (ids) => {
    browser.runtime.sendMessage({ type: API.REMOVE_CHANGES, data: ids });
  };

  /* ------------------------------------------------------------------------ */
  /*                                 Rendering                                */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      aria-label="popup"
      style={{
        height: "100%",
        ...(darkMode && { backgroundColor: ThemeDark.background }),
      }}
    >
      <AppBar
        onClickSettings={handleClickSettings}
        onClickDarkMode={handleClickDarkMode}
        dark={darkMode}
      />

      <ChidTable
        chids={changes}
        updated={updated}
        onAddChange={handleAddChange}
        onRemoveChanges={handleRemoveChanges}
        dark={darkMode}
        emptyConfig={disabled}
      />
    </div>
  );
}

export default Popup;
