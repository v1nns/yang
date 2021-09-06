import React from "react";

import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

import DarkModeIcon from "@material-ui/icons/Brightness4";
import SettingsIcon from "@material-ui/icons/Settings";

export default function AppBar() {
  return (
    <Grid container alignItems="center">
      <Grid item xs>
        <Typography variant="h6">yet another notifier for gerrit</Typography>
      </Grid>
      <Grid item>
        <Tooltip title="Settings">
          <IconButton aria-label="settings" size="small">
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Dark Mode">
          <IconButton aria-label="darkmode" size="small">
            <DarkModeIcon />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  );
}
