import React from "react";

import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";

import CloseIcon from "@material-ui/icons/Close";

/* -------------------------------------------------------------------------- */
/*                        Custom components for Actions                       */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                   Actions                                  */
/* -------------------------------------------------------------------------- */

function Actions({ showMessage, message, onClickTest, onClickSave, onClose }) {
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
        ContentProps={{ color: "yellow" }}
        message={message}
        action={action(onClose)}
        onClose={onClose}
      />

      <Grid container spacing={2}>
        <Grid item>
          <Button
            style={{
              color: "rgba(0, 0, 0, 0.7)",
              width: "100px",
            }}
            onClick={onClickTest}
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
            onClick={onClickSave}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

export default Actions;
