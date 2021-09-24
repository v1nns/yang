import React from "react";
import ReactDOM from "react-dom";

import Button from "@material-ui/core/Button";

import Grid from "@material-ui/core/Grid";

import GerritConfig from "../scripts/ui/options/gerrit";
import GeneralConfig from "../scripts/ui/options/general";
import { height } from "dom-helpers";

function Options() {
  return (
    <div style={{ height: "100%" }}>
      <Grid
        container
        direction="column"
        justifyContent="space-between"
        alignItems="flex-end"
        spacing={3}
      >
        <Grid item container xs={12}>
          <GeneralConfig />
        </Grid>

        <Grid item container xs={12}>
          <GerritConfig />
        </Grid>
      </Grid>

      <div style={{ position: "absolute", bottom: 15, right: 15 }}>
        <Button>Save</Button>
      </div>
    </div>
  );
}

ReactDOM.render(<Options />, document.getElementById("options"));
