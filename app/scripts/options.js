import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import { isEmpty } from "lodash";
import { isEmail } from "validator";

import Grid from "@material-ui/core/Grid";

import GerritConfig from "../scripts/ui/options/gerrit";
import GeneralConfig from "../scripts/ui/options/general";
import Actions from "../scripts/ui/options/actions";

import API from "../scripts/api";

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
    let dummy = "";
    if (endpoint == "") {
      dummy = browser.i18n.getMessage("optionsMessageMissingConfig");
    } else if (!isEmail(credentials.email)) {
      dummy = browser.i18n.getMessage("optionsMessageInvalidEmail");
    } else {
      const data = { refreshTime, endpoint, credentials };
      // TODO: send it to background service to restart service
      browser.storage.local.set({ options: JSON.stringify(data) });

      dummy = browser.i18n.getMessage("optionsMessageSaveSuccess");
    }

    setMessage(dummy);
    setOpen(true);
  };

  const handleClickTest = async (e) => {
    let dummy = "";
    if (refreshTime == "" || endpoint == "" || credentials == "") {
      dummy = browser.i18n.getMessage("optionsMessageMissingConfig");
      setMessage(dummy);
      setOpen(true);
      return;
    }

    const data = { refreshTime, endpoint, credentials };
    const result = await browser.runtime.sendMessage({
      type: API.TEST_ENDPOINT,
      data: data,
    });

    if (result.response) {
      dummy = browser.i18n.getMessage("optionsMessageTestSuccess");
    } else {
      dummy = browser.i18n.getMessage("optionsMessageTestFailed");
    }

    setMessage(dummy);
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  /* ------------------------------------------------------------------------ */
  /*                                 Rendering                                */
  /* ------------------------------------------------------------------------ */

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

      <Actions
        showMessage={open}
        message={message}
        onClickTest={handleClickTest}
        onClickSave={handleClickSave}
        onClose={handleClose}
      />
    </div>
  );
}

ReactDOM.render(<Options />, document.getElementById("options"));
