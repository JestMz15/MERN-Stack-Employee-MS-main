const getTableStyles = (isDark) => ({
  table: {
    style: {
      backgroundColor: isDark ? "#020617" : "#ffffff",
      color: isDark ? "#e2e8f0" : "#0f172a",
    },
  },
  header: {
    style: {
      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
      color: isDark ? "#cbd5f5" : "#1f2937",
      fontWeight: 600,
      fontSize: "0.875rem",
      minHeight: "56px",
      borderBottomWidth: "1px",
      borderBottomColor: isDark ? "#1e293b" : "#e2e8f0",
    },
  },
  headCells: {
    style: {
      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
      color: isDark ? "#f1f5f9" : "#1f2937",
      fontSize: "0.75rem",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },
  },
  rows: {
    style: {
      backgroundColor: isDark ? "#020617" : "#ffffff",
      color: isDark ? "#e2e8f0" : "#0f172a",
      borderBottomWidth: "1px",
      borderBottomColor: isDark ? "#1e293b" : "#e2e8f0",
      minHeight: "64px",
    },
    stripedStyle: {
      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
      color: isDark ? "#f8fafc" : "#0f172a",
    },
    highlightOnHoverStyle: {
      backgroundColor: isDark ? "#0f172a" : "#f1f5f9",
      color: isDark ? "#f8fafc" : "#0f172a",
      transitionDuration: "250ms",
    },
  },
  pagination: {
    style: {
      backgroundColor: isDark ? "#020617" : "#ffffff",
      color: isDark ? "#e2e8f0" : "#1f2937",
      borderTopWidth: "1px",
      borderTopColor: isDark ? "#1e293b" : "#e2e8f0",
    },
    pageButtonsStyle: {
      fill: isDark ? "#38bdf8" : "#0f172a",
      "&:hover": {
        fill: isDark ? "#38bdf8" : "#0f172a",
      },
    },
  },
  noData: {
    style: {
      backgroundColor: isDark ? "#020617" : "#ffffff",
      color: isDark ? "#94a3b8" : "#64748b",
    },
  },
});

export default getTableStyles;

