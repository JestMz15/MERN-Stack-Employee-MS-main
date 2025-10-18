import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { FiLogOut, FiMoon, FiSun } from "react-icons/fi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/70 px-6 backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-col">
        <span className="text-xs font-semibold uppercase tracking-widest text-teal-500 dark:text-teal-300">
          Bienvenido
        </span>
        <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
          {user.name}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-teal-300 hover:text-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-300"
          aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        >
          {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:from-rose-400 hover:to-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
        >
          <FiLogOut size={16} />
          Cerrar sesion
        </button>
      </div>
    </header>
  );
};

export default Navbar;
