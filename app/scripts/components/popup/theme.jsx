import { makeStyles } from "@material-ui/styles";
import { createTheme } from "react-data-table-component";

/* -------------------------------------------------------------------------- */
/*                        Custom Colors for Icon Button                       */
/* -------------------------------------------------------------------------- */

const darkTheme = {
  colorActive: "rgb(173, 186, 199)",
  bgHover: "rgba(255, 255, 255, 0.1)",
  colorDisabled: "rgb(65, 71, 79)",
};

const lightTheme = {
  colorActive: "rgb(65, 71, 79)",
  bgHover: "rgba(0, 0, 0, 0.04)",
  colorDisabled: "rgba(0, 0, 0, .26)",
};

export function getButtonStyle(dark) {
  const useStyles = makeStyles({
    root: {
      "&.MuiIconButton-root": {
        color: (props) => props.colorActive,
      },
      "&.MuiIconButton-root:hover": {
        background: (props) => props.bgHover,
      },
      "&.Mui-disabled": {
        color: (props) => props.colorDisabled,
      },
    },
  });

  return dark ? useStyles(darkTheme) : useStyles(lightTheme);
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
  background: "rgb(43, 42, 51)",
  foreground: "rgb(223, 226, 229)",
  row: "rgb(168, 181, 194)",
  appbar: {
    first: "rgb(45, 51, 59)",
    last: "rgb(65, 71, 79)",
  },
  table: {
    border: "rgb(66, 65, 77)",
    divider: "rgba(173, 186, 199, .12)",
  },
  stripeEffect: {
    backgroundSize: "5.00px 5.00px",
    backgroundImage:
      "linear-gradient(135deg, transparent 25%," +
      "rgba(65, 71, 79, .84) 25%, rgba(65, 71, 79, .84) 50%," +
      "transparent 50%, transparent 75%," +
      "rgba(65, 71, 79, .84) 75%, rgba(65, 71, 79, .84) 100%)",
  },
};

/* -------------------------------------------------------------------------- */
/*                                 Light Theme                                */
/* -------------------------------------------------------------------------- */

const ThemeLight = {
  background: "rgb(255, 255, 255)",
  foreground: "rgba(0, 0, 0, 0.5)",
  appbar: {
    first: "rgb(52, 125, 190)",
    last: " rgb(92, 165, 220)",
  },
  table: {
    border: "rgba(0, 0, 0, .12)",
    divider: "rgba(0, 0, 0, .05)",
  },
  stripeEffect: {
    backgroundSize: "5.00px 5.00px",
    backgroundImage:
      "linear-gradient(135deg, transparent 25%," +
      "rgba(205, 205, 205, .44) 25%,rgba(205, 205, 205, .44) 50%," +
      "transparent 50%, transparent 75%," +
      "rgba(205, 205, 205, .44) 75%, rgba(205, 205, 205, .44) 100%)",
  },
};

/* -------------------------------------------------------------------------- */
/*                   Custom dark theme for react data table                   */
/* -------------------------------------------------------------------------- */

createTheme("darkest", {
  text: {
    primary: ThemeDark.row,
    secondary: "rgb(255, 255, 255)",
    disabled: "rgba(0, 0, 0, .12)",
  },
  background: {
    default: ThemeDark.background,
  },
  context: {
    background: "rgb(233, 30, 99)",
    text: "rgb(255, 255, 255)",
  },
  divider: {
    default: "rgba(66, 65, 77, .8)",
  },
  button: {
    default: "rgb(255, 255, 255)",
    focus: "rgba(255, 255, 255, .54)",
    hover: "rgba(255, 255, 255, .12)",
    disabled: "rgba(255, 255, 255, .18)",
  },
  sortFocus: {
    default: "rgba(255, 255, 255, .54)",
  },
  selected: {
    default: "rgba(65, 71, 79, .7)",
    text: "rgb(255, 255, 255)",
  },
  highlightOnHover: {
    default: "rgba(65, 71, 79, .84)",
    text: "rgb(255, 255, 255)",
  },
  striped: {
    default: "rgba(0, 0, 0, .87)",
    text: "rgb(255, 255, 255)",
  },
});

export { Colors, ThemeDark, ThemeLight };
