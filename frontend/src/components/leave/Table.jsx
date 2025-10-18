import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { columns, LeaveButtons } from "../../utils/LeaveHelper";
import axios from "axios";
import API_BASE_URL from "../../utils/apiConfig";
import { useTheme } from "../../context/ThemeContext";
import getTableStyles from "../../utils/tableStyles";
import { exportToCSV, exportToPrintablePdf } from "../../utils/exportUtils";
import { FiCalendar, FiDownload, FiFilter, FiSearch } from "react-icons/fi";

const statusLabels = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
};

const statusFilters = [
  { key: "all", label: "Todos" },
  { key: "pending", label: "Pendientes" },
  { key: "approved", label: "Aprobados" },
  { key: "rejected", label: "Rechazados" },
];

const Table = () => {
  const { isDark } = useTheme();
  const [leaves, setLeaves] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/leave`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        const mappedLeaves = response.data.leaves.map((leave, index) => {
          const statusKey = leave.status?.toLowerCase() ?? "pending";
          return {
            _id: leave._id,
            sno: index + 1,
            employeeId: leave.employeeId.employeeId,
            name: leave.employeeId.userId.name,
            leaveType: leave.leaveType,
            department: leave.employeeId.department.dep_name,
            days:
              new Date(leave.endDate).getDate() -
              new Date(leave.startDate).getDate(),
            status: leave.status,
            statusKey,
            statusLabel: statusLabels[statusKey] ?? leave.status,
            action: <LeaveButtons Id={leave._id} />,
          };
        });
        setLeaves(mappedLeaves);
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const filteredLeaves = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return leaves.filter((leave) => {
      const matchesSearch =
        !term ||
        leave.employeeId.toLowerCase().includes(term) ||
        leave.name.toLowerCase().includes(term) ||
        leave.leaveType.toLowerCase().includes(term) ||
        leave.department.toLowerCase().includes(term) ||
        leave.statusLabel.toLowerCase().includes(term);

      const matchesStatus =
        activeStatus === "all" || leave.statusKey === activeStatus;

      return matchesSearch && matchesStatus;
    });
  }, [leaves, searchTerm, activeStatus]);

  const exportRows = useMemo(
    () =>
      filteredLeaves.map((leave) => ({
        numero: leave.sno,
        codigo: leave.employeeId,
        nombre: leave.name,
        tipoPermiso: leave.leaveType,
        departamento: leave.department,
        dias: leave.days,
        estado: leave.statusLabel,
      })),
    [filteredLeaves],
  );

  const exportHeaders = [
    { label: "No", key: "numero" },
    { label: "Codigo", key: "codigo" },
    { label: "Nombre", key: "nombre" },
    { label: "Tipo de permiso", key: "tipoPermiso" },
    { label: "Departamento", key: "departamento" },
    { label: "Dias", key: "dias" },
    { label: "Estado", key: "estado" },
  ];

  const activeStatusLabel =
    statusFilters.find((filter) => filter.key === activeStatus)?.label ?? "Todos";

  const statusTotals = useMemo(() => {
    const counts = filteredLeaves.reduce((acc, leave) => {
      const key = leave.statusLabel ?? "Pendiente";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([label, value]) => ({
      label,
      value: value.toString(),
    }));
  }, [filteredLeaves]);

  const handleExportCsv = () => {
    exportToCSV(exportRows, exportHeaders, "permisos_admin.csv", {
      metadata: [
        { label: "Registros totales", value: leaves.length },
        { label: "Registros filtrados", value: filteredLeaves.length },
        { label: "Busqueda", value: searchTerm || "Todos" },
        { label: "Estado", value: activeStatusLabel },
      ],
    });
  };

  const handleExportPdf = () => {
    exportToPrintablePdf("Permisos del personal", exportHeaders, exportRows, {
      subtitle: "Consolidado general de permisos del equipo",
      metadata: [
        { label: "Registros totales", value: leaves.length },
        { label: "Registros filtrados", value: filteredLeaves.length },
      ],
      filters: {
        Busqueda: searchTerm || "Todos",
        Estado: activeStatusLabel,
      },
      summary: statusTotals,
      footerNote: "Reporte generado automaticamente desde Humana",
    });
  };

  const customStyles = useMemo(() => getTableStyles(isDark), [isDark]);

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-teal-600 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
                Administracion de permisos
              </span>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Registro general de ausencias
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Analiza, filtra y exporta el historial completo de permisos de
                  tu equipo. Accede al detalle para aprobar o rechazar cada
                  solicitud.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/70 px-6 py-5 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Solicitudes totales
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {leaves.length}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Incluye permisos en todas las etapas de aprobacion.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-200">
                <FiFilter size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Filtros activos
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Mostrando {filteredLeaves.length} de {leaves.length} registros
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

          <div className="mt-6 grid gap-4 md:grid-cols-[2fr_1fr] md:items-center">
            <div className="relative w-full">
              <FiSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                size={18}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por codigo, nombre, tipo o estado..."
                className="w-full rounded-full border border-slate-200 bg-white py-3 pl-12 pr-6 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-teal-300"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveStatus(filter.key)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    activeStatus === filter.key
                      ? "bg-teal-600 text-white shadow-md shadow-teal-500/30"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-300 dark:hover:text-teal-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
            <DataTable
              columns={columns}
              data={filteredLeaves.map((leave) => ({
                ...leave,
                status: leave.status,
              }))}
              progressPending={loading}
              pagination
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

export default Table;
