import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { isEmpty } from "lodash";

import AppBar from "../scripts/ui/popup/appbar";
import ChidTable from "../scripts/ui/popup/table";

import API from "../scripts/api";

function Popup() {
  const [changes, setChanges] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // Add/remove listener and fetch changes list from background script
  useEffect(() => {
    browser.runtime.onMessage.addListener(handleUpdate);
    fetchData();

    return () => browser.runtime.onMessage.removeListener(handleUpdate);
  }, []);

  function handleUpdate(request, sender) {
    console.log(`popup received a message: ${request.type}`);
    if (request.type == API.UPDATE_DATA) {
      // TODO: set state, add another variable as state?
      console.log("data", request.data);
    }
    return false;
  }

  const fetchData = async () => {
    // Dark Mode
    const isDarkMode = await browser.storage.local
      .get("darkMode")
      .then((result) =>
        !isEmpty(result.darkMode) ? JSON.parse(result.darkMode) : {}
      );

    setDarkMode(isDarkMode);

    // Changes
    const result = await browser.runtime.sendMessage({ type: API.GET_DATA });
    setChanges(result.response);
  };

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

  return (
    <div style={{ height: "100%" }}>
      <AppBar
        onClickSettings={handleClickSettings}
        onClickDarkMode={handleClickDarkMode}
        dark={darkMode}
      />
      <ChidTable
        chids={changes}
        onAddChange={handleAddChange}
        onRemoveChanges={handleRemoveChanges}
        dark={darkMode}
      />
    </div>
  );
}

ReactDOM.render(<Popup />, document.getElementById("popup"));
