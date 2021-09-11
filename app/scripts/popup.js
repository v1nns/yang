import React from "react";
import ReactDOM from "react-dom";

import Divider from "@material-ui/core/Divider";

import AppBar from "../scripts/ui/popup/appbar";
import ChidTable from "../scripts/ui/popup/table";

export default function Popup() {
  return (
    <div style={{ height: "100%" }}>
      <AppBar />
      <Divider variant="fullWidth" style={{ marginTop: 5, marginBottom: 10 }} />
      <ChidTable />
    </div>
  );
}

ReactDOM.render(<Popup />, document.getElementById("popup"));
