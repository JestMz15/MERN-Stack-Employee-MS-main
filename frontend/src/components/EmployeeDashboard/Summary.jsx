import React from "react";
import { FaCalendarAlt, FaUser } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const SummaryCard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-teal-600 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
                Bienvenido
              </span>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Hola {user.name}
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Visualiza tu informacion personal, solicita permisos y consulta tu historial de pagos desde este panel renovado.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/70 px-6 py-5 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Proximo paso
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:bg-teal-500/10 dark:text-teal-200">
                  <FaCalendarAlt size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Crea tu siguiente solicitud
                  </p>
                  <Link
                    to="/employee-dashboard/add-leave"
                    className="text-xs font-semibold text-teal-600 transition hover:text-teal-500 dark:text-teal-200"
                  >
                    Solicitar permiso
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            to={`/employee-dashboard/profile/${user._id}`}
            className="group flex items-center gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 text-slate-600 shadow-md transition hover:-translate-y-1 hover:border-teal-300 hover:text-teal-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-teal-300 dark:hover:text-teal-200"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 transition group-hover:bg-teal-500 group-hover:text-white dark:bg-teal-500/10 dark:text-teal-200">
              <FaUser size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Perfil
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                Actualiza tus datos personales
              </p>
            </div>
          </Link>
          <Link
            to={`/employee-dashboard/salary/${user._id}`}
            className="group flex items-center gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 text-slate-600 shadow-md transition hover:-translate-y-1 hover:border-teal-300 hover:text-teal-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-teal-300 dark:hover:text-teal-200"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 transition group-hover:bg-teal-500 group-hover:text-white dark:bg-teal-500/10 dark:text-teal-200">
              <FaCalendarAlt size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Salario
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                Consulta tus pagos recientes
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
