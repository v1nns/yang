import React from "react";

import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

import DarkMode from "@material-ui/icons/Brightness4TwoTone";
import Settings from "@material-ui/icons/SettingsTwoTone";

function AppBar({ onClickSettings }) {
  return (
    <Grid container alignItems="center">
      <Grid item xs>
        <Typography variant="h6">yet another notifier for gerrit</Typography>
      </Grid>
      <Grid item>
        <Tooltip title="Settings">
          <IconButton
            aria-label="settings"
            size="small"
            color="primary"
            onClick={onClickSettings}
          >
            <Settings fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Dark Mode">
          <IconButton aria-label="darkmode" size="small" color="primary">
            <DarkMode fontSize="small" />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  );
}

export default AppBar;
