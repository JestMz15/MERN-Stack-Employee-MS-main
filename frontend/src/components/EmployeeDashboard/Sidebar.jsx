import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaCalendarAlt,
  FaCogs,
  FaIdBadge,
  FaTachometerAlt,
  FaWallet,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const linkBaseClasses =
  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200";

const getLinkClasses = ({ isActive }) =>
  isActive
    ? `${linkBaseClasses} bg-teal-500 text-white shadow-md shadow-teal-500/40 dark:bg-teal-500/90`
    : `${linkBaseClasses} text-slate-600 hover:bg-teal-50 hover:text-teal-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-teal-300`;

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white/80 px-4 py-6 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 px-4 py-5 text-white shadow-lg shadow-teal-500/40">
        <h1 className="text-center text-lg font-semibold tracking-wide">
          Portal del empleado
        </h1>
        <p className="mt-1 text-center text-xs text-teal-100/90">Gestion personal</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto pb-10">
        <NavLink to="/employee-dashboard" className={getLinkClasses} end>
          <FaTachometerAlt />
          <span>Resumen</span>
        </NavLink>
        <NavLink
          to={`/employee-dashboard/profile/${user._id}`}
          className={getLinkClasses}
        >
          <FaIdBadge />
          <span>Mi perfil</span>
        </NavLink>
        <NavLink
          to={`/employee-dashboard/leaves/${user._id}`}
          className={getLinkClasses}
        >
          <FaCalendarAlt />
          <span>Mis permisos</span>
        </NavLink>
        <NavLink
          to={`/employee-dashboard/salary/${user._id}`}
          className={getLinkClasses}
        >
          <FaWallet />
          <span>Mis pagos</span>
        </NavLink>
        <NavLink to="/employee-dashboard/setting" className={getLinkClasses}>
          <FaCogs />
          <span>Configuracion</span>
        </NavLink>
      </nav>
      <div className="rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-xs text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
        Consejo: puedes alternar el tema desde la barra superior segun tu preferencia.
      </div>
    </aside>
  );
};

export default Sidebar;
