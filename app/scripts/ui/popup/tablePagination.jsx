import React from "react";
import PropTypes from "prop-types";
import TablePagination from "@material-ui/core/TablePagination";
import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";

function TablePaginationActions(props) {
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
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  disableButtons: PropTypes.bool.isRequired,
};

const CustomMaterialPagination = ({
  rowsPerPage,
  rowCount,
  onChangePage,
  onChangeRowsPerPage,
  currentPage,
  disableButtons,
}) => {
  // disable text selection
  const defaultStyle = { "user-select": "none" };
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

export default CustomMaterialPagination;
