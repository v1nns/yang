import React from "react";
import ReactDOM from "react-dom";

import Divider from "@material-ui/core/Divider";

import AppBar from "../scripts/ui/popup/appbar";
import InputChid from "../scripts/ui/popup/input";
import ChangeTable from "../scripts/ui/popup/table";

export default function Popup() {
  return (
    <div>
      <AppBar />
      <Divider variant="fullWidth" style={{ margin: "5px" }} />
      <InputChid />
      <ChangeTable />
    </div>
  );
}

ReactDOM.render(<Popup />, document.getElementById("popup"));
