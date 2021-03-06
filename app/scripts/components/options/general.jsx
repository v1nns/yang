import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Slider from "@material-ui/core/Slider";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

/* -------------------------------------------------------------------------- */
/*                        Custom components for config                        */
/* -------------------------------------------------------------------------- */

function getSliderStyle() {
  const useStyles = makeStyles({
    root: {
      "&.MuiSlider-root": {
        color: "rgb(92, 165, 220)",
      },
    },
  });

  return useStyles();
}

const ValueLabelComponent = (props) => {
  const { children, value } = props;
  return <Tooltip title={value}>{children}</Tooltip>;
};

/* -------------------------------------------------------------------------- */
/*                               General Config                               */
/* -------------------------------------------------------------------------- */

function GeneralConfig({ data, onChangeRefreshTime }) {
  const title = browser.i18n.getMessage("optionsGeneralTitle");
  const label = browser.i18n.getMessage("optionsGeneralRefreshTime");

  const slider = getSliderStyle();

  return (
    <Grid container spacing={2} justifyContent="center">
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
        <Typography
          style={{
            fontSize: "0.75rem",
            color: "rgba(0,0,0,0.7)",
            lineHeight: 1,
            padding: 0,
          }}
        >
          {label}
        </Typography>
      </Grid>

      <Grid item xs={11}>
        <Slider
          aria-label="refresh-time"
          classes={{ root: slider.root }}
          value={data}
          onChange={(e, val) => onChangeRefreshTime(val)}
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

ValueLabelComponent.propTypes = {
  children: PropTypes.element.isRequired,
  value: PropTypes.number.isRequired,
};

GeneralConfig.propTypes = {
  data: PropTypes.number.isRequired,
  onChangeRefreshTime: PropTypes.func.isRequired,
};

export default GeneralConfig;
