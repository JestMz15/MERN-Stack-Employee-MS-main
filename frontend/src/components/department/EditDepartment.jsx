import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../../utils/apiConfig";
import { FiLayers, FiRefreshCcw } from "react-icons/fi";

const EditDepartment = () => {
  const { id } = useParams();
  const [department, setDepartment] = useState({
    dep_name: "",
    description: "",
  });
  const [depLoading, setDepLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartment = async () => {
      setDepLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/department/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.success) {
          setDepartment({
            dep_name: response.data.department.dep_name ?? "",
            description: response.data.department.description ?? "",
          });
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      } finally {
        setDepLoading(false);
      }
    };

    fetchDepartment();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartment({ ...department, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/department/${id}`,
        department,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (response.data.success) {
        navigate("/admin-dashboard/departments");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="rounded-3xl border border-teal-100 bg-teal-50/80 px-8 py-6 text-teal-700 shadow-lg shadow-teal-100/60 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm dark:bg-slate-950/60 dark:text-teal-200">
                <FiLayers size={22} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest">
                  Editar departamento
                </p>
                <h1 className="text-2xl font-bold">Actualiza la informacion clave</h1>
              </div>
            </div>
            <p className="text-sm text-teal-600/80 dark:text-teal-200/80">
              Ajusta los datos del departamento y guardalos en un instante.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
          {depLoading ? (
            <div className="flex h-48 items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-300">
              Cargando informacion del departamento...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="dep_name"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Nombre del departamento
                  </label>
                  <input
                    id="dep_name"
                    type="text"
                    name="dep_name"
                    value={department.dep_name}
                    onChange={handleChange}
                    placeholder="Actualiza el nombre del area"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Descripcion
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={department.description}
                    onChange={handleChange}
                    placeholder="Incluye detalles de funciones y objetivos."
                    rows={5}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:from-teal-400 hover:via-teal-500 hover:to-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                >
                  <FiRefreshCcw size={18} />
                  Guardar cambios
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditDepartment;
