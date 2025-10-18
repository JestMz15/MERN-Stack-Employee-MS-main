import { useEffect, useState } from "react";
import { fetchDepartments } from "../../utils/EmployeeHelper";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../../utils/apiConfig";
import { FiDollarSign, FiEdit3, FiLayers, FiUser } from "react-icons/fi";

const Edit = () => {
  const [employee, setEmployee] = useState({
    name: "",
    maritalStatus: "",
    designation: "",
    salary: "",
    department: "",
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const getDepartments = async () => {
      const departmentResponse = await fetchDepartments();
      setDepartments(departmentResponse);
    };
    getDepartments();
  }, []);

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/employee/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.success) {
          const employeeData = response.data.employee;
          setEmployee({
            name: employeeData.userId?.name ?? "",
            maritalStatus: employeeData.maritalStatus ?? "",
            designation: employeeData.designation ?? "",
            salary: employeeData.salary ?? "",
            department: employeeData.department ?? "",
          });
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_BASE_URL}/api/employee/${id}`, employee, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        navigate("/admin-dashboard/employees");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="rounded-3xl border border-teal-100 bg-teal-50/80 px-8 py-6 text-teal-700 shadow-lg shadow-teal-100/60 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm dark:bg-slate-950/60 dark:text-teal-200">
                <FiEdit3 size={20} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest">
                  Actualizacion de empleado
                </p>
                <h1 className="text-2xl font-bold">Edita la informacion esencial</h1>
              </div>
            </div>
            <p className="text-sm text-teal-600/80 dark:text-teal-200/80">
              Ajusta los datos laborales y personales que necesiten correcciones.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-300">
              Cargando informacion del empleado...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
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
                      Mantente al dia con el nombre y el estado civil.
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
                      value={employee.name}
                      onChange={handleChange}
                      placeholder="Actualiza el nombre"
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Estado civil
                    </label>
                    <select
                      name="maritalStatus"
                      value={employee.maritalStatus}
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
                    <FiLayers size={18} />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Datos laborales
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Actualiza posicion, area y salario.
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
                      value={employee.designation}
                      onChange={handleChange}
                      placeholder="Ejemplo: Lider de proyecto"
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
                      value={employee.department}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                      required
                    >
                      <option value="">Selecciona una opcion</option>
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
                        value={employee.salary}
                        onChange={handleChange}
                        placeholder="Monto bruto mensual"
                        className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:from-teal-400 hover:via-teal-500 hover:to-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                >
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

export default Edit;
