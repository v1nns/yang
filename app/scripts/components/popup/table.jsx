import React, {
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react";
import { differenceBy, findIndex, keyBy, merge, remove, values } from "lodash";

// Components
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import TablePagination from "@material-ui/core/TablePagination";

import Fade from "@material-ui/core/Fade";

import DataTable from "react-data-table-component";

// Icons
import Add from "@material-ui/icons/Add";
import Edit from "@material-ui/icons/Edit";
import Delete from "@material-ui/icons/Delete";
import Info from "@material-ui/icons/Info";

import Done from "@material-ui/icons/Done";
import Clear from "@material-ui/icons/Clear";

import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";

import Neg2 from "@material-ui/icons/ExposureNeg2";
import Neg1 from "@material-ui/icons/ExposureNeg1";
import Zero from "@material-ui/icons/ExposureZero";
import Plus1 from "@material-ui/icons/ExposurePlus1";
import Plus2 from "@material-ui/icons/ExposurePlus2";

import { Colors, getButtonStyle, ThemeDark, ThemeLight } from "../popup/theme";

/* -------------------------------------------------------------------------- */
/*                                Custom styles                               */
/* -------------------------------------------------------------------------- */

//  Internally, this will deep merges with the default styling
const customStyles = (dark) => {
  const borderColor = dark ? ThemeDark.table.border : ThemeLight.table.border;
  return {
    header: {
      style: {
        borderBottomWidth: "2px",
        borderBottomStyle: "solid",
        borderBottomColor: borderColor,
      },
    },
    headCells: {
      style: {
        paddingLeft: "8px",
        paddingRight: "8px",
      },
    },
    cells: {
      style: {
        paddingLeft: "8px",
        paddingRight: "8px",
      },
    },
  };
};

/* -------------------------------------------------------------------------- */
/*                         Custom components for table                        */
/* -------------------------------------------------------------------------- */

const Title = (dark) => {
  const themeStyle = {
    ...(dark && { color: ThemeDark.foreground }),
  };

  return (
    <Typography
      variant="overline"
      style={{ fontSize: 14, fontWeight: 600, ...themeStyle }}
    >
      changes
    </Typography>
  );
};

/* -------------------------------------------------------------------------- */

const ColumnTitle = ({ title, hint, dark }) => {
  const ConditionalHint = ({ condition, children }) =>
    condition ? <Tooltip title={hint}>{children}</Tooltip> : children;

  const themeStyle = {
    ...(dark && { color: ThemeDark.foreground }),
  };

  const show = hint !== undefined;
  return (
    <ConditionalHint condition={show}>
      <Typography
        variant="body2"
        style={{ fontSize: 14, fontWeight: 500, ...themeStyle }}
      >
        {title}
      </Typography>
    </ConditionalHint>
  );
};

/* -------------------------------------------------------------------------- */

const EmptyData = (
  <Grid
    container
    direction="column"
    justifyContent="center"
    alignItems="center"
    alignContent="center"
  >
    <Grid item xs>
      <Grid container justifyContent="flex-end" alignItems="center" spacing={1}>
        <Grid item>
          <Info color="primary" />
        </Grid>
        <Grid item>
          <Typography variant="subtitle2">Empty data</Typography>
        </Grid>
      </Grid>
    </Grid>
    <Grid item>
      <Typography variant="caption">
        Add a Change-Id and it will show up here.
      </Typography>
    </Grid>
  </Grid>
);

/* -------------------------------------------------------------------------- */

const Actions = (dark, disableButtons, addHandler, selectionHandler) => {
  const classes = getButtonStyle(dark);
  return (
    <div>
      <Tooltip title="Add Change-Id">
        <IconButton
          color="primary"
          size="small"
          onClick={addHandler}
          disabled={disableButtons}
          classes={{
            root: classes.root,
            disabled: classes.disabled,
          }}
        >
          <Add />
        </IconButton>
      </Tooltip>
      <Tooltip title="Toggle selection">
        <IconButton
          color="primary"
          size="small"
          onClick={selectionHandler}
          disabled={disableButtons}
          classes={{
            root: classes.root,
            disabled: classes.disabled,
          }}
        >
          <Edit />
        </IconButton>
      </Tooltip>
    </div>
  );
};

/* -------------------------------------------------------------------------- */

const ContextActions = (dark, deleteHandler) => {
  const classes = getButtonStyle(dark);
  return (
    <IconButton
      color="secondary"
      onClick={deleteHandler}
      classes={{
        root: classes.root,
        disabled: classes.disabled,
      }}
    >
      <Delete />
    </IconButton>
  );
};

/* -------------------------------------------------------------------------- */

const EditableCell = ({ row, index, column, col, onChange, onKeyDown }) => {
  const [name, setName] = useState("");
  const [value, setValue] = useState(column.selector(row));

  const handleChange = (e) => {
    // Remove leading zero and dot from input value
    const nam = e.target.name;
    const val = String(e.target.value).replace(/\D|^0+/, "");
    setName(nam);
    setValue(val);
    onChange?.(nam, val);
  };

  const handleKeyDown = (e) => {
    // Accept key 'Enter' to finish edit
    if (e.key === "Enter") {
      onKeyDown?.({ id: name });
    }
  };

  if (column?.editing) {
    return (
      <Fade in={true} timeout={900}>
        <input
          type={typeof column.selector(row) || "text"}
          name={column.selector(row)}
          style={{ width: "100%" }}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          value={value}
          autoFocus
        />
      </Fade>
    );
  }

  if (col.cell) {
    return col.cell(row, index, column);
  }
  return column.selector(row);
};

/* -------------------------------------------------------------------------- */

const Label = ({ value }) => {
  switch (value) {
    case -2:
      return <Neg2 fontSize="small" />;
    case -1:
      return <Neg1 fontSize="small" />;
    case 1:
      return <Plus1 fontSize="small" />;
    case 2:
      return <Plus2 fontSize="small" />;
    default:
      return <Zero fontSize="small" />;
  }
};

/* -------------------------------------------------------------------------- */

const TablePaginationActions = (props) => {
  const { count, page, rowsPerPage, onPageChange, dark, disableButtons } =
    props;

  // RDT uses page index starting at 1, MUI starts at 0
  // i.e. page prop will be off by one here
  const handleBackButtonClick = () => {
    onPageChange(page);
  };

  const handleNextButtonClick = () => {
    onPageChange(page + 2);
  };

  const classes = getButtonStyle(dark);
  return (
    <>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0 || disableButtons}
        aria-label="previous page"
        classes={{
          root: classes.root,
          disabled: classes.disabled,
        }}
      >
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1 || disableButtons}
        aria-label="next page"
        classes={{
          root: classes.root,
          disabled: classes.disabled,
        }}
      >
        <KeyboardArrowRight />
      </IconButton>
    </>
  );
};

