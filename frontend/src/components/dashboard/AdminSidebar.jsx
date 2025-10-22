import { NavLink } from "react-router-dom";
import {
  FaBuilding,
  FaCalendarAlt,
  FaCogs,
  FaMoneyBillWave,
  FaChartPie,
  FaRegCalendarAlt,
  FaTachometerAlt,
  FaUsers,
} from "react-icons/fa";
import { AiOutlineFileText } from "react-icons/ai";

const linkBaseClasses =
  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200";

const getLinkClasses = ({ isActive }) =>
  isActive
    ? `${linkBaseClasses} bg-teal-500 text-white shadow-md shadow-teal-500/40 dark:bg-teal-500/90`
    : `${linkBaseClasses} text-slate-600 hover:bg-teal-50 hover:text-teal-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-teal-300`;

const navigationBlueprint = [
  {
    label: "General",
    description: "Resumen ejecutivo y vista global del desempeño.",
    links: [
      {
        to: "/admin-dashboard",
        label: "Panel principal",
        icon: <FaTachometerAlt />,
        end: true,
      },
    ],
  },
  {
    label: "Mantenimientos",
    description: "Entidades base que sostienen la operación diaria.",
    links: [
      {
        to: "/admin-dashboard/employees",
        label: "Empleados",
        icon: <FaUsers />,
      },
      {
        to: "/admin-dashboard/departments",
        label: "Departamentos",
        icon: <FaBuilding />,
      },
    ],
  },
  {
    label: "Procesos",
    description: "Flujos recurrentes vinculados a nómina y asistencia.",
    links: [
      {
        to: "/admin-dashboard/leaves",
        label: "Permisos",
        icon: <FaCalendarAlt />,
      },
      {
        to: "/admin-dashboard/salary/add",
        label: "Salarios",
        icon: <FaMoneyBillWave />,
      },
      {
        to: "/admin-dashboard/payroll",
        label: "Nómina",
        icon: <FaChartPie />,
      },
      {
        to: "/admin-dashboard/attendance",
        label: "Asistencia diaria",
        icon: <FaRegCalendarAlt />,
      },
    ],
  },
  {
    label: "Reportes",
    description: "Históricos y consolidado para auditorías.",
    links: [
      {
        to: "/admin-dashboard/attendance-report",
        label: "Reporte histórico",
        icon: <AiOutlineFileText />,
      },
    ],
  },
  {
    label: "Configuración",
    description: "Parámetros generales del sistema.",
    links: [
      {
        to: "/admin-dashboard/setting",
        label: "Configuración general",
        icon: <FaCogs />,
      },
    ],
  },
];

const AdminSidebar = () => {
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[272px] flex-col border-r border-slate-200 bg-white/80 px-5 py-6 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mb-7 rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 px-4 py-5 text-white shadow-lg shadow-teal-500/40">
        <h1 className="text-center text-lg font-semibold tracking-wide">
          Humana
        </h1>
        <p className="mt-1 text-center text-xs text-teal-100/90">
          Panel administrativo
        </p>
      </div>

      <nav className="custom-scroll flex-1 space-y-6 overflow-y-auto pb-12">
        {navigationBlueprint.map((section) => (
          <div key={section.label}>
            <div className="mb-2 px-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-teal-500 dark:text-teal-300">
                {section.label}
              </p>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                {section.description}
              </p>
            </div>
            <div className="space-y-2">
              {section.links.map(({ to, label, icon, end }) => (
                <NavLink key={to} to={to} className={getLinkClasses} end={end}>
                  {icon}
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-xs text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
        Consejo: utiliza el nuevo interruptor en la barra superior para alternar
        entre los temas claro y oscuro.
      </div>
    </aside>
  );
};

export default AdminSidebar;
