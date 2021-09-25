import { makeStyles } from "@material-ui/styles";
import { createTheme } from "react-data-table-component";

/* -------------------------------------------------------------------------- */
/*                          Custom Colors for Button                          */
/* -------------------------------------------------------------------------- */

const iconDark = {
  colorActive: "rgb(255, 255, 255)",
  colorDisabled: "rgb(65, 71, 79)",
};

const iconLight = {
  colorActive: "rgb(65, 71, 79)",
  colorDisabled: "rgba(0, 0, 0, .26)",
};

export function getButtonStyle(dark) {
  //TODO: change ripple color on dark mode
  const useStyles = makeStyles({
    root: {
      "&.MuiIconButton-root": {
        color: (props) => props.colorActive,
      },
      "&.Mui-disabled": {
        color: (props) => props.colorDisabled,
      },
    },
  });

  return dark ? useStyles(iconDark) : useStyles(iconLight);
}

/* -------------------------------------------------------------------------- */
/*                                Common Colors                               */
/* -------------------------------------------------------------------------- */

const Colors = {
  disabled: "rgba(0, 0, 0, .26)",
  status: { ok: "rgba(76, 175, 80, 0.1)", fail: "rgba(255, 23, 68, 0.1)" },
  label: { ok: "rgb(76, 175, 80)", fail: "rgb(255, 23, 68)" },
};

/* -------------------------------------------------------------------------- */
/*                                 Dark Theme                                 */
/* -------------------------------------------------------------------------- */

const ThemeDark = {
  background: "rgb(34, 39, 46)",
  foreground: "rgb(173, 186, 199)",
  appbar: {
    first: "rgb(45, 51, 59)",
    last: "rgb(65, 71, 79)",
  },
  table: {
    border: "rgba(173, 186, 199, .12)",
  },
};

/* -------------------------------------------------------------------------- */
/*                                 Light Theme                                */
/* -------------------------------------------------------------------------- */

const ThemeLight = {
  foreground: "rgba(0,0,0,0.5)",
  appbar: {
    first: "rgb(52, 125, 190)",
    last: " rgb(92, 165, 220)",
  },
  table: {
    border: "rgba(0, 0, 0, .12)",
  },
};

/* -------------------------------------------------------------------------- */
/*                   Custom dark theme for react data table                   */
/* -------------------------------------------------------------------------- */

createTheme("darkest", {
  text: {
    primary: ThemeDark.foreground,
    secondary: "rgb(255, 255, 255)",
    disabled: "rgba(0,0,0,.12)",
  },
  background: {
    default: ThemeDark.background,
  },
  context: {
    background: "#E91E63",
    text: "#FFFFFF",
  },
  divider: {
    default: "rgba(81, 81, 81, 1)",
  },
  button: {
    default: "#FFFFFF",
    focus: "rgba(255, 255, 255, .54)",
    hover: "rgba(255, 255, 255, .12)",
    disabled: "rgba(255, 255, 255, .18)",
  },
  sortFocus: {
    default: "rgba(255, 255, 255, .54)",
  },
  selected: {
    default: "rgba(0, 0, 0, .7)",
    text: "#FFFFFF",
  },
  highlightOnHover: {
    default: "rgba(0, 0, 0, .2)",
    text: "#FFFFFF",
  },
  striped: {
    default: "rgba(0, 0, 0, .87)",
    text: "#FFFFFF",
  },
});

export { Colors, ThemeDark, ThemeLight };
