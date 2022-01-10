import React from "react";
import PropTypes from "prop-types";

import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";

import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";

import Person from "@material-ui/icons/PersonTwoTone";
import Lock from "@material-ui/icons/LockTwoTone";

import ExpandMore from "@material-ui/icons/ExpandMore";

/* -------------------------------------------------------------------------- */
/*                        Custom components for config                        */
/* -------------------------------------------------------------------------- */

const Endpoint = ({ value, onChange }) => {
  const title = browser.i18n.getMessage("optionsGerritTitle");
  const label = browser.i18n.getMessage("optionsGerritEndpoint");

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography
          variant="body1"
          style={{ fontSize: "1.15rem", fontWeight: 700 }}
        >
          {title}
        </Typography>
        <Divider variant="fullWidth" />
      </Grid>

      <Grid item xs={12}>
        <TextField
          id="input-endpoint"
          data-testid="input-endpoint"
          label={label}
          value={value}
          size="small"
          // TODO: centralize these style props
          inputProps={{ style: { fontSize: "0.9rem" } }}
          InputLabelProps={{ shrink: true }}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
        />
      </Grid>
    </Grid>
  );
};

/* -------------------------------------------------------------------------- */

const Credentials = ({ value, onChange }) => {
  const { email, password } = value;

  const title = browser.i18n.getMessage("optionsGerritCredentials");
  const labelEmail = browser.i18n.getMessage("optionsGerritEmail");
  const labelPassword = browser.i18n.getMessage("optionsGerritPassword");

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls="panel1a-content"
        data-testid="credentials"
        id="panel1a-header"
        style={{ backgroundColor: "rgba(0,0,0,0.03)" }}
      >
        <Typography variant="button" style={{ fontSize: "0.9rem" }}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12}>
            <Grid container alignItems="flex-end" justifyContent="center">
              <Grid item xs={1}>
                <Person />
              </Grid>
              <Grid item xs={11}>
                <TextField
                  id="input-email"
                  data-testid="input-email"
                  label={labelEmail}
                  value={email}
                  size="small"
                  inputProps={{ style: { fontSize: "0.9em" } }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      email: e.target.value,
                    })
                  }
                  fullWidth
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Grid container alignItems="flex-end" justifyContent="center">
              <Grid item xs={1}>
                <Lock />
              </Grid>
              <Grid item xs={11}>
                <TextField
                  id="input-password"
                  data-testid="input-password"
                  label={labelPassword}
                  value={password}
                  size="small"
                  inputProps={{ style: { fontSize: "0.9em" } }}
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      password: e.target.value,
                    })
                  }
                  fullWidth
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
/* -------------------------------------------------------------------------- */
/*                                Gerrit Config                               */
/* -------------------------------------------------------------------------- */

function GerritConfig({
  endpoint,
  credentials,
  onChangeEndpoint,
  onChangeCredentials,
}) {
  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item xs={12}>
        <Endpoint value={endpoint} onChange={onChangeEndpoint} />
      </Grid>

      <Grid item xs={12}>
        <Credentials value={credentials} onChange={onChangeCredentials} />
      </Grid>
    </Grid>
  );
}

Endpoint.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

Credentials.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

GerritConfig.propTypes = {
  endpoint: PropTypes.string.isRequired,
  credentials: PropTypes.object.isRequired,
  onChangeEndpoint: PropTypes.func.isRequired,
  onChangeCredentials: PropTypes.func.isRequired,
};

export default GerritConfig;
