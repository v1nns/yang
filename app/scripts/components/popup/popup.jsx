import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { isEmpty } from "lodash";

import { ThemeDark, ThemeLight } from "./theme";

import AppBar from "./appbar";
import ChidTable from "./table";

import API from "../../api";

function Popup({ isTesting }) {
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

  function handleUpdate(request) {
    console.log(`Popup received a message: ${request.type}`);
    if (request.type == API.UPDATE_DATA) {
      setUpdated(Object.values(request.data));
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
    setChanges(Object.values(result.response));
  };

  /* ------------------------------------------------------------------------ */
  /*                            Theme Configuration                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  /* ------------------------------------------------------------------------ */
  /*                                 Handlers                                 */
  /* ------------------------------------------------------------------------ */

  const handleClickSettings = () => {
    browser.runtime.openOptionsPage();
  };

  const handleClickDarkMode = () => {
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

  const handleDoubleClickChange = (row) => {
    if (row.id !== 0) {
      browser.runtime.sendMessage({ type: API.OPEN_CHANGE, data: row.id });
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                                 Rendering                                */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      aria-label="popup"
      style={{
        height: "100%",
        ...(darkMode
          ? { backgroundColor: ThemeDark.background }
          : { backgroundColor: ThemeLight.background }),
      }}
    >
      <AppBar
        dark={darkMode}
        onClickSettings={handleClickSettings}
        onClickDarkMode={handleClickDarkMode}
      />

      <ChidTable
        chids={changes}
        updated={updated}
        dark={darkMode}
        emptyConfig={disabled}
        onAddChange={handleAddChange}
        onRemoveChanges={handleRemoveChanges}
        onChangeDoubleClick={handleDoubleClickChange}
        isTesting={isTesting}
      />
    </div>
  );
}

// TODO: ideally, should remove isTesting from component
Popup.defaultProps = {
  isTesting: false,
};

Popup.propTypes = {
  isTesting: PropTypes.bool.isRequired,
};

export default Popup;
