import { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";
import {
  FaBuilding,
  FaCheckCircle,
  FaFileAlt,
  FaHourglassHalf,
  FaMoneyBillWave,
  FaPlusCircle,
  FaTimesCircle,
  FaUsers,
} from "react-icons/fa";
import axios from "axios";
import API_BASE_URL from "../../utils/apiConfig";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const AdminSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/dashboard/summary`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSummary(response.data);
      } catch (error) {
        if (error.response) {
          alert(error.response.data.error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center py-32 text-sm font-medium text-slate-500 dark:text-slate-300">
        Cargando resumen del panel...
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex min-h-full items-center justify-center py-32 text-sm font-medium text-rose-500 dark:text-rose-300">
        No se pudo cargar la informacion del dashboard.
      </div>
    );
  }

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const { leaveSummary } = summary;
  const formattedSalary = formatCurrency(summary.totalSalary);

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-teal-600 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
                Vision general
              </span>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white lg:text-4xl">
                  Hola, bienvenido al panel administrativo
                </h1>
                <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                  Revisa el pulso de tu organizacion: empleados, departamentos y seguimiento de permisos en un vistazo. Gestiona tu equipo con una interfaz renovada, preparada para modo claro y oscuro.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/admin-dashboard/add-employee"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-teal-500/30 transition hover:from-teal-400 hover:via-teal-500 hover:to-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                >
                  <FaPlusCircle size={16} />
                  Registrar empleado
                </Link>
                <Link
                  to="/admin-dashboard/leaves"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-teal-300 hover:text-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-300 dark:hover:text-teal-200"
                >
                  Ver permisos
                  <FiArrowRight size={16} />
                </Link>
              </div>
            </div>
              <div className="grid w-full max-w-sm gap-4 rounded-3xl border border-slate-200 bg-white/70 p-6 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Nomina proyectada
                  </p>
                  <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                    {formattedSalary}
                  </p>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  Total acumulado de los salarios registrados este mes.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-teal-50 px-4 py-3 text-teal-700 dark:bg-teal-500/10 dark:text-teal-200">
                  <p className="text-xs font-semibold uppercase tracking-wide">Empleados</p>
                  <p className="text-lg font-bold">{summary.totalEmployees}</p>
                </div>
                <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
                  <p className="text-xs font-semibold uppercase tracking-wide">Departamentos</p>
                  <p className="text-lg font-bold">{summary.totalDepartments}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Metricas destacadas</h2>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Vision general de talento
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <SummaryCard
              icon={<FaUsers />}
              text="Total de empleados"
              number={summary.totalEmployees}
              accent="teal"
            />
            <SummaryCard
              icon={<FaBuilding />}
              text="Departamentos activos"
              number={summary.totalDepartments}
              accent="amber"
            />
            <SummaryCard
              icon={<FaMoneyBillWave />}
              text="Nomina mensual"
              number={formattedSalary}
              accent="rose"
            />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Permisos y ausencias</h2>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Estado actual
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={<FaFileAlt />}
              text="Solicitudes ingresadas"
              number={leaveSummary.appliedFor}
              accent="sky"
            />
            <SummaryCard
              icon={<FaCheckCircle />}
              text="Aprobadas"
              number={leaveSummary.approved}
              accent="emerald"
            />
            <SummaryCard
              icon={<FaHourglassHalf />}
              text="Pendientes"
              number={leaveSummary.pending}
              accent="amber"
            />
            <SummaryCard
              icon={<FaTimesCircle />}
              text="Rechazadas"
              number={leaveSummary.rejected}
              accent="rose"
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Accesos directos
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li>
                <Link
                  to="/admin-dashboard/employees"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 transition hover:border-teal-300 hover:text-teal-600 dark:border-slate-700 dark:hover:border-teal-300 dark:hover:text-teal-200"
                >
                  Gestionar empleados
                  <FiArrowRight size={14} />
                </Link>
              </li>
              <li>
                <Link
                  to="/admin-dashboard/departments"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 transition hover:border-teal-300 hover:text-teal-600 dark:border-slate-700 dark:hover:border-teal-300 dark:hover:text-teal-200"
                >
                  Ver departamentos
                  <FiArrowRight size={14} />
                </Link>
              </li>
              <li>
                <Link
                  to="/admin-dashboard/attendance-report"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 transition hover:border-teal-300 hover:text-teal-600 dark:border-slate-700 dark:hover:border-teal-300 dark:hover:text-teal-200"
                >
                  Reporte de asistencia
                  <FiArrowRight size={14} />
                </Link>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/70 lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Recomendaciones rapidas
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Aprovecha los modulos clave para mantener tu organizacion al dia:
            </p>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                Mantente al tanto de las aprobaciones pendientes para responder oportunamente a tu equipo.
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                Revisa la nomina acumulada antes del cierre mensual para anticipar ajustes.
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                Actualiza departamentos cuando surjan nuevas necesidades o reorganizaciones.
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                Utiliza los reportes de asistencia para detectar patrones y tomar decisiones informadas.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminSummary;
