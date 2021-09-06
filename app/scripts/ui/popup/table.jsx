import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";

const useStyles = makeStyles({
  table: {
    width: "98%",
    margin: "auto",
  },
});

function createData(chid, codeReview, verified) {
  return { chid, codeReview, verified };
}

const rows = [createData(159123, -1, +1), createData(123451, -1, +1)];

export default function DenseTable() {
  const classes = useStyles();

  return (
    <TableContainer>
      <Table className={classes.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Change-Id</TableCell>
            <TableCell align="right">Code-Review</TableCell>
            <TableCell align="right">Verified</TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.chid}>
              <TableCell component="th" scope="row">
                {row.chid}
              </TableCell>
              <TableCell align="right">{row.codeReview}</TableCell>
              <TableCell align="right">{row.verified}</TableCell>
              <TableCell align="right">
                <IconButton size="small">
                  <DeleteIcon fontSize="inherit"/>
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
