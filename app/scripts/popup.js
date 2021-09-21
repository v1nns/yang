import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import Divider from "@material-ui/core/Divider";

import AppBar from "../scripts/ui/popup/appbar";
import ChidTable from "../scripts/ui/popup/table";

import API from "../scripts/api";

function Popup() {
  const [changes, setChanges] = useState([]);

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
    const result = await browser.runtime.sendMessage({ type: API.GET_DATA });
    setChanges(result.response);
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
      <AppBar />
      <Divider variant="fullWidth" style={{ marginTop: 5, marginBottom: 10 }} />
      <ChidTable
        chids={changes}
        onAddChange={handleAddChange}
        onRemoveChanges={handleRemoveChanges}
      />
    </div>
  );
}

ReactDOM.render(<Popup />, document.getElementById("popup"));
