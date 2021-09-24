import React from "react";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";

import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

import DarkMode from "@material-ui/icons/Brightness4";
import Settings from "@material-ui/icons/Settings";

function YangAppBar({ onClickSettings }) {
  return (
    <AppBar position="sticky" color="primary">
      <Toolbar variant="dense">
        <Typography variant="h6" component="div">
          yet another notifier for gerrit
        </Typography>
        <div style={{ marginLeft: "auto" }}>
          <Tooltip title="Settings">
            <IconButton
              aria-label="settings"
              size="small"
              color="default"
              onClick={onClickSettings}
            >
              <Settings />
            </IconButton>
          </Tooltip>
          <Tooltip title="Dark Mode">
            <IconButton aria-label="darkmode" size="small" color="default">
              <DarkMode />
            </IconButton>
          </Tooltip>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default YangAppBar;
