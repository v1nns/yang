import React, {
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react";
import differenceBy from "lodash/differenceBy";

// Components
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import TablePagination from "@material-ui/core/TablePagination";

import Fade from "@material-ui/core/Fade";

import DataTable from "react-data-table-component";

// Icons
import Add from "@material-ui/icons/AddTwoTone";
import Edit from "@material-ui/icons/EditTwoTone";
import Delete from "@material-ui/icons/DeleteTwoTone";
import Info from "@material-ui/icons/InfoTwoTone";

import Done from "@material-ui/icons/DoneTwoTone";
import Clear from "@material-ui/icons/ClearTwoTone";

import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";

/* -------------------------------------------------------------------------- */
/*                                Custom styles                               */
/* -------------------------------------------------------------------------- */

//  Internally, this will deep merges with the default styling
const customStyles = {
  rows: {
    style: {
      borderBottomStyle: "solid",
      borderBottomWidth: "1px",
      borderBottomColor: "rgba(0,0,0,.12)",
    },
  },
};

/* -------------------------------------------------------------------------- */
/*                         Custom components for table                        */
/* -------------------------------------------------------------------------- */

const Title = (
  <Typography variant="overline" style={{ fontSize: 14, fontWeight: 600 }}>
    changes
  </Typography>
);

/* -------------------------------------------------------------------------- */

const ColumnTitle = (title) => (
  <Typography variant="body2" style={{ fontSize: 14, fontWeight: 500 }}>
    {title}
  </Typography>
);

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

const Actions = (disableButtons, addHandler, selectionHandler) => (
  <div>
    <Tooltip title="Add Change-Id">
      <IconButton
        color="primary"
        size="small"
        onClick={addHandler}
        disabled={disableButtons}
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
      >
        <Edit />
      </IconButton>
    </Tooltip>
  </div>
);

/* -------------------------------------------------------------------------- */

const ContextActions = (deleteHandler) => (
  <IconButton color="secondary" onClick={deleteHandler}>
    <Delete />
  </IconButton>
);

/* -------------------------------------------------------------------------- */

const EditableCell = ({ row, index, column, col, onChange, onKeyDown }) => {
  const [name, setName] = useState("");
  const [value, setValue] = useState(column.selector(row));

  const handleChange = (e) => {
    // remove leading zero and dot from input value
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

const TablePaginationActions = (props) => {
  const { count, page, rowsPerPage, onPageChange, disableButtons } = props;

  // RDT uses page index starting at 1, MUI starts at 0
  // i.e. page prop will be off by one here
  const handleBackButtonClick = () => {
    onPageChange(page);
  };

  const handleNextButtonClick = () => {
    onPageChange(page + 2);
  };

  return (
    <>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0 || disableButtons}
        aria-label="previous page"
      >
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1 || disableButtons}
        aria-label="next page"
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
  disableButtons,
}) => {
  // disable text selection
  const defaultStyle = { userSelect: "none" };
  const style = disableButtons
    ? { ...defaultStyle, color: "rgba(0,0,0,.26)" }
    : defaultStyle;

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
        TablePaginationActions({ ...props, disableButtons })
      }
      style={style}
    />
  );
};

/* -------------------------------------------------------------------------- */
/*                               Default columns                              */
/* -------------------------------------------------------------------------- */

const columns = [
  {
    name: ColumnTitle("Change-Id"),
    selector: (row) => row.id,
    editable: true,
    reorder: false,
  },
  {
    name: ColumnTitle("Code-Review"),
    selector: (row) => row.codeReview,
    minWidth: "115px", // necessary, otherwise text will cut it off on add mode
    compact: true,
    right: true,
    style: { "user-select": "none", draggable: false },
  },
  {
    name: ColumnTitle("Verified"),
    selector: (row) => row.verified,
    right: true,
    style: { "user-select": "none", draggable: false },
  },
];

/* -------------------------------------------------------------------------- */
/*                            Table for Change-Ids                            */
/* -------------------------------------------------------------------------- */

function ChidTable({ chids, updated, onAddChange, onRemoveChanges }) {
  // Constants
  const [maxEntriesPerPage] = useState(5);

  // Use change-id data from props
  const [data, setData] = useState(chids);

  // First loading, simply update state for data
  useEffect(() => {
    // TODO: maybe add some loading animation ?
    setData(chids);
  }, [chids]);

  // Update animation
  useEffect(() => {
    //TODO: change columns "codeReview", "verified" to a different value
    //corresponding to a update, and add some kind of style in that column
  }, [updated]);

  // Add mode
  const [editingId, setEditingId] = useState("");

  // Selection mode
  const [selectedRows, setSelectedRows] = React.useState([]);

  // Toggle stuff to update UI
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
    if (id == undefined) {
      // input didn't receive any event, just remove tmp entry from data
      data.shift();
    } else {
      const exists = data.find((change) => change.id === id);
      if (exists != undefined) {
        // change-id already exists, just remove tmp entry from data
        // TODO: maybe show some notification
        data.shift();
      } else {
        // TODO: check if newValue is a valid number
        data[0].id = id;
        onAddChange(id);
      }
    }

    setData([...data]);
  };

  const cancel = () => {
    setEditingId("");

    // remove first entry, which contains id = 0
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

  /* --------- create handler to update input field on change events -------- */

  const isEditing = (record) => record.id === editingId;
  let formData = useRef({}).current;

  const formOnChange = (nam, val) => {
    formData = {
      ...formData,
      [nam]: val,
    };
  };

  /* ---------- create actions and input field for 'editable' cell ---------- */

  const createColumns = useMemo(() => {
    const rowActions = [
      {
        name: ColumnTitle("Actions"),
        allowOverflow: true,
        width: "80px",
        cell: (row) => {
          const editable = isEditing(row);
          if (editable) {
            return (
              <Fade in={true} timeout={900}>
                <div style={{ width: "100%" }}>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => save(row)}
                  >
                    <Done fontSize="inherit" />
                  </IconButton>
                  <IconButton color="secondary" size="small" onClick={cancel}>
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
      ...columns.map((col) => {
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
  }, [data, editingId]);

  const disableButtons = editingId === 0 && !toggleSelection;

  return (
    <Card variant="outlined" style={{ height: "300px" }}>
      <DataTable
        title={Title}
        columns={createColumns}
        data={data}
        noDataComponent={EmptyData}
        actions={Actions(disableButtons, addMode, selectMode)}
        contextActions={ContextActions(deleteAll)}
        selectableRows={toggleSelection}
        clearSelectedRows={toggleCleared}
        onSelectedRowsChange={handleRowSelected}
        dense
        highlightOnHover
        pagination
        paginationResetDefaultPage={toggleResetPagination}
        paginationPerPage={maxEntriesPerPage}
        paginationComponent={(props) =>
          CustomTablePagination({ ...props, disableButtons })
        }
        customStyles={customStyles}
      />
    </Card>
  );
}

export default ChidTable;
