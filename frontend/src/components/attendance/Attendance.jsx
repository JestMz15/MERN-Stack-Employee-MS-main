import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { columns, AttendanceHelper } from "../../utils/AttendanceHelper";
import DataTable from "react-data-table-component";
import axios from "axios";
import API_BASE_URL from "../../utils/apiConfig";
import { useTheme } from "../../context/ThemeContext";
import getTableStyles from "../../utils/tableStyles";
import { exportToCSV, exportToPrintablePdf } from "../../utils/exportUtils";
import {
  FiAlertCircle,
  FiCalendar,
  FiDownload,
  FiSearch,
  FiTrendingUp,
} from "react-icons/fi";

const statusLabels = {
  present: "Presente",
  absent: "Ausente",
  sick: "Enfermo",
  leave: "Permiso",
};

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
    present: "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-200",
    absent: "bg-rose-100 text-rose-600 dark:bg-rose-400/20 dark:text-rose-200",
    sick: "bg-slate-100 text-slate-600 dark:bg-slate-400/20 dark:text-slate-200",
    leave: "bg-blue-100 text-blue-600 dark:bg-blue-400/20 dark:text-blue-200",
  };
  const colorClass =
    colorMap[normalizedStatus] ?? "bg-slate-100 text-slate-600 dark:bg-slate-400/20 dark:text-slate-200";

  return (
    <span className={`inline-flex min-w-[88px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${colorClass}`}>
      {statusLabels[normalizedStatus] ?? status}
    </span>
  );
};

const Attendance = () => {
  const { isDark } = useTheme();
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const statusChange = () => {
    fetchAttendance();
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/attendance`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        const mapped = response.data.attendance.map((attendanceRecord, index) => {
          const employee = attendanceRecord.employeeId;
          return {
            sno: index + 1,
            employeeId: employee?.employeeId ?? "N/D",
            name: employee?.userId?.name ?? "Sin nombre",
            department: employee?.department?.dep_name ?? "Sin departamento",
            status: attendanceRecord.status ?? null,
            statusBadge: buildStatusBadge(attendanceRecord.status),
            action: (
              <AttendanceHelper
                status={attendanceRecord.status}
                employeeId={employee?.employeeId}
                statusChange={statusChange}
              />
            ),
          };
        });
        setAttendance(mapped);
        setFilteredAttendance(mapped);
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
    fetchAttendance();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAttendance(attendance);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = attendance.filter(
      (record) =>
        record.employeeId.toLowerCase().includes(term) ||
        record.name.toLowerCase().includes(term) ||
        record.department.toLowerCase().includes(term),
    );
    setFilteredAttendance(filtered);
  }, [attendance, searchTerm]);

  const customStyles = useMemo(() => getTableStyles(isDark), [isDark]);

  const plainRows = useMemo(
    () =>
      filteredAttendance.map((record) => ({
        sno: record.sno,
        employeeId: record.employeeId,
        name: record.name,
        department: record.department,
        status: record.status
          ? statusLabels[record.status.toLowerCase()] ?? record.status
          : "Pendiente",
      })),
    [filteredAttendance],
  );

  const exportHeaders = [
    { label: "No", key: "sno" },
    { label: "Codigo", key: "employeeId" },
    { label: "Nombre", key: "name" },
    { label: "Departamento", key: "department" },
    { label: "Estado", key: "status" },
  ];

  const handleExportCsv = () => {
    exportToCSV(plainRows, exportHeaders, "reporte_asistencia.csv");
  };

  const handleExportPdf = () => {
    exportToPrintablePdf("Asistencia del dia", exportHeaders, plainRows);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="rounded-3xl border border-teal-100 bg-teal-50/80 px-8 py-6 text-teal-700 shadow-lg shadow-teal-100/60 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm dark:bg-slate-950/60 dark:text-teal-200">
                <FiTrendingUp size={22} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest">
                  Control diario
                </p>
                <h1 className="text-2xl font-bold">Gestion de asistencia</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-teal-100 bg-white/70 px-4 py-2 text-sm font-semibold text-teal-600 shadow-sm dark:border-teal-500/40 dark:bg-slate-950/40 dark:text-teal-200">
              <FiCalendar size={16} />
              <span>Fecha en curso: {today}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-200">
                <FiAlertCircle size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Resumen del dia
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Registros asignados: {filteredAttendance.length}
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
              <Link
                to="/admin-dashboard/attendance-report"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-teal-500/30 transition hover:from-teal-400 hover:via-teal-500 hover:to-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              >
                Ver reporte historico
              </Link>
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
                placeholder="Buscar por codigo, nombre o departamento..."
                className="w-full rounded-full border border-slate-200 bg-white py-3 pl-12 pr-6 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-teal-300"
              />
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
            <DataTable
              columns={columns}
              data={filteredAttendance}
              progressPending={loading}
              pagination
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
                  No se encontraron registros de asistencia.
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
