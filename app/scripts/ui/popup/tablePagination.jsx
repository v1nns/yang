import React from "react";
import TablePagination from "@material-ui/core/TablePagination";
import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";

function TablePaginationActions({ count, page, rowsPerPage, onPageChange }) {
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
        disabled={page === 0}
        aria-label="previous page"
      >
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        <KeyboardArrowRight />
      </IconButton>
    </>
  );
}

const CustomMaterialPagination = ({
  rowsPerPage,
  rowCount,
  onChangePage,
  onChangeRowsPerPage,
  currentPage,
}) => (
  <TablePagination
    component="nav"
    count={rowCount}
    rowsPerPage={rowsPerPage}
    rowsPerPageOptions={[]}
    page={currentPage - 1}
    onPageChange={onChangePage}
    onRowsPerPageChange={({ target }) =>
      onChangeRowsPerPage(Number(target.value))
    }
    ActionsComponent={TablePaginationActions}
  />
);

export default CustomMaterialPagination;
