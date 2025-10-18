import axios from "axios";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../utils/apiConfig";
import { useTheme } from "../context/ThemeContext";
import { FiLogIn, FiMoon, FiSun } from "react-icons/fi";
import { HiOutlineShieldCheck } from "react-icons/hi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });
      if (response.data.success) {
        login(response.data.user);
        localStorage.setItem("token", response.data.token);
        if (response.data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/employee-dashboard");
        }
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        setError(error.response.data.error);
      } else {
        setError("Error del servidor. Intenta nuevamente.");
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200 px-6 py-12 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen">
        <div className="absolute -left-20 top-40 h-72 w-72 rounded-full bg-teal-300/40 blur-3xl dark:bg-teal-500/30" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/20" />
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        className="absolute right-6 top-6 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg shadow-slate-200/60 transition hover:border-teal-400 hover:text-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:shadow-none dark:hover:border-teal-400 dark:hover:text-teal-200"
        aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      >
        {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
      </button>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/80 shadow-2xl shadow-teal-500/10 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-black/40 lg:flex-row">
        <div className="flex-1 border-b border-slate-100 p-10 dark:border-slate-800 lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col justify-between gap-10">
            <div className="inline-flex items-center gap-3 rounded-full border border-teal-100 bg-teal-50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-teal-600 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
              <HiOutlineShieldCheck size={18} />
              <span>Portal seguro</span>
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white lg:text-5xl">
                Gestiona tu equipo con confianza
              </h1>
              <p className="max-w-xl text-base text-slate-600 dark:text-slate-300">
                Accede al panel administrativo para supervisar empleados, departamentos y reportes desde una interfaz moderna que se adapta a tu estilo.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">Acceso rapido</p>
                <p className="mt-1 text-sm">
                  Organiza permisos, asistencias y salarios desde un mismo lugar.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">Modo claro y oscuro</p>
                <p className="mt-1 text-sm">
                  Ajusta el tema segun tu preferencia en cualquier momento.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white/90 p-10 backdrop-blur-md dark:bg-slate-950/70">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-500 dark:text-teal-300">
                Humana
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                Inicia sesion
              </h2>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Usa tus credenciales corporativas para continuar.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 shadow-sm dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Correo electronico
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.nombre@empresa.com"
                    className="peer w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Contrasena
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contrasena"
                  className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-900"
                  />
                  <span>Recordarme</span>
                </label>
                <a
                  href="#"
                  className="text-sm font-semibold text-teal-600 transition hover:text-teal-500 dark:text-teal-300"
                >
                  Olvidaste tu clave?
                </a>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:from-teal-400 hover:via-teal-500 hover:to-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              >
                <FiLogIn size={18} />
                Entrar al panel
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Acceso exclusivo para usuarios autorizados. Se registran todas las sesiones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
