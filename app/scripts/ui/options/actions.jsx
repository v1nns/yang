import React from "react";
import { makeStyles } from "@material-ui/styles";

import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";

import CloseIcon from "@material-ui/icons/Close";

/* -------------------------------------------------------------------------- */
/*                                Custom styles                               */
/* -------------------------------------------------------------------------- */

const getButtonStyle = () => {
  const primary = makeStyles({
    root: {
      "&.MuiButton-root": {
        background: "rgb(92, 165, 220)",
        color: "rgb(255, 255, 255)",
        textShadow: "rgba(0, 0, 0, .2) 0px 1px 0px",
        width: "125px",
      },
      "&.MuiButton-root:hover": {
        backgroundImage:
          "linear-gradient(rgb(92, 165, 220), rgb(92, 165, 220) 38%, rgb(52, 125, 180))",
        color: "rgb(255, 255, 255)",
        textShadow: "rgba(0, 0, 0, .2) 0px 1px 0px",
        boxShadow: "unset",
      },
    },
  })();

  const secondary = makeStyles({
    root: {
      "&.MuiButton-root": {
        background: "transparent",
        color: "rgb(92, 165, 220)",
        textShadow: "rgba(0, 0, 0, .1) 0px 1px 0px",
        width: "125px",
        boxShadow: "none",
      },
      "&.MuiButton-root:hover": {
        backgroundImage:
          "linear-gradient(transparent, rgb(240, 240, 240) 38%, rgb(224, 224, 224))",
        color: "rgb(92, 165, 220)",
        textShadow: "rgba(255, 255, 255, .8) 0px 1px 0px",
        boxShadow: "unset",
      },
    },
  })();

  return { primary, secondary };
};

/* -------------------------------------------------------------------------- */

const getIconButtonStyle = () => {
  const button = makeStyles({
    root: {
      "&.MuiIconButton-root": {
        background: "transparent",
        color: "white",
        boxShadow: "unset",
        fontSize: ".8em",
      },
      "&.MuiIconButton-root:hover": {
        background: "transparent",
        color: "white",
        boxShadow: "unset",
      },
    },
  })();

  return button;
};

/* -------------------------------------------------------------------------- */
/*                        Custom components for Actions                       */
/* -------------------------------------------------------------------------- */

const action = (handleClose) => {
  const classes = getIconButtonStyle();
  return (
    <IconButton
      classes={{ root: classes.root }}
      size="small"
      aria-label="close"
      onClick={handleClose}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );
};

/* -------------------------------------------------------------------------- */
/*                                   Actions                                  */
/* -------------------------------------------------------------------------- */

function Actions({ showMessage, message, onClickTest, onClickSave, onClose }) {
  const { primary, secondary } = getButtonStyle();
  const messageTest = browser.i18n.getMessage("optionsActionsTest");
  const messageSave = browser.i18n.getMessage("optionsActionsSave");

  return (
    <div style={{ position: "absolute", bottom: 15, right: 15 }}>
      <Snackbar
        key={Math.random()}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={showMessage}
        autoHideDuration={5000}
        message={message}
        action={action(onClose)}
        onClose={onClose}
      />

      <Grid container spacing={2}>
        <Grid item>
          <Button classes={{ root: secondary.root }} onClick={onClickTest}>
            {messageTest}
          </Button>
        </Grid>
        <Grid item>
          <Button classes={{ root: primary.root }} onClick={onClickSave}>
            {messageSave}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

export default Actions;