/* -------------------------------------------------------------------------- */

const CustomTablePagination = ({
  rowsPerPage,
  rowCount,
  onChangePage,
  onChangeRowsPerPage,
  currentPage,
  dark,
  disableButtons,
}) => {
  // Disable text selection
  const defaultStyle = { userSelect: "none" };
  // TODO: improve this, maybe do something like "getButtonStyle"
  const themeStyle = dark
    ? {
        backgroundColor: ThemeDark.background,
        color: ThemeDark.foreground,
        borderTop: `2px solid ${ThemeDark.table.border}`,
      }
    : { borderTop: `2px solid ${ThemeLight.table.border}` };

  return (
    <TablePagination
      component="div"
      count={rowCount}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={[]}
      page={currentPage - 1}
      onPageChange={onChangePage}
      onRowsPerPageChange={({ target }) =>
        onChangeRowsPerPage(Number(target.value))
      }
      ActionsComponent={(props) =>
        TablePaginationActions({ ...props, dark, disableButtons })
      }
      style={{ ...defaultStyle, ...themeStyle }}
    />
  );
};

/* -------------------------------------------------------------------------- */
/*                               Default columns                              */
/* -------------------------------------------------------------------------- */

const rowStyle = (dark) => [
  {
    when: (row) => row.status === "MERGED",
    style: {
      backgroundColor: Colors.status.ok,
      //   color: dark ? ThemeDark.foreground : ThemeLight.foreground,
    },
  },
  {
    when: (row) => row.verified === -1 || row.codeReview === -2,
    style: {
      backgroundColor: Colors.status.fail,
      //   color: dark ? ThemeDark.foreground : ThemeLight.foreground,
    },
  },
  {
    when: (row) => row.updated === true,
    style: {
      animationName: "grayfade",
      animationDuration: "2s",
    },
  },
  {
    when: (row) => row.error === true,
    style: {
      animationName: "redfade",
      animationDuration: "2s",
    },
  },
];

