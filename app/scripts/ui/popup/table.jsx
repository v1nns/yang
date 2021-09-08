import React, { useCallback, useRef, useState, useMemo } from "react";
import differenceBy from "lodash/differenceBy";

// Components
import Card from "@material-ui/core/Card";
import DataTable from "react-data-table-component";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

// Icons
import Add from "@material-ui/icons/AddTwoTone";
import Edit from "@material-ui/icons/EditTwoTone";
import Delete from "@material-ui/icons/DeleteTwoTone";
import Info from "@material-ui/icons/InfoTwoTone";

import Done from "@material-ui/icons/DoneTwoTone";
import Clear from "@material-ui/icons/ClearTwoTone";

import CustomTablePagination from "../popup/tablePagination";

import mockChanges from "../popup/mockData";

/* -------------------------------------------------------------------------- */
/*                         Custom components for table                        */
/* -------------------------------------------------------------------------- */

const title = (
  <Typography variant="overline" style={{ fontSize: 14, fontWeight: 600 }}>
    changes
  </Typography>
);

// TODO: fill empty popup page
const emptyData = (
  <Grid
    container
    direction="column"
    justifyContent="center"
    alignItems="center"
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

const actions = (disableButtons, addHandler, selectionHandler) => (
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

const contextActions = (deleteHandler) => (
  <IconButton color="secondary" onClick={deleteHandler}>
    <Delete />
  </IconButton>
);

const columnTitle = (title) => (
  <Typography variant="body2" style={{ fontSize: 14, fontWeight: 500 }}>
    {title}
  </Typography>
);

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
      <input
        type={typeof column.selector(row) || "text"}
        name={column.selector(row)}
        style={{ width: "100%" }}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        value={value}
        autoFocus
      />
    );
  }

  if (col.cell) {
    return col.cell(row, index, column);
  }
  return column.selector(row);
};

/* -------------------------------------------------------------------------- */
/*                               Default columns                              */
/* -------------------------------------------------------------------------- */

const columns = [
  {
    name: columnTitle("Change-Id"),
    selector: (row) => row.id,
    editable: true,
  },
  {
    name: columnTitle("Code-Review"),
    selector: (row) => row.codeReview,
    minWidth: "115px", // necessary, otherwise text will cut it off on add mode
    right: true,
  },
  {
    name: columnTitle("Verified"),
    selector: (row) => row.verified,
    right: true,
  },
];

/* -------------------------------------------------------------------------- */
/*                            Table for Change-Ids                            */
/* -------------------------------------------------------------------------- */

function ChidTable() {
  // Constants
  const [maxEntriesPerPage] = useState(5);

  // TODO: use change-id data from props
  const [data, setData] = useState(mockChanges);

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

    const newValue = formData[item.id];
    if (newValue == undefined) {
      // input didn't receive any event, just remove tmp entry from data
      data.shift();
    } else {
      const exists = data.find((change) => change.id === newValue);
      if (exists != undefined) {
        // change-id already exists, just remove tmp entry from data
        // TODO: maybe show some notification
        data.shift();
      } else {
        // TODO: check if newValue is a valid number
        data[0].id = newValue;
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
        name: columnTitle("Actions"),
        allowOverflow: true,
        width: "80px",
        cell: (row) => {
          const editable = isEditing(row);
          if (editable) {
            return (
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
    <Card variant="outlined" style={{ marginTop: 10,  height: "85%" }}>
      <DataTable
        title={title}
        columns={createColumns}
        data={data}
        noDataComponent={emptyData}
        actions={actions(disableButtons, addMode, selectMode)}
        contextActions={contextActions(deleteAll)}
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
      />
    </Card>
  );
}

export default ChidTable;
