import React from "react";
import ReactDOM from "react-dom";

import Divider from "@material-ui/core/Divider";

import AppBar from "../scripts/ui/popup/appbar";
import ChidTable from "./ui/popup/table";

export default function Popup() {
  return (
    <div>
      <AppBar />
      <Divider variant="fullWidth" style={{ marginTop: 5 }} />
      <ChidTable />
    </div>
  );
}

ReactDOM.render(<Popup />, document.getElementById("popup"));
