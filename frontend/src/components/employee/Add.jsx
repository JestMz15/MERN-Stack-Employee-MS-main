import React, { useEffect, useState } from "react";
import { fetchDepartments } from "../../utils/EmployeeHelper";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../utils/apiConfig";
import {
  FiCalendar,
  FiDollarSign,
  FiMail,
  FiShield,
  FiUploadCloud,
  FiUser,
  FiUserPlus,
} from "react-icons/fi";

const Add = () => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employeeId: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    designation: "",
    department: "",
    salary: "",
    password: "",
    role: "",
    image: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const getDepartments = async () => {
      const departmentResponse = await fetchDepartments();
      setDepartments(departmentResponse);
    };
    getDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "image" ? files?.[0] ?? null : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingField = Object.entries(formData).find(([key, value]) => {
      if (key === "image") {
        return false;
      }
      return value === null || value === undefined || value === "";
    });

    if (missingField) {
      alert("Completa todos los campos requeridos antes de continuar.");
      return;
    }

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        !(typeof value === "string" && value.trim() === "")
      ) {
        formDataObj.append(key, value);
      }
    });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/employee/add`,
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (response.data.success) {
        navigate("/admin-dashboard/employees");
      }
    } catch (error) {
      const serverMessage =
        error.response?.data?.error || error.response?.data?.message;
      alert(serverMessage || "Ocurrio un error al registrar al empleado.");
    }
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="rounded-3xl border border-teal-100 bg-teal-50/80 px-8 py-6 text-teal-700 shadow-lg shadow-teal-100/60 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm dark:bg-slate-950/60 dark:text-teal-200">
                <FiUserPlus size={20} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest">
                  Registro de empleado
                </p>
                <h1 className="text-2xl font-bold">Agrega talento a tu equipo</h1>
              </div>
            </div>
            <p className="text-sm text-teal-600/80 dark:text-teal-200/80">
              Captura la informacion personal, laboral y de acceso en una sola vista.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
          <form onSubmit={handleSubmit} className="space-y-10">
            <section className="space-y-6">
              <header className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-200">
                  <FiUser size={18} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Datos personales
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Informacion basica del colaborador.
                  </p>
                </div>
              </header>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    onChange={handleChange}
                    placeholder="Nombre y apellidos"
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Correo corporativo
                  </label>
                  <div className="relative">
                    <FiMail
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      size={16}
                    />
                    <input
                      type="email"
                      name="email"
                      onChange={handleChange}
                      placeholder="empleado@empresa.com"
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    ID de empleado
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    onChange={handleChange}
                    placeholder="Codigo interno"
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Fecha de nacimiento
                  </label>
                  <div className="relative">
                    <FiCalendar
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      size={16}
                    />
                    <input
                      type="date"
                      name="dob"
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Genero
                  </label>
                  <select
                    name="gender"
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                    required
                  >
                    <option value="">Selecciona una opcion</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Estado civil
                  </label>
                  <select
                    name="maritalStatus"
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                    required
                  >
                    <option value="">Selecciona una opcion</option>
                    <option value="single">Soltero</option>
                    <option value="married">Casado</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <header className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-200">
                  <FiShield size={18} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Datos laborales
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Asigna rol, area y salario base.
                  </p>
                </div>
              </header>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Cargo o puesto
                  </label>
                  <input
                    type="text"
                    name="designation"
                    onChange={handleChange}
                    placeholder="Ejemplo: Analista de datos"
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Departamento
                  </label>
                  <select
                    name="department"
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                    required
                  >
                    <option value="">Selecciona un departamento</option>
                    {departments.map((dep) => (
                      <option key={dep._id} value={dep._id}>
                        {dep.dep_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Salario mensual
                  </label>
                  <div className="relative">
                    <FiDollarSign
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      size={16}
                    />
                    <input
                      type="number"
                      name="salary"
                      onChange={handleChange}
                      placeholder="Monto en moneda local"
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Rol de sistema
                  </label>
                  <select
                    name="role"
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                    required
                  >
                    <option value="">Selecciona un rol</option>
                    <option value="admin">Administrador</option>
                    <option value="employee">Empleado</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <header className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-200">
                  <FiUploadCloud size={18} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Credenciales y archivos
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Define la contrasena inicial y, si deseas, sube una fotografia.
                  </p>
                </div>
              </header>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Contrasena temporal
                  </label>
                  <input
                    type="password"
                    name="password"
                    onChange={handleChange}
                    placeholder="Establece una clave segura"
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Fotografia (opcional)
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white/40 px-4 py-3 text-sm text-slate-500 transition hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                  />
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Formatos permitidos: JPG, PNG, GIF. Maximo 2 MB.
                  </p>
                </div>
              </div>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:from-teal-400 hover:via-teal-500 hover:to-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              >
                Registrar empleado
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Add;
