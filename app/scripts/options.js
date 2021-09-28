import React, { useEffect, useState } from "react";
import { isEmpty } from "lodash";
import ReactDOM from "react-dom";

import Button from "@material-ui/core/Button";

import Grid from "@material-ui/core/Grid";

import GerritConfig from "../scripts/ui/options/gerrit";
import GeneralConfig from "../scripts/ui/options/general";

function Options() {
  const [refreshTime, setRefreshTime] = useState(30);
  const [endpoint, setEndpoint] = useState("");
  const [credentials, setCredentials] = useState({ email: "", password: "" });

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

  const handleClickSave = (e) => {
    const data = { refreshTime, endpoint, credentials };
    browser.storage.local.set({ options: JSON.stringify(data) });
    // TODO: show some popup telling config was saved succesfully
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
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
        <Button onClick={handleClickSave}>Save</Button>
      </div>
    </div>
  );
}

ReactDOM.render(<Options />, document.getElementById("options"));
