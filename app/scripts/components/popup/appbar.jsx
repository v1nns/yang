import React from "react";
import PropTypes from "prop-types";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";

import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

import DarkMode from "@material-ui/icons/Brightness4";
import Settings from "@material-ui/icons/Settings";

import { ThemeDark, ThemeLight } from "../popup/theme";

const styleLight = {
  background: `linear-gradient(45deg, ${ThemeLight.appbar.first} 30%, ${ThemeLight.appbar.last} 90%)`,
};
const styleDark = {
  background: `linear-gradient(45deg, ${ThemeDark.appbar.first} 30%, ${ThemeDark.appbar.last} 90%)`,
};

function YangAppBar({ dark, onClickSettings, onClickDarkMode }) {
  const styleMode = dark ? styleDark : styleLight;
  return (
    <AppBar position="sticky" style={styleMode}>
      <Toolbar variant="dense">
        <Typography variant="h6" component="div">
          yet another notifier for gerrit
        </Typography>
        <div style={{ marginLeft: "auto" }}>
          <Tooltip title="Settings">
            <IconButton
              aria-label="settings"
              size="small"
              onClick={onClickSettings}
              disableRipple
              style={{ color: "white" }}
            >
              <Settings />
            </IconButton>
          </Tooltip>
          <Tooltip title="Dark Mode">
            <IconButton
              aria-label="darkmode"
              size="small"
              onClick={onClickDarkMode}
              disableRipple
              style={{ color: "white" }}
            >
              <DarkMode />
            </IconButton>
          </Tooltip>
        </div>
      </Toolbar>
    </AppBar>
  );
}

YangAppBar.propTypes = {
  dark: PropTypes.bool.isRequired,
  onClickSettings: PropTypes.func.isRequired,
  onClickDarkMode: PropTypes.func.isRequired,
};

export default YangAppBar;
