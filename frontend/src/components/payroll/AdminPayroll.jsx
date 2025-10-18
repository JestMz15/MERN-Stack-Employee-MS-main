import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import API_BASE_URL from "../../utils/apiConfig";
import { fetchDepartments } from "../../utils/EmployeeHelper";
import getTableStyles from "../../utils/tableStyles";
import { useTheme } from "../../context/ThemeContext";
import { exportToCSV, exportToPrintablePdf } from "../../utils/exportUtils";
import { FiCalendar, FiDownload, FiRefreshCcw } from "react-icons/fi";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const columns = [
  {
    name: "No",
    selector: (row) => row.sno,
    width: "70px",
  },
  {
    name: "Colaborador",
    selector: (row) => row.employeeName,
    grow: 1,
  },
  {
    name: "Codigo",
    selector: (row) => row.employeeCode,
    width: "120px",
  },
  {
    name: "Departamento",
    selector: (row) => row.departmentName,
    grow: 1,
  },
  {
    name: "Fecha pago",
    selector: (row) => row.payDateFormatted,
    width: "140px",
  },
  {
    name: "Salario base",
    selector: (row) => row.basicSalaryFormatted,
    right: true,
  },
  {
    name: "Bonos",
    selector: (row) => row.allowancesFormatted,
    right: true,
  },
  {
    name: "Deducciones",
    selector: (row) => row.deductionsFormatted,
    right: true,
  },
  {
    name: "Total neto",
    selector: (row) => row.netSalaryFormatted,
    right: true,
  },
];

const AdminPayroll = () => {
  const { isDark } = useTheme();
  const [month, setMonth] = useState(getCurrentMonth());
  const [department, setDepartment] = useState("all");
  const [departments, setDepartments] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [totals, setTotals] = useState({
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
    netSalary: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDepartments = async () => {
      const data = await fetchDepartments();
      setDepartments([{ _id: "all", dep_name: "Todos" }, ...(data ?? [])]);
    };
    loadDepartments();
  }, []);

  useEffect(() => {
    const fetchPayroll = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/salary/payroll/summary`,
          {
            params: { month, department },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (response.data.success) {
          const items = response.data.payroll.map((item, index) => {
            const payDate = item.payDate ? new Date(item.payDate) : null;
            return {
              ...item,
              sno: index + 1,
              payDateFormatted: payDate
                ? payDate.toLocaleDateString("es-GT", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "Sin fecha",
              basicSalaryFormatted: formatCurrency(item.basicSalary),
              allowancesFormatted: formatCurrency(item.allowances),
              deductionsFormatted: formatCurrency(item.deductions),
              netSalaryFormatted: formatCurrency(item.netSalary),
            };
          });
          setPayroll(items);
          setTotals(response.data.totals);
        }
      } catch (err) {
        console.error(err);
        setError("No se pudo obtener la nomina. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, [month, department]);

  const customStyles = useMemo(() => getTableStyles(isDark), [isDark]);

  const summaryCards = [
    {
      label: "Total neto",
      value: formatCurrency(totals.netSalary),
      tone: "from-teal-500/20 to-teal-400/10 text-teal-700 dark:text-teal-200",
    },
    {
      label: "Total de bonos",
      value: formatCurrency(totals.allowances),
      tone: "from-sky-500/20 to-sky-400/10 text-sky-700 dark:text-sky-200",
    },
    {
      label: "Total deducciones",
      value: formatCurrency(totals.deductions),
      tone: "from-amber-500/20 to-amber-400/10 text-amber-700 dark:text-amber-200",
    },
    {
      label: "Registros",
      value: payroll.length.toString(),
      tone: "from-violet-500/20 to-violet-400/10 text-violet-700 dark:text-violet-200",
    },
  ];

  const exportRows = payroll.map((item) => ({
    numero: item.sno,
    codigo: item.employeeCode,
    colaborador: item.employeeName,
    departamento: item.departmentName,
    fechaPago: item.payDateFormatted,
    salarioBase: item.basicSalaryFormatted,
    bonos: item.allowancesFormatted,
    deducciones: item.deductionsFormatted,
    totalNeto: item.netSalaryFormatted,
  }));

  const exportHeaders = [
    { label: "No", key: "numero" },
    { label: "Codigo", key: "codigo" },
    { label: "Colaborador", key: "colaborador" },
    { label: "Departamento", key: "departamento" },
    { label: "Fecha pago", key: "fechaPago" },
    { label: "Salario base", key: "salarioBase" },
    { label: "Bonos", key: "bonos" },
    { label: "Deducciones", key: "deducciones" },
    { label: "Total neto", key: "totalNeto" },
  ];

  const departmentLabel =
    departments.find((dep) => dep._id === department)?.dep_name ?? "Todos";

  const handleExportCsv = () =>
    exportToCSV(exportRows, exportHeaders, "nomina.csv", {
      metadata: [
        { label: "Mes", value: month },
        { label: "Departamento", value: departmentLabel },
        { label: "Registros", value: payroll.length },
        { label: "Total neto", value: formatCurrency(totals.netSalary) },
      ],
    });

  const handleExportPdf = () =>
    exportToPrintablePdf("Nomina consolidada", exportHeaders, exportRows, {
      subtitle: `Mes: ${month} · Departamento: ${departmentLabel}`,
      metadata: [
        { label: "Registros", value: payroll.length },
        { label: "Total neto", value: formatCurrency(totals.netSalary) },
      ],
      filters: {
        Mes: month,
        Departamento: departmentLabel,
      },
      summary: summaryCards.map((card) => ({
        label: card.label,
        value: card.value,
      })),
      footerNote: "Reporte generado automaticamente desde Humana",
    });

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-teal-600 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
                Control de nomina
              </span>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Nomina consolidada
              </h1>
              <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Consulta los pagos registrados por periodo y departamento.
                Exporta los detalles para tus reportes contables en segundos.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/70 px-6 py-5 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Totales del periodo
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(totals.netSalary)}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Neto acumulado para las condiciones seleccionadas.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Mes
              <div className="relative">
                <FiCalendar
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />
                <input
                  type="month"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-teal-300"
                />
              </div>
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Departamento
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="w-full rounded-full border border-slate-200 bg-white py-3 px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-teal-300"
              >
                {departments.map((dep) => (
                  <option key={dep._id} value={dep._id}>
                    {dep.dep_name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end justify-end">
              <button
                type="button"
                onClick={() => {
                  setMonth(getCurrentMonth());
                  setDepartment("all");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-teal-300 hover:text-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-300 dark:hover:text-teal-200"
              >
                <FiRefreshCcw size={14} />
                Restablecer filtros
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${card.tone} px-5 py-4 shadow-sm dark:border-slate-700`}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-300">
                  {card.label}
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
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

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
            <DataTable
              columns={columns}
              data={payroll}
              progressPending={loading}
              pagination
              highlightOnHover
              responsive
              striped
              customStyles={customStyles}
              progressComponent={
                <div className="flex h-40 w-full items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-300">
                  Cargando nomina...
                </div>
              }
              noDataComponent={
                <div className="flex h-40 w-full items-center justify-center text-sm font-medium text-slate-400 dark:text-slate-300">
                  No se encontraron registros de nomina para los filtros
                  seleccionados.
                </div>
              }
            />
          </div>
          {error && (
            <p className="mt-4 text-sm font-medium text-rose-500 dark:text-rose-300">
              {error}
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminPayroll;
