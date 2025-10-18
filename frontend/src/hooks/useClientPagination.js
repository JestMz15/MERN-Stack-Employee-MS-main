import { useEffect, useMemo, useState } from "react";

const useClientPagination = (rows, initialRowsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [resetToggle, setResetToggle] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
    setResetToggle((prev) => !prev);
  }, [rows]);

  useEffect(() => {
    const totalPages = Math.max(Math.ceil(rows.length / rowsPerPage), 1);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
      setResetToggle((prev) => !prev);
    }
  }, [rows.length, rowsPerPage, currentPage]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, currentPage, rowsPerPage]);

  const handleChangePage = (page) => {
    setCurrentPage(page);
  };

  const handleChangeRowsPerPage = (newRowsPerPage, page) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(page);
  };

  return {
    currentPage,
    rowsPerPage,
    paginatedData,
    totalRows: rows.length,
    handleChangePage,
    handleChangeRowsPerPage,
    resetToggle,
  };
};

export default useClientPagination;