const labelStyle = (name) => [
  {
    when: (row) => row[name] > 0,
    style: {
      color: Colors.label.ok,
    },
  },
  {
    when: (row) => row[name] < 0,
    style: {
      color: Colors.label.fail,
    },
  },
];

const columns = (dark) => {
  const dividerColor = dark
    ? ThemeDark.table.divider
    : ThemeLight.table.divider;

  return [
    {
      name: <ColumnTitle title="ID" hint="Change-Id" dark={dark} />,
      selector: (row) => row.id,
      width: "75px",
      editable: true,
      style: { userSelect: "none", draggable: false },
    },
    {
      name: <ColumnTitle title="Subject" dark={dark} />,
      selector: (row) => row.subject,
      compact: true,
      wrap: true,
      style: { userSelect: "none", draggable: false },
    },
    {
      name: <ColumnTitle title="CR" hint="Code-Review" dark={dark} />,
      selector: (row) => row.codeReview,
      width: "30px",
      compact: true,
      center: true,
      style: {
        userSelect: "none",
        draggable: false,
        // Add manually side borders around this label
        borderLeftStyle: "solid",
        borderLeftWidth: "1px",
        borderLeftColor: dividerColor,
        borderRightStyle: "solid",
        borderRightWidth: "1px",
        borderRightColor: dividerColor,
      },
      conditionalCellStyles: labelStyle("codeReview"),
      cell: (row) => <Label value={row.codeReview} />,
    },
    {
      name: <ColumnTitle title="V" hint="Verified" dark={dark} />,
      selector: (row) => row.verified,
      width: "30px",
      compact: true,
      center: true,
      style: { userSelect: "none", draggable: false },
      conditionalCellStyles: labelStyle("verified"),
      cell: (row) => <Label value={row.verified} />,
    },
  ];
};

/* -------------------------------------------------------------------------- */
/*                            Table for Change-Ids                            */
/* -------------------------------------------------------------------------- */

