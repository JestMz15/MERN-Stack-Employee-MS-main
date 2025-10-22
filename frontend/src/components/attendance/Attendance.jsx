import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { columns, AttendanceHelper } from "../../utils/AttendanceHelper";
import DataTable from "react-data-table-component";
import axios from "axios";
import API_BASE_URL from "../../utils/apiConfig";
import { useTheme } from "../../context/ThemeContext";
import getTableStyles from "../../utils/tableStyles";
import { exportToCSV, exportToPrintablePdf } from "../../utils/exportUtils";
import useClientPagination from "../../hooks/useClientPagination";
import {
  FiActivity,
  FiAlertCircle,
  FiCalendar,
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

const statusLabels = {
  present: "Presente",
  absent: "Ausente",
  sick: "Enfermo",
  leave: "Permiso",
};

const STATUS_FILTERS = [
  {
    key: "all",
    label: "Todos",
    metricKey: "total",
    activeClasses:
      "border-teal-500 bg-teal-500 text-white focus-visible:outline-teal-500",
    inactiveClasses:
      "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-200",
  },
  {
    key: "present",
    label: "Presentes",
    metricKey: "present",
    activeClasses:
      "border-emerald-500 bg-emerald-500/90 text-white focus-visible:outline-emerald-500",
    inactiveClasses:
      "border-emerald-200 bg-emerald-500/10 text-emerald-600 hover:border-emerald-400 hover:bg-emerald-500/20 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
  {
    key: "absent",
    label: "Ausentes",
    metricKey: "absent",
    activeClasses:
      "border-rose-500 bg-rose-500/90 text-white focus-visible:outline-rose-500",
    inactiveClasses:
      "border-rose-200 bg-rose-500/10 text-rose-600 hover:border-rose-400 hover:bg-rose-500/20 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200",
  },
  {
    key: "leave",
    label: "Permisos",
    metricKey: "leave",
    activeClasses:
      "border-blue-500 bg-blue-500/90 text-white focus-visible:outline-blue-500",
    inactiveClasses:
      "border-blue-200 bg-blue-500/10 text-blue-600 hover:border-blue-400 hover:bg-blue-500/20 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-200",
  },
  {
    key: "sick",
    label: "Enfermos",
    metricKey: "sick",
    activeClasses:
      "border-slate-500 bg-slate-500 text-white focus-visible:outline-slate-500",
    inactiveClasses:
      "border-slate-300 bg-slate-200/60 text-slate-600 hover:border-slate-400 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-200",
  },
  {
    key: "pending",
    label: "Pendientes",
    metricKey: "pending",
    activeClasses:
      "border-amber-500 bg-amber-400 text-slate-900 focus-visible:outline-amber-500",
    inactiveClasses:
      "border-amber-200 bg-amber-100 text-amber-700 hover:border-amber-400 hover:bg-amber-200 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200",
  },
];

const buildStatusBadge = (status) => {
  if (!status) {
    return (
      <span className="inline-flex min-w-[88px] items-center justify-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:bg-amber-400/20 dark:text-amber-200">
        Pendiente
      </span>
    );
  }

  const normalizedStatus = status?.toLowerCase();

  const colorMap = {
    present:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-200",
    absent:
      "bg-rose-100 text-rose-600 dark:bg-rose-400/20 dark:text-rose-200",
    sick: "bg-slate-100 text-slate-600 dark:bg-slate-400/20 dark:text-slate-200",
    leave:
      "bg-blue-100 text-blue-600 dark:bg-blue-400/20 dark:text-blue-200",
  };
  const colorClass =
    colorMap[normalizedStatus] ??
    "bg-slate-100 text-slate-600 dark:bg-slate-400/20 dark:text-slate-200";

  return (
    <span
      className={`inline-flex min-w-[88px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${colorClass}`}
    >
      {statusLabels[normalizedStatus] ?? status}
    </span>
  );
};

const Attendance = () => {
  const { isDark } = useTheme();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/attendance`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        const mapped = response.data.attendance.map(
          (attendanceRecord, index) => {
            const employee = attendanceRecord.employeeId;
            const normalizedStatus =
              attendanceRecord.status?.toLowerCase() ?? null;
            return {
              sno: index + 1,
              employeeId: employee?.employeeId ?? "N/D",
              name: employee?.userId?.name ?? "Sin nombre",
              department: employee?.department?.dep_name ?? "Sin departamento",
              status: normalizedStatus,
              statusBadge: buildStatusBadge(normalizedStatus),
              action: (
                <AttendanceHelper
                  status={normalizedStatus}
                  employeeId={employee?.employeeId}
                  statusChange={fetchAttendance}
                />
              ),
            };
          },
        );
        setAttendance(mapped);
        setLastUpdatedAt(new Date());
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const customStyles = useMemo(() => getTableStyles(isDark), [isDark]);

  const attendanceStats = useMemo(() => {
    const stats = {
      total: attendance.length,
      present: 0,
      absent: 0,
      leave: 0,
      sick: 0,
      pending: 0,
    };
    attendance.forEach((record) => {
      if (!record.status) {
        stats.pending += 1;
        return;
      }
      if (stats[record.status] !== undefined) {
        stats[record.status] += 1;
      }
    });
    return stats;
  }, [attendance]);

  const statusFilteredData = useMemo(() => {
    if (statusFilter === "all") {
      return attendance;
    }
    if (statusFilter === "pending") {
      return attendance.filter((record) => !record.status);
    }
    return attendance.filter((record) => record.status === statusFilter);
  }, [attendance, statusFilter]);

  const fullyFiltered = useMemo(() => {
    const trimmed = searchTerm.trim().toLowerCase();
    if (!trimmed) {
      return statusFilteredData;
    }
    return statusFilteredData.filter(
      (record) =>
        record.employeeId.toLowerCase().includes(trimmed) ||
        record.name.toLowerCase().includes(trimmed) ||
        record.department.toLowerCase().includes(trimmed),
    );
  }, [statusFilteredData, searchTerm]);

  const {
    currentPage,
    rowsPerPage,
    paginatedData,
    totalRows,
    handleChangePage,
    handleChangeRowsPerPage,
    resetToggle,
  } = useClientPagination(fullyFiltered);

  const filteredCount = fullyFiltered.length;

  const statusTotals = useMemo(() => {
    const accumulator = fullyFiltered.reduce((acc, record) => {
      const statusKey = record.status ?? "Pendiente";
      acc[statusKey] = (acc[statusKey] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(accumulator).map(([statusKey, value]) => {
      const readableStatus =
        statusLabels[statusKey?.toLowerCase()] ?? (statusKey ?? "Pendiente");
      return {
        label: readableStatus,
        value: value.toString(),
      };
    });
  }, [fullyFiltered]);

  const plainRows = useMemo(
    () =>
      fullyFiltered.map((record) => ({
        sno: record.sno,
        employeeId: record.employeeId,
        name: record.name,
        department: record.department,
        status: record.status
          ? statusLabels[record.status.toLowerCase()] ?? record.status
          : "Pendiente",
      })),
    [fullyFiltered],
  );

  const exportHeaders = [
    { label: "No", key: "sno" },
    { label: "Codigo", key: "employeeId" },
    { label: "Nombre", key: "name" },
    { label: "Departamento", key: "department" },
    { label: "Estado", key: "status" },
  ];

  const activeFilterLabel = useMemo(
    () =>
      STATUS_FILTERS.find((filter) => filter.key === statusFilter)?.label ??
      "Todos",
    [statusFilter],
  );

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdatedAt) {
      return "Sin sincronizar";
    }
    return lastUpdatedAt.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [lastUpdatedAt]);

  const handleExportCsv = () => {
    exportToCSV(plainRows, exportHeaders, "reporte_asistencia.csv", {
      metadata: [
        { label: "Fecha en curso", value: today },
        { label: "Filtro de estado", value: activeFilterLabel },
        { label: "Busqueda", value: searchTerm || "Todos" },
        { label: "Registros exportados", value: filteredCount },
      ],
    });
  };

  const handleExportPdf = () => {
    exportToPrintablePdf("Asistencia del dia", exportHeaders, plainRows, {
      subtitle: `Control diario del ${todayLabel}`,
      metadata: [
        { label: "Fecha en curso", value: today },
        { label: "Filtro de estado", value: activeFilterLabel },
        { label: "Registros exportados", value: filteredCount },
        { label: "Ultima actualizacion", value: lastUpdatedLabel },
      ],
      filters: {
        Estado: activeFilterLabel,
        Busqueda: searchTerm || "Todos",
      },
      summary: statusTotals,
      footerNote: "Reporte generado automaticamente desde Humana",
    });
  };

  const summaryCards = useMemo(
    () => [
      {
        label: "Presentes",
        value: attendanceStats.present,
        caption: "Confirmados en sitio",
        icon: (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-200">
            <FiUsers size={18} />
          </span>
        ),
        border: "border-emerald-200 dark:border-emerald-500/30",
      },
      {
        label: "Ausentes",
        value: attendanceStats.absent,
        caption: "Sin marcar presencia",
        icon: (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-200">
            <FiAlertCircle size={18} />
          </span>
        ),
        border: "border-rose-200 dark:border-rose-500/30",
      },
      {
        label: "Permisos",
        value: attendanceStats.leave,
        caption: "Licencias aprobadas",
        icon: (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-200">
            <FiCalendar size={18} />
          </span>
        ),
        border: "border-blue-200 dark:border-blue-500/30",
      },
      {
        label: "Enfermos",
        value: attendanceStats.sick,
        caption: "Reportes médicos",
        icon: (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-500/10 text-slate-600 dark:text-slate-200">
            <FiActivity size={18} />
          </span>
        ),
        border: "border-slate-200 dark:border-slate-600",
      },
    ],
    [attendanceStats],
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="rounded-4xl border border-slate-200 bg-white/85 p-8 shadow-xl backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-teal-500 dark:text-teal-300">
                    Asistencia diaria
                  </p>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Control diario de asistencia
                  </h1>
                  <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Supervisa en tiempo real la presencia de tu equipo. Marca estados,
                    identifica ausencias y exporta reportes listos para auditoria.
                  </p>
                </div>
                <div className="rounded-3xl border border-teal-100 bg-white/70 px-6 py-4 text-slate-600 shadow-sm dark:border-teal-500/40 dark:bg-slate-900/70 dark:text-slate-200">
                  <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 dark:text-teal-200/80">
                    Colaboradores esperados
                  </p>
                  <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                    {attendanceStats.total}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Registros generados automaticamente
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => (
                  <article
                    key={card.label}
                    className={`rounded-3xl border ${card.border} bg-white/80 p-5 text-slate-600 shadow-sm dark:bg-slate-900/80 dark:text-slate-200`}
                  >
                    <div className="flex items-center justify-between">
                      {card.icon}
                      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        {card.label}
                      </span>
                    </div>
                    <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
                      {card.value}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {card.caption}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-4xl border border-slate-200 bg-white/85 p-8 shadow-xl backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-teal-500/10 text-teal-600 dark:text-teal-200">
                <FiTrendingUp size={20} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 dark:text-teal-300">
                  Dia en curso
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {todayLabel}
                </h2>
              </div>
            </div>
            <dl className="mt-6 space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 dark:border-slate-700 dark:bg-slate-900/70">
                <dt className="font-medium text-slate-600 dark:text-slate-300">Registros filtrados</dt>
                <dd className="text-sm font-semibold text-teal-600 dark:text-teal-200">
                  {filteredCount} / {attendanceStats.total}
                </dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 dark:border-slate-700 dark:bg-slate-900/70">
                <dt className="font-medium text-slate-600 dark:text-slate-300">Pendientes de marcar</dt>
                <dd className="text-sm font-semibold text-amber-600 dark:text-amber-200">
                  {attendanceStats.pending}
                </dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 dark:border-slate-700 dark:bg-slate-900/70">
                <dt className="font-medium text-slate-600 dark:text-slate-300">Ultima sincronizacion</dt>
                <dd className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {lastUpdatedLabel}
                </dd>
              </div>
            </dl>
            <p className="mt-6 text-xs leading-relaxed text-slate-400 dark:text-slate-500">
              Cada registro se crea automaticamente al inicio del dia laboral.
              Cambia el estado desde la tabla para mantener la informacion al dia.
            </p>
          </aside>
        </section>

        <section className="rounded-4xl border border-slate-200 bg-white/85 p-6 shadow-xl backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-200">
                  <FiFilter size={18} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Filtros activos
                  </p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Ajusta la vista por estado o busca colaboradores
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  Estado
                </p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FILTERS.map((filter) => {
                    const isActive = statusFilter === filter.key;
                    return (
                      <button
                        key={filter.key}
                        type="button"
                        onClick={() => setStatusFilter(filter.key)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                          isActive ? filter.activeClasses : filter.inactiveClasses
                        }`}
                      >
                        {filter.label}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isActive
                              ? "bg-white/30 text-white"
                              : "bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {attendanceStats[filter.metricKey] ?? 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 lg:w-auto">
              <div className="relative w-full min-w-[240px] lg:w-80">
                <FiSearch
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  size={18}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por codigo, nombre o departamento..."
                  className="w-full rounded-3xl border border-slate-200 bg-white py-3 pl-12 pr-6 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-teal-300"
                />
              </div>
              <div className="flex flex-wrap gap-3">
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
                <button
                  type="button"
                  onClick={() => {
                    fetchAttendance();
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-teal-300 hover:text-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-300 dark:hover:text-teal-200"
                >
                  <FiRefreshCw size={16} />
                  Actualizar lista
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-amber-300 hover:text-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-amber-400 dark:hover:text-amber-300"
                >
                  Limpiar filtros
                </button>
                <Link
                  to="/admin-dashboard/attendance-report"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-teal-500/30 transition hover:from-teal-400 hover:via-teal-500 hover:to-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                >
                  Ver reporte historico
                </Link>
              </div>
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
                  Cargando asistencia...
                </div>
              }
              noDataComponent={
                <div className="flex h-40 w-full items-center justify-center text-sm font-medium text-slate-400 dark:text-slate-300">
                  No se encontraron registros de asistencia para los filtros
                  seleccionados.
                </div>
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Attendance;
