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

const actions = (addHandler, editHandler) => (
  <div>
    <Tooltip title="Add Change-Id">
      <IconButton color="primary" size="small" onClick={addHandler}>
        <Add />
      </IconButton>
    </Tooltip>
    <Tooltip title="Toggle selection">
      <IconButton color="primary" size="small" onClick={editHandler}>
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

const EditableCell = ({ row, index, column, col, onChange }) => {
  const [value, setValue] = useState(column.selector(row));

  const handleOnChange = (e) => {
    // remove leading zero and dot from input value
    const name = e.target.name;
    const value = String(e.target.value).replace(/\D|^0+/, "");
    setValue(value);
    onChange?.(name, value);
  };

  if (column?.editing) {
    return (
      <input
        type={typeof column.selector(row) || "text"}
        name={column.selector(row)}
        style={{ width: "100%" }}
        onChange={handleOnChange}
        value={value}
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
  const [paginationPage] = useState(5);

  const [state, setState] = useState({
    editingId: "",
    toggleSelection: false,
    toggleCleared: false,
  });

  const [data, setData] = useState(mockChanges);
  const [selectedRows, setSelectedRows] = React.useState([]);

  /* ------------------------------------------------------------------------ */
  /*                           Handlers for add mode                          */
  /* ------------------------------------------------------------------------ */

  const addMode = () => {
    if (state.editingId === "" && !state.toggleSelection) {
      const element = { id: 0, codeReview: 0, verified: 0 };
      setState({
        ...state,
        editingId: 0,
      });
      setData([element, ...data]);
    }
  };

  const save = (item) => {
    setState({
      ...state,
      editingId: "",
    });

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
        data[0].id = newValue;
      }
    }

    setData([...data]);
  };

  const cancel = () => {
    setState({
      ...state,
      editingId: "",
    });

    // remove first entry (with id == 0)
    data.shift();
    setData([...data]);
  };

  /* ------------------------------------------------------------------------ */
  /*                        Handlers for selection mode                       */
  /* ------------------------------------------------------------------------ */

  const selectMode = () => {
    if (state.editingId != "") {
      setState({ ...state, toggleSelection: !state.toggleSelection });
    }
  };

  const handleRowSelected = useCallback((state) => {
    setSelectedRows(state.selectedRows);
  }, []);

  const deleteAll = () => {
    const rows = selectedRows.map((r) => r.id);
    // eslint-disable-next-line no-alert
    if (
      window.confirm(`Are you sure you want to delete these entries?\r ${rows}`)
    ) {
      setState({
        ...state,
        toggleCleared: !state.toggleCleared,
      });
      setData(differenceBy(data, selectedRows, "id"));
    }
  };

  /* ------------------------------------------------------------------------ */
  /*            create handler to update input field on change events         */
  /* ------------------------------------------------------------------------ */

  const isEditing = (record) => record.id === state.editingId;
  let formData = useRef({}).current;

  const formOnChange = (nam, val) => {
    formData = {
      ...formData,
      [nam]: val,
    };
  };

  /* ------------------------------------------------------------------------ */
  /*         create actions and input field for 'editable' column/row         */
  /* ------------------------------------------------------------------------ */

  const createColumns = useMemo(() => {
    const rowActions = [
      {
        name: columnTitle("Actions"),
        allowOverflow: false,
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
      ...(state.editingId !== "" ? rowActions : []),
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
              />
            );
          },
        };
      }),
    ];
  }, [data, state.editingId]);

  const { toggleSelection, toggleCleared } = state;

  return (
    <Card variant="outlined" style={{ marginTop: 10, height: "100%" }}>
      <DataTable
        title={title}
        columns={createColumns}
        data={data}
        noDataComponent={emptyData}
        actions={actions(addMode, selectMode)}
        contextActions={contextActions(deleteAll)}
        selectableRows={toggleSelection}
        clearSelectedRows={toggleCleared}
        onSelectedRowsChange={handleRowSelected}
        dense
        highlightOnHover
        pagination
        paginationPerPage={paginationPage}
        paginationComponent={CustomTablePagination}
      />
    </Card>
  );
}

export default ChidTable;