function ChidTable({ dark, chids, updated, onAddChange, onRemoveChanges }) {
  // Constants
  const [maxEntriesPerPage] = useState(5);

  // Use change-id data from props
  const [data, setData] = useState(chids);

  // Disable any action/ctx-action or button during update/delete animation
  const [disableActions, setDisableActions] = useState(false);

  /* --------------------------- Load initial data -------------------------- */

  useEffect(() => {
    // TODO: maybe add some loading animation ?
    if (chids.length > 0) {
      setData([...chids]);

      const showAnimation = chids.some(
        (obj) => obj.updated === true || obj.error === true
      );

      if (showAnimation) {
        setDisableActions(true);

        setTimeout(() => {
          remove(chids, (obj) => obj.error === true);

          for (const [index, elem] of chids.entries()) {
            if (elem.updated === true) {
              chids[index].updated = false;
            }
          }

          setData([...chids]);
          setDisableActions(false);
        }, 2000);
      }
    }
  }, [chids]);

  /* --------------------------- Update animation --------------------------- */

  useEffect(() => {
    if (updated.length > 0) {
      let updateId = [],
        removeId = [];

      // Just update data
      for (const newValue of updated) {
        const index = findIndex(data, { id: newValue.id });
        data[index] = newValue;

        if (newValue.error) {
          removeId.push(newValue.id);
        } else {
          updateId.push({ id: newValue.id, updated: false });
        }
      }

      setDisableActions(true);
      setData([...data]);

      setTimeout(() => {
        remove(data, (obj) => removeId.includes(obj.id));

        let merged = merge(keyBy(data, "id"), keyBy(updateId, "id"));
        merged = values(merged);

        setData([...merged]);
        setDisableActions(false);
      }, 2000);
    }
  }, [updated]);

  /* ----------------------------- Context modes ---------------------------- */

  // Add mode
  const [editingId, setEditingId] = useState("");

  // Selection mode
  const [selectedRows, setSelectedRows] = React.useState([]);

  // Update UI by toggling stuff
  const [toggleSelection, setToggleSelection] = useState(false);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [toggleResetPagination, setToggleResetPagination] = useState(false);

  /* ------------------------- Handlers for add mode ------------------------ */

  const addMode = () => {
    if (editingId === "" && !toggleSelection) {
      const element = { id: 0, codeReview: null, verified: null };
      setEditingId(0);
      setToggleResetPagination(!toggleResetPagination);
      setData([element, ...data]);
    }
  };

  const save = (item) => {
    setEditingId("");

    const id = formData[item.id];
    if (id == undefined || id === "") {
      // Input didn't receive any event, just remove tmp entry from data
      data.shift();
    } else {
      const exists = data.find((change) => change.id === id);
      if (exists != undefined) {
        // Change-id already exists, just remove tmp entry from data
        // TODO: maybe show some notification
        data.shift();
      } else {
        data[0].id = id;
        onAddChange(id);
      }
    }

    setData([...data]);
  };

  const cancel = () => {
    setEditingId("");

    // Remove first entry, which contains id = 0
    data.shift();
    setData([...data]);
  };

  /* ---------------------- Handlers for selection mode --------------------- */

  const selectMode = () => {
    if (data.length > 0) {
      setToggleSelection(!toggleSelection);
    }
  };

  const handleRowSelected = useCallback((state) => {
    setSelectedRows(state.selectedRows);
  }, []);

  const deleteAll = () => {
    setToggleSelection(!toggleSelection);
    setToggleCleared(!toggleCleared);
    setData(differenceBy(data, selectedRows, "id"));

    // Inform background service
    const removedIds = selectedRows.map((change) => change.id);
    onRemoveChanges(removedIds);
  };

  /* --------- Create handler to update input field on change events -------- */

  const isEditing = (record) => record.id === editingId;
  let formData = useRef({}).current;

  const formOnChange = (nam, val) => {
    formData = {
      ...formData,
      [nam]: val,
    };
  };

  /* ---------- Create actions and input field for 'editable' cell ---------- */

  const createColumns = useMemo(() => {
    const rowActions = [
      {
        name: "",
        allowOverflow: true,
        width: "50px",
        compact: true,
        style: { paddingLeft: "2px" },
        cell: (row) => {
          const editable = isEditing(row);
          if (editable) {
            return (
              <Fade in={true} timeout={900}>
                <div style={{ width: "100%" }}>
                  <IconButton
                    color="primary"
                    size="small"
                    style={{ color: Colors.label.ok }}
                    onClick={() => save(row)}
                  >
                    <Done fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    size="small"
                    style={{ color: Colors.label.fail }}
                    onClick={cancel}
                  >
                    <Clear fontSize="inherit" />
                  </IconButton>
                </div>
              </Fade>
            );
          }
        },
      },
    ];

    return [
      ...(editingId !== "" ? rowActions : []),
      ...columns(dark).map((col) => {
        if (!col.editable) {
          return col;
        }
        return {
          ...col,
          cell: (row, index, column) => {
            const editing = isEditing(row);
            return (
              <EditableCell
                row={row}
                index={index}
                column={{ ...column, editing }}
                col={col}
                onChange={formOnChange}
                onKeyDown={save}
              />
            );
          },
        };
      }),
    ];
  }, [dark, data, editingId]);

  /* ------------------------------------------------------------------------ */
  /*                                 Rendering                                */
  /* ------------------------------------------------------------------------ */

  const disableButtons =
    (editingId === 0 && !toggleSelection) || disableActions;
  const theme = dark ? "darkest" : "default";
  return (
    <div style={{ height: "300px" }}>
      <DataTable
        title={Title(dark)}
        columns={createColumns}
        data={data}
        noDataComponent={EmptyData}
        actions={Actions(dark, disableButtons, addMode, selectMode)}
        contextActions={ContextActions(dark, deleteAll)}
        selectableRows={toggleSelection}
        clearSelectedRows={toggleCleared}
        onSelectedRowsChange={handleRowSelected}
        pagination
        paginationResetDefaultPage={toggleResetPagination}
        paginationPerPage={maxEntriesPerPage}
        paginationComponent={(props) =>
          CustomTablePagination({ ...props, dark, disableButtons })
        }
        customStyles={customStyles(dark)}
        conditionalRowStyles={rowStyle(dark)}
        theme={theme}
        highlightOnHover
        dense
      />
    </div>
  );
}

export default ChidTable;
