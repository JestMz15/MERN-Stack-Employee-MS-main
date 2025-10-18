import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API_BASE_URL from "../../utils/apiConfig";
import DataTable from "react-data-table-component";
import { useTheme } from "../../context/ThemeContext";
import getTableStyles from "../../utils/tableStyles";
import { exportToCSV, exportToPrintablePdf } from "../../utils/exportUtils";
import {
  FiCalendar,
  FiDownload,
  FiFilter,
  FiLayers,
  FiSearch,
  FiTrendingUp,
} from "react-icons/fi";

const SalaryView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [rawSalaries, setRawSalaries] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSalaries = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/salary/${id}/${user.role}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.success) {
          setRawSalaries(response.data.salary ?? []);
          setFilteredRows(response.data.salary ?? []);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSalaries();
  }, [id, user.role]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRows(rawSalaries);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = rawSalaries.filter((salary) => {
      const code = salary.employeeId?.employeeId ?? "";
      const name = salary.employeeId?.userId?.name ?? "";
      return code.toLowerCase().includes(term) || name.toLowerCase().includes(term);
    });
    setFilteredRows(filtered);
  }, [searchTerm, rawSalaries]);

  const tableData = useMemo(
    () =>
      filteredRows.map((salary, index) => ({
        sno: index + 1,
        employeeCode: salary.employeeId?.employeeId ?? "N/D",
        employeeName: salary.employeeId?.userId?.name ?? "Sin nombre",
        basicSalary: salary.basicSalary ?? 0,
        allowances: salary.allowances ?? 0,
        deductions: salary.deductions ?? 0,
        netSalary: salary.netSalary ?? 0,
        payDate: salary.payDate ? new Date(salary.payDate).toLocaleDateString() : "Sin fecha",
      })),
    [filteredRows],
  );

  const customStyles = useMemo(() => getTableStyles(isDark), [isDark]);

  const tableColumns = [
    {
      name: "No",
      selector: (row) => row.sno,
      width: "80px",
    },
    {
      name: "Empleado",
      selector: (row) => row.employeeCode,
      sortable: true,
      width: "140px",
    },
    {
      name: "Nombre",
      selector: (row) => row.employeeName,
      sortable: true,
      grow: 1,
    },
    {
      name: "Base",
      selector: (row) => row.basicSalary,
      sortable: true,
      right: true,
      format: (row) => Intl.NumberFormat().format(row.basicSalary),
    },
    {
      name: "Bonos",
      selector: (row) => row.allowances,
      sortable: true,
      right: true,
      format: (row) => Intl.NumberFormat().format(row.allowances),
    },
    {
      name: "Descuentos",
      selector: (row) => row.deductions,
      sortable: true,
      right: true,
      format: (row) => Intl.NumberFormat().format(row.deductions),
    },
    {
      name: "Total",
      selector: (row) => row.netSalary,
      sortable: true,
      right: true,
      format: (row) => Intl.NumberFormat().format(row.netSalary),
    },
    {
      name: "Fecha pago",
      selector: (row) => row.payDate,
      sortable: true,
      width: "140px",
    },
  ];

  const exportHeaders = [
    { label: "No", key: "sno" },
    { label: "Codigo", key: "employeeCode" },
    { label: "Nombre", key: "employeeName" },
    { label: "Base", key: "basicSalary" },
    { label: "Bonos", key: "allowances" },
    { label: "Descuentos", key: "deductions" },
    { label: "Total", key: "netSalary" },
    { label: "Fecha pago", key: "payDate" },
  ];

  const handleExportCsv = () => {
    exportToCSV(tableData, exportHeaders, "reporte_salarios.csv");
  };

  const handleExportPdf = () => {
    exportToPrintablePdf("Historial de salarios", exportHeaders, tableData);
  };

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
                  Historial de pagos
                </p>
                <h1 className="text-2xl font-bold">Registros salariales</h1>
              </div>
            </div>
            <p className="text-sm text-teal-600/75 dark:text-teal-200/80">
              Consulta los pagos realizados y exporta la informacion en segundos.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
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
                  Resultados: {tableData.length} registros
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
                placeholder="Buscar por codigo o nombre..."
                className="w-full rounded-full border border-slate-200 bg-white py-3 pl-12 pr-6 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-teal-300"
              />
            </div>
            <div className="flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-5 py-2 text-sm font-medium text-teal-600 shadow-sm dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
              <FiCalendar size={16} />
              <span>
                Ultimo registro:{" "}
                {tableData[0]?.payDate ?? "Sin pagados"}
              </span>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
            <DataTable
              columns={tableColumns}
              data={tableData}
              progressPending={loading}
              pagination
              highlightOnHover
              responsive
              striped
              customStyles={customStyles}
              progressComponent={
                <div className="flex h-40 w-full items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-300">
                  Cargando salarios...
                </div>
              }
              noDataComponent={
                <div className="flex h-40 w-full items-center justify-center text-sm font-medium text-slate-400 dark:text-slate-300">
                  No se encontraron salarios con el criterio actual.
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryView;
