import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import API_BASE_URL from "../../utils/apiConfig";
import DataTable from "react-data-table-component";
import { useTheme } from "../../context/ThemeContext";
import getTableStyles from "../../utils/tableStyles";
import { exportToCSV, exportToPrintablePdf } from "../../utils/exportUtils";
import useClientPagination from "../../hooks/useClientPagination";
import {
  FiDownload,
  FiFilePlus,
  FiSearch,
  FiShield,
  FiTag,
} from "react-icons/fi";

const statusPalette = {
  pending: "bg-amber-100 text-amber-600 dark:bg-amber-400/20 dark:text-amber-200",
  approved: "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-200",
  rejected: "bg-rose-100 text-rose-600 dark:bg-rose-400/20 dark:text-rose-200",
  default: "bg-slate-100 text-slate-600 dark:bg-slate-400/20 dark:text-slate-200",
};

const statusLabels = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "Sin fecha";

const LeavesList = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { id } = useParams();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/leave/${id}/${user.role}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (response.data.success) {
        setLeaves(response.data.leaves ?? []);
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user.role]);

  const filteredLeaves = useMemo(() => {
    if (!searchTerm.trim()) {
      return leaves;
    }
    const term = searchTerm.toLowerCase();
    return leaves.filter((leave) => {
      const statusKey = leave.status?.toLowerCase() ?? "";
      const statusLabel = statusLabels[statusKey]?.toLowerCase() ?? "";
      return (
        leave.leaveType?.toLowerCase().includes(term) ||
        statusKey.includes(term) ||
        statusLabel.includes(term) ||
        leave.reason?.toLowerCase().includes(term)
      );
    });
  }, [leaves, searchTerm]);

  const tableData = useMemo(
    () =>
      filteredLeaves.map((leave, index) => ({
        id: leave._id,
        sno: index + 1,
        leaveType: leave.leaveType ?? "Sin tipo",
        from: formatDate(leave.startDate),
        to: formatDate(leave.endDate),
        reason: leave.reason ?? "Sin descripcion",
        statusKey: leave.status?.toLowerCase() ?? "pending",
        statusLabel: statusLabels[leave.status?.toLowerCase()] ?? (leave.status ?? "Pendiente"),
      })),
    [filteredLeaves],
  );
  const {
    currentPage,
    rowsPerPage,
    paginatedData,
    totalRows,
    handleChangePage,
    handleChangeRowsPerPage,
    resetToggle,
  } = useClientPagination(tableData);

  const customStyles = useMemo(() => getTableStyles(isDark), [isDark]);

  const columns = [
    {
      name: "No",
      selector: (row) => row.sno,
      width: "80px",
    },
    {
      name: "Tipo de permiso",
      selector: (row) => row.leaveType,
      sortable: true,
      wrap: true,
    },
    {
      name: "Desde",
      selector: (row) => row.from,
      sortable: true,
    },
    {
      name: "Hasta",
      selector: (row) => row.to,
      sortable: true,
    },
    {
      name: "Descripcion",
      selector: (row) => row.reason,
      wrap: true,
      grow: 1,
    },
    {
      name: "Estado",
      selector: (row) => row.statusLabel,
      cell: (row) => {
        const palette = statusPalette[row.statusKey] ?? statusPalette.default;
        return (
          <span
            className={`inline-flex min-w-[96px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${palette}`}
          >
            {row.statusLabel}
          </span>
        );
      },
    },
  ];

  const exportHeaders = [
    { label: "No", key: "sno" },
    { label: "Tipo de permiso", key: "leaveType" },
    { label: "Desde", key: "from" },
    { label: "Hasta", key: "to" },
    { label: "Descripcion", key: "reason" },
    { label: "Estado", key: "statusLabel" },
  ];

  const statusTotals = useMemo(() => {
    const counts = tableData.reduce((acc, row) => {
      const key = row.statusLabel ?? "Pendiente";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([label, value]) => ({
      label,
      value: value.toString(),
    }));
  }, [tableData]);

  const handleExportCsv = () => {
    exportToCSV(tableData, exportHeaders, "permisos.csv", {
      metadata: [
        { label: "Colaborador", value: user.name },
        { label: "Registros filtrados", value: tableData.length },
        { label: "Busqueda", value: searchTerm || "Todos" },
      ],
    });
  };

  const handleExportPdf = () => {
    exportToPrintablePdf("Historial de permisos", exportHeaders, tableData, {
      subtitle: `Solicitudes registradas por ${user.name}`,
      metadata: [
        { label: "Registros filtrados", value: tableData.length },
        { label: "Busqueda", value: searchTerm || "Todos" },
      ],
      filters: {
        Busqueda: searchTerm || "Todos",
      },
      summary: statusTotals,
      footerNote: "Reporte generado automaticamente desde Humana",
    });
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-teal-600 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
                Historial de permisos
              </span>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Seguimiento de ausencias
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Revisa las solicitudes presentadas, su estado actual y exporta la informacion que necesites en un clic.
                </p>
              </div>
            </div>
            {user.role === "employee" && (
              <Link
                to="/employee-dashboard/add-leave"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-teal-500/30 transition hover:from-teal-400 hover:via-teal-500 hover:to-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              >
                <FiFilePlus size={18} />
                Solicitar permiso
              </Link>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-200">
                <FiShield size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Registros filtrados
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Mostrando {totalRows} de {leaves.length} solicitudes
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportPdf}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-teal-300 hover:text-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-300 dark:hover:text-teal-200"
              >
                <FiDownload size={16} />
                Exportar PDF
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-teal-300 hover:text-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-300 dark:hover:text-teal-200"
              >
                <FiDownload size={16} />
                Exportar Excel
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <FiSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                size={18}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por tipo, estado o descripcion..."
                className="w-full rounded-full border border-slate-200 bg-white py-3 pl-12 pr-6 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-teal-300"
              />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-teal-600 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
              <FiTag size={14} />
              Estados cubiertos: aprobado, pendiente, rechazado
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
            <DataTable
              columns={columns}
              data={paginatedData}
              progressPending={loading}
              pagination
              paginationServer
              paginationPerPage={rowsPerPage}
              paginationRowsPerPageOptions={[5, 10, 15, 20, 30, 50]}
              paginationTotalRows={totalRows}
              paginationDefaultPage={currentPage}
              paginationResetDefaultPage={resetToggle}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              highlightOnHover
              responsive
              striped
              customStyles={customStyles}
              progressComponent={
                <div className="flex h-40 w-full items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-300">
                  Cargando permisos...
                </div>
              }
              noDataComponent={
                <div className="flex h-40 w-full items-center justify-center text-sm font-medium text-slate-400 dark:text-slate-300">
                  No se encontraron permisos con el criterio actual.
                </div>
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default LeavesList;
