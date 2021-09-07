import React from "react";
import differenceBy from "lodash/differenceBy";

import Card from "@material-ui/core/Card";
import DataTable from "react-data-table-component";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

import Add from "@material-ui/icons/AddTwoTone";
import Edit from "@material-ui/icons/EditTwoTone";
import Delete from "@material-ui/icons/DeleteTwoTone";
import Info from "@material-ui/icons/InfoTwoTone";

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
  // TODO: add cancel button for toggling selection mode
  <IconButton color="secondary" onClick={deleteHandler}>
    <Delete />
  </IconButton>
);

const columns = [
  {
    name: "Change-Id",
    selector: (row) => row.changeId,
  },
  {
    name: "Code-Review",
    selector: (row) => row.codeReview,
    right: true,
  },
  {
    name: "Verified",
    selector: (row) => row.verified,
    right: true,
  },
];

// const tableDataItems = [
//   {
//     changeId: 1234567,
//     codeReview: 1,
//     verified: -2,
//   },
//   {
//     changeId: 7894513,
//     codeReview: -2,
//     verified: 1,
//   },
// ];

const tableDataItems = [];

export default function ChidTable() {
  const [toggleSelectable, setToggleSelectable] = React.useState(false);
  const [toggleCleared, setToggleCleared] = React.useState(false);

  const [selectedRows, setSelectedRows] = React.useState([]);

  const [data, setData] = React.useState(tableDataItems);

  const handleRowSelected = React.useCallback((state) => {
    setSelectedRows(state.selectedRows);
  }, []);

  const addMode = () => {
    console.log("uhul");
  };

  const editMode = () => {
    setToggleSelectable(!toggleSelectable);
  };

  const deleteAll = () => {
    const rows = selectedRows.map((r) => r.changeId);
    // eslint-disable-next-line no-alert
    if (
      window.confirm(`Are you sure you want to delete these entries?\r ${rows}`)
    ) {
      setToggleCleared(!toggleCleared);
      setData(differenceBy(data, selectedRows, "changeId"));
    }
  };

  return (
    <Card style={{ marginTop: 10, height: "100%" }}>
      <DataTable
        title="changes"
        columns={columns}
        data={data}
        noDataComponent={emptyData}
        actions={actions(addMode, editMode)}
        contextActions={contextActions(deleteAll)}
        selectableRows={toggleSelectable}
        onSelectedRowsChange={handleRowSelected}
        clearSelectedRows={toggleCleared}
        dense
        responsive
        highlightOnHover
      />
    </Card>
  );
}
