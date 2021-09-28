import React from "react";

import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";

import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";

import Person from "@material-ui/icons/PersonTwoTone";
import Lock from "@material-ui/icons/LockTwoTone";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

function GerritConfig({
  endpoint,
  credentials,
  onChangeEndpoint,
  onChangeCredentials,
}) {
  const { email, password } = credentials;
  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item xs={12}>
        <Typography variant="body1" style={{ fontWeight: 700 }}>
          Gerrit configuration
        </Typography>
        <Divider variant="fullWidth" />
      </Grid>

      <Grid item xs={12}>
        <TextField
          id="input-endpoint"
          label="Endpoint URL"
          value={endpoint}
          size="small"
          // TODO: centralize these style props
          inputProps={{ style: { fontSize: "0.9em" } }}
          InputLabelProps={{ shrink: true }}
          onChange={(e) => onChangeEndpoint(e.target.value)}
          fullWidth
        />
      </Grid>

      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            style={{ backgroundColor: "rgba(0,0,0,0.03)" }}
          >
            <Typography variant="button" style={{ fontSize: "0.8rem" }}>
              Credentials
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12}>
                <Grid
                  container
                  spacing={1}
                  alignItems="flex-end"
                  justifyContent="center"
                >
                  <Grid item xs={1}>
                    <Person />
                  </Grid>
                  <Grid item xs={11}>
                    <TextField
                      id="input-email"
                      label="Email address"
                      value={email}
                      size="small"
                      inputProps={{ style: { fontSize: "0.9em" } }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onChange={(e) =>
                        // TODO: add email validation
                        onChangeCredentials({
                          ...credentials,
                          email: e.target.value,
                        })
                      }
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Grid
                  container
                  spacing={1}
                  alignItems="flex-end"
                  justifyContent="center"
                >
                  <Grid item xs={1}>
                    <Lock />
                  </Grid>
                  <Grid item xs={11}>
                    <TextField
                      id="input-password"
                      label="HTTP password"
                      value={password}
                      size="small"
                      inputProps={{ style: { fontSize: "0.9em" } }}
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) =>
                        onChangeCredentials({
                          ...credentials,
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
      </Grid>
    </Grid>
  );
}

export default GerritConfig;
