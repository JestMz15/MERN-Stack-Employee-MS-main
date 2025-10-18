import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import API_BASE_URL from "../../utils/apiConfig";
import { useTheme } from "../../context/ThemeContext";
import {
  FiBell,
  FiCheckCircle,
  FiGlobe,
  FiKey,
  FiMoon,
  FiRefreshCcw,
  FiSun,
  FiUser,
} from "react-icons/fi";

const buildPreferenceKey = (userId) => `preferences-${userId}`;

const DEFAULT_PREFERENCES = {
  emailNotifications: true,
  pushNotifications: false,
  weeklySummary: true,
  language: "es",
};

const Setting = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme, isDark } = useTheme();

  const [passwordForm, setPasswordForm] = useState({
    userId: user._id,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const preferenceStorageKey = useMemo(() => buildPreferenceKey(user._id), [user._id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedPrefs = localStorage.getItem(preferenceStorageKey);
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch {
        setPreferences(DEFAULT_PREFERENCES);
      }
    }
  }, [preferenceStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(preferenceStorageKey, JSON.stringify(preferences));
  }, [preferences, preferenceStorageKey]);

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const validatePasswordForm = () => {
    const validationErrors = {};
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      validationErrors.confirmPassword = "Las contrasenas no coinciden.";
    }
    if (passwordForm.newPassword.length < 8) {
      validationErrors.newPassword = "La nueva contrasena debe tener al menos 8 caracteres.";
    }
    if (!/[A-Z]/.test(passwordForm.newPassword) && !validationErrors.newPassword) {
      validationErrors.newPassword = "Incluye al menos una letra mayuscula.";
    }
    if (!/[0-9]/.test(passwordForm.newPassword) && !validationErrors.newPassword) {
      validationErrors.newPassword = "Incluye al menos un numero.";
    }
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!validatePasswordForm()) {
      return;
    }
    setChangingPassword(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/setting/change-password`,
        passwordForm,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (response.data.success) {
        setFormSuccess("Tu contrasena se actualizo correctamente.");
        setPasswordForm((prev) => ({
          ...prev,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setErrors({});
        if (user.role === "admin") {
          navigate("/admin-dashboard");
        }
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        setFormError(error.response.data.error);
      } else {
        setFormError("Ocurrio un problema al actualizar la contrasena.");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePreferenceToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLanguageChange = (event) => {
    setPreferences((prev) => ({
      ...prev,
      language: event.target.value,
    }));
  };

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme);
  };

  const savePreferences = () => {
    setSavingPrefs(true);
    setPrefSaved(false);
    setTimeout(() => {
      setSavingPrefs(false);
      setPrefSaved(true);
    }, 600);
  };

  useEffect(() => {
    if (!prefSaved) return;
    const timer = setTimeout(() => setPrefSaved(false), 2500);
    return () => clearTimeout(timer);
  }, [prefSaved]);

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-teal-600 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
                Centro de configuracion
              </span>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Personaliza tu experiencia
              </h1>
              <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">
                Actualiza tu contrasena, ajusta preferencias de notificacion y escoge el tema que mejor se adapte a tus necesidades.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/70 px-6 py-5 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Perfil activo
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                {user.name}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-500 dark:text-teal-300">
                {user.role}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-200">
                <FiUser size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Informacion basica
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {user.email}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Puedes actualizar tus datos personales desde la seccion de perfil.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-200">
                <FiBell size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Notificaciones
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Personaliza como deseas recibir alertas
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={() => handlePreferenceToggle("emailNotifications")}
                  className="h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-900"
                />
                Recibir alertas por correo electronico
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={() => handlePreferenceToggle("pushNotifications")}
                  className="h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-900"
                />
                Habilitar notificaciones push
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.weeklySummary}
                  onChange={() => handlePreferenceToggle("weeklySummary")}
                  className="h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-900"
                />
                Recibir resumen semanal del equipo
              </label>
            </div>
            <button
              type="button"
              onClick={savePreferences}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-teal-500/30 transition hover:from-teal-400 hover:via-teal-500 hover:to-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            >
              <FiCheckCircle size={14} />
              {savingPrefs ? "Guardando..." : "Guardar preferencias"}
            </button>
            {prefSaved && (
              <p className="mt-3 text-xs font-medium text-teal-600 dark:text-teal-300">
                Preferencias actualizadas correctamente.
              </p>
            )}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-200">
                <FiGlobe size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Idioma preferido
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Elige el idioma de la interfaz
                </p>
              </div>
            </div>
            <select
              value={preferences.language}
              onChange={handleLanguageChange}
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
            >
              <option value="es">Espanol (default)</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-200">
                <FiMoon size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Apariencia
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Ajusta el tema visual del sistema
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
                <span className="inline-flex items-center gap-2">
                  <FiSun />
                  Tema claro
                </span>
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={!isDark}
                  onChange={() => handleThemeChange("light")}
                  className="h-4 w-4 border-slate-300 text-teal-500 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-900"
                />
              </label>
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
                <span className="inline-flex items-center gap-2">
                  <FiMoon />
                  Tema oscuro
                </span>
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={isDark}
                  onChange={() => handleThemeChange("dark")}
                  className="h-4 w-4 border-slate-300 text-teal-500 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-900"
                />
              </label>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Preferencia actual guardada como: <strong>{theme}</strong>.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-200">
              <FiKey size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Seguridad
              </p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Actualiza tu contrasena regularmente para proteger tu cuenta.
              </p>
            </div>
          </div>

          {formSuccess && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
              {formSuccess}
            </div>
          )}
          {formError && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              {formError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Contrasena actual
              </label>
              <input
                type="password"
                name="oldPassword"
                value={passwordForm.oldPassword}
                onChange={handlePasswordChange}
                placeholder="Escribe tu contrasena actual"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nueva contrasena
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Ingresa una contrasena segura"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                required
              />
              {errors.newPassword && (
                <p className="mt-1 text-xs font-medium text-rose-500 dark:text-rose-300">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Confirmar contrasena
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Repite la nueva contrasena"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                required
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs font-medium text-rose-500 dark:text-rose-300">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  }))
                }
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-teal-300 hover:text-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-300 dark:hover:text-teal-200"
              >
                <FiRefreshCcw size={14} />
                Limpiar campos
              </button>
              <button
                type="submit"
                disabled={changingPassword}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:from-rose-400 hover:via-rose-500 hover:to-rose-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
              >
                {changingPassword ? "Actualizando..." : "Cambiar contrasena"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Setting;
