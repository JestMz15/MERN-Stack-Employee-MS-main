import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../../utils/apiConfig";
import { useTheme } from "../../context/ThemeContext";
import { exportToCSV, exportToPrintablePdf } from "../../utils/exportUtils";
import {
  FiCalendar,
  FiDownload,
  FiFilter,
  FiLoader,
  FiRefreshCcw,
} from "react-icons/fi";

const statusLabels = {
  present: "Presente",
  absent: "Ausente",
  sick: "Enfermo",
  leave: "Permiso",
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
};

const AttendanceReport = () => {
  const { isDark } = useTheme();
  const [report, setReport] = useState({});
  const [limit] = useState(10);
  const [skip, setSkip] = useState(0);
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchReport = async (reset = false) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ limit, skip: reset ? 0 : skip });
      if (dateFilter) {
        query.append("date", dateFilter);
      }
      const response = await axios.get(
        `${API_BASE_URL}/api/attendance/report?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (response.data.success) {
        const incoming = response.data.groupData ?? {};
        setHasMore(Object.keys(incoming).length > 0);

        setReport((prevReport) => {
          if (reset) {
            return incoming;
          }
          const merged = { ...prevReport };
          Object.entries(incoming).forEach(([date, records]) => {
            const existing = merged[date] ?? [];
            const updated = [...existing, ...records];
            merged[date] = updated;
          });
          return merged;
        });
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSkip(0);
    fetchReport(true);
  }, [dateFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (skip === 0 && !dateFilter) {
      fetchReport(true);
    } else if (skip > 0) {
      fetchReport();
    }
  }, [skip]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setSkip((prev) => prev + limit);
    }
  };

  const flatRows = useMemo(() => {
    const rows = [];
    Object.entries(report).forEach(([date, entries]) => {
      entries.forEach((record, index) => {
        rows.push({
          date,
          sno: index + 1,
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          departmentName: record.departmentName,
          status: statusLabels[record.status?.toLowerCase()] ?? record.status,
        });
      });
    });
    return rows;
  }, [report]);

const exportHeaders = [
  { label: "Fecha", key: "date" },
  { label: "No", key: "sno" },
  { label: "Codigo", key: "employeeId" },
  { label: "Nombre", key: "employeeName" },
  { label: "Departamento", key: "departmentName" },
  { label: "Estado", key: "status" },
];

  const statusTotals = useMemo(() => {
    const counts = flatRows.reduce((acc, row) => {
      if (!row.status) return acc;
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([label, value]) => ({
      label,
      value: value.toString(),
    }));
  }, [flatRows]);

  const reportDates = Object.keys(report).sort((a, b) => new Date(b) - new Date(a));
  const dateFilterLabel = dateFilter
    ? new Date(dateFilter).toLocaleDateString("es-GT")
    : "Todos";

  const handleExportCsv = () => {
    exportToCSV(flatRows, exportHeaders, "reporte_asistencia_detallado.csv", {
      metadata: [
        { label: "Filtro de fecha", value: dateFilterLabel },
        { label: "Total de fechas", value: reportDates.length },
        { label: "Total de registros", value: flatRows.length },
      ],
    });
  };

  const handleExportPdf = () => {
    exportToPrintablePdf("Reporte de asistencia", exportHeaders, flatRows, {
      subtitle: "Resumen historico de asistencia del personal",
      metadata: [
        { label: "Filtro de fecha", value: dateFilterLabel },
        { label: "Total de fechas", value: reportDates.length },
        { label: "Total de registros", value: flatRows.length },
      ],
      filters: {
        "Filtro fecha": dateFilterLabel,
      },
      summary: statusTotals,
      footerNote: "Reporte generado automaticamente desde Humana",
    });
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="rounded-3xl border border-teal-100 bg-teal-50/80 px-8 py-6 text-teal-700 shadow-lg shadow-teal-100/60 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm dark:bg-slate-950/60 dark:text-teal-200">
                <FiCalendar size={22} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest">
                  Reporte historico
                </p>
                <h1 className="text-2xl font-bold">Asistencia consolidada</h1>
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
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Filtro por fecha
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <FiFilter
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    size={16}
                  />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(event) => {
                      setDateFilter(event.target.value);
                      setReport({});
                    }}
                    className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-teal-300"
                  />
                </div>
                {dateFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      setDateFilter("");
                      setReport({});
                      setSkip(0);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-teal-300 hover:text-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-300 dark:hover:text-teal-200"
                  >
                    <FiRefreshCcw size={14} />
                    Limpiar
                  </button>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-teal-100 bg-teal-50 px-6 py-4 text-teal-700 shadow-sm dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
              <p className="text-xs font-medium uppercase tracking-wide text-teal-500 dark:text-teal-200/80">
                Total de registros
              </p>
              <p className="text-2xl font-semibold">{flatRows.length}</p>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {reportDates.length === 0 && !loading && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                No hay datos de asistencia para los filtros actuales.
              </div>
            )}

            {reportDates.map((date) => (
              <div
                key={date}
                className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70"
              >
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Fecha
                    </p>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{date}</h2>
                  </div>
                  <div className="rounded-full bg-teal-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-teal-600 dark:bg-teal-500/10 dark:text-teal-200">
                    Registros: {report[date]?.length ?? 0}
                  </div>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                    <thead>
                      <tr className="text-left text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        <th className="py-3 pr-4">No</th>
                        <th className="py-3 pr-4">Codigo</th>
                        <th className="py-3 pr-4">Nombre</th>
                        <th className="py-3 pr-4">Departamento</th>
                        <th className="py-3 pr-4">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {report[date]?.map((record, index) => (
                        <tr key={`${record.employeeId}-${index}`} className="text-slate-600 dark:text-slate-300">
                          <td className="py-3 pr-4">{index + 1}</td>
                          <td className="py-3 pr-4 font-semibold text-slate-800 dark:text-slate-200">
                            {record.employeeId}
                          </td>
                          <td className="py-3 pr-4">{record.employeeName}</td>
                          <td className="py-3 pr-4">{record.departmentName}</td>
                          <td className="py-3 pr-4 capitalize">
                            {statusLabels[record.status?.toLowerCase()] ?? record.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loading || !hasMore}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 px-6 py-2 text-sm font-semibold text-white shadow-md shadow-teal-500/30 transition hover:from-teal-400 hover:via-teal-500 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" size={16} />
                  Cargando...
                </>
              ) : hasMore ? (
                <>
                  <FiRefreshCcw size={16} />
                  Cargar mas
                </>
              ) : (
                "Sin mas registros"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;
