import React from "react";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import Slider from "@material-ui/core/Slider";

import Divider from "@material-ui/core/Divider";

import Tooltip from "@material-ui/core/Tooltip";

function ValueLabelComponent(props) {
  const { children, value } = props;

  return (
    <Tooltip enterTouchDelay={0} title={value} arrow>
      {children}
    </Tooltip>
  );
}

function GeneralConfig() {
  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item xs={12}>
        <Typography variant="body1" style={{ fontWeight: 700 }}>
          General
        </Typography>
        <Divider variant="fullWidth" />
      </Grid>

      <Grid item xs={12}>
        <Typography
          style={{
            fontSize: "0.8rem",
            color: "rgba(0,0,0,0.7)",
          }}
        >
          Refresh time (seconds):
        </Typography>
      </Grid>

      <Grid item xs={11}>
        <Slider
          aria-label="RefreshTime"
          defaultValue={30}
          valueLabelDisplay="auto"
          step={15}
          min={15}
          max={120}
          marks
          ValueLabelComponent={ValueLabelComponent}
        />
      </Grid>
    </Grid>
  );
}

export default GeneralConfig;
