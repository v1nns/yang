import React, { useEffect, useState } from "react";
import { isEmpty } from "lodash";
import ReactDOM from "react-dom";

import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

import GerritConfig from "../scripts/ui/options/gerrit";
import GeneralConfig from "../scripts/ui/options/general";

import API from "../scripts/api";

const action = (handleClose) => (
  <>
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleClose}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  </>
);

function Options() {
  // configs
  const [refreshTime, setRefreshTime] = useState(30);
  const [endpoint, setEndpoint] = useState("");
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  // status message
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");

  /* ------------------------------------------------------------------------ */
  /*                             Load initial data                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // fetch data from storage directly
    const data = await browser.storage.local
      .get("options")
      .then((result) =>
        !isEmpty(result.options) ? JSON.parse(result.options) : {}
      );

    if (!isEmpty(data)) {
      setRefreshTime(data.refreshTime);
      setEndpoint(data.endpoint);
      setCredentials(data.credentials);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                                 Handlers                                 */
  /* ------------------------------------------------------------------------ */

  const handleClickSave = (e) => {
    const data = { refreshTime, endpoint, credentials };
    browser.storage.local.set({ options: JSON.stringify(data) });

    message = browser.i18n.getMessage("optionsMessageSaveSuccess");
    setMessage(message);
    setOpen(true);
  };

  const handleClickTest = async (e) => {
    if (refreshTime == "" || endpoint == "" || credentials == "") {
      message = browser.i18n.getMessage("optionsMessageMissingConfig");
      setMessage(message);
      setOpen(true);
      return;
    }

    const data = { refreshTime, endpoint, credentials };
    const result = await browser.runtime.sendMessage({
      type: API.TEST_ENDPOINT,
      data: data,
    });

    if (result.response) {
      message = browser.i18n.getMessage("optionsMessageTestSuccess");
    } else {
      message = browser.i18n.getMessage("optionsMessageTestFailed");
    }

    setMessage(message);
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <div style={{ height: "100%", width: "95%", margin: "auto" }}>
      <Grid
        container
        direction="column"
        justifyContent="space-between"
        alignItems="flex-end"
        spacing={3}
      >
        <Grid item container xs={12}>
          <GeneralConfig
            data={refreshTime}
            onChangeRefreshTime={setRefreshTime}
          />
        </Grid>

        <Grid item container xs={12}>
          <GerritConfig
            endpoint={endpoint}
            credentials={credentials}
            onChangeEndpoint={setEndpoint}
            onChangeCredentials={setCredentials}
          />
        </Grid>
      </Grid>

      <div style={{ position: "absolute", bottom: 15, right: 15 }}>
        <Snackbar
          key={Math.random()}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          open={open}
          autoHideDuration={5000}
          ContentProps={{ color: "yellow" }}
          message={message}
          action={action(handleClose)}
          onClose={handleClose}
        />

        <Grid container spacing={2}>
          <Grid item>
            <Button
              style={{
                color: "rgba(0, 0, 0, 0.7)",
                width: "100px",
              }}
              onClick={handleClickTest}
            >
              Test
            </Button>
          </Grid>
          <Grid item>
            <Button
              style={{
                backgroundColor: "rgb(92, 165, 220)",
                color: "rgb(255, 255, 255)",
                width: "100px",
              }}
              onClick={handleClickSave}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

ReactDOM.render(<Options />, document.getElementById("options"));
