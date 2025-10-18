import React, { useEffect, useMemo, useState } from "react";
import { fetchDepartments, getEmployees } from "../../utils/EmployeeHelper";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../utils/apiConfig";
import {
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiLayers,
  FiPercent,
  FiUser,
} from "react-icons/fi";

const INITIAL_FORM = {
  employeeId: "",
  departmentId: "",
  basicSalary: "",
  allowances: "",
  deductions: "",
  payDate: "",
};

const Add = () => {
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDepartments = async () => {
      const fetchedDepartments = await fetchDepartments();
      setDepartments(fetchedDepartments ?? []);
    };
    loadDepartments();
  }, []);

  const departmentNameMap = useMemo(() => {
    const map = new Map();
    departments.forEach((dep) => map.set(dep._id, dep.dep_name));
    return map;
  }, [departments]);

  const handleDepartmentChange = async (event) => {
    const departmentId = event.target.value;
    setFormState((prev) => ({ ...prev, departmentId, employeeId: "" }));

    if (!departmentId) {
      setEmployees([]);
      return;
    }

    setLoadingEmployees(true);
    const departmentEmployees = (await getEmployees(departmentId)) ?? [];
    setEmployees(departmentEmployees);
    setLoadingEmployees(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      employeeId: formState.employeeId,
      basicSalary: Number(formState.basicSalary),
      allowances: Number(formState.allowances),
      deductions: Number(formState.deductions),
      payDate: formState.payDate,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/salary/add`, payload, {
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
      } else {
        alert("Ocurrio un error al registrar el salario.");
      }
    }
  };

  const selectedDepartmentName =
    formState.departmentId && departmentNameMap.get(formState.departmentId)
      ? departmentNameMap.get(formState.departmentId)
      : "Sin departamento";

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="rounded-3xl border border-teal-100 bg-teal-50/80 px-8 py-6 text-teal-700 shadow-lg shadow-teal-100/60 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm dark:bg-slate-950/60 dark:text-teal-200">
                <FiDollarSign size={22} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest">
                  Registro de pagos
                </p>
                <h1 className="text-2xl font-bold">Genera un nuevo salario</h1>
              </div>
            </div>
            <p className="text-sm text-teal-600/80 dark:text-teal-200/80">
              Selecciona el departamento, asigna al colaborador y define los montos clave.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
          <form onSubmit={handleSubmit} className="space-y-10">
            <section className="space-y-6">
              <header className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-200">
                  <FiLayers size={18} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Seleccion de equipo
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Filtra los colaboradores por area y elige al destinatario del pago.
                  </p>
                </div>
              </header>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Departamento
                  </label>
                  <select
                    name="departmentId"
                    value={formState.departmentId}
                    onChange={handleDepartmentChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                    required
                  >
                    <option value="">Selecciona un departamento</option>
                    {departments.map((department) => (
                      <option key={department._id} value={department._id}>
                        {department.dep_name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Area seleccionada: <span className="font-semibold">{selectedDepartmentName}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Colaborador
                  </label>
                  <select
                    name="employeeId"
                    value={formState.employeeId}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                    required
                    disabled={loadingEmployees || employees.length === 0}
                  >
                    <option value="">
                      {loadingEmployees ? "Cargando empleados..." : "Selecciona un colaborador"}
                    </option>
                    {employees.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.employeeId} - {employee.userId?.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Asegurate de que el colaborador pertenezca al departamento seleccionado.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <header className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-200">
                  <FiDollarSign size={18} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Detalles del pago
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Captura montos fijos, variables y fecha de liquidacion.
                  </p>
                </div>
              </header>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Salario base
                  </label>
                  <div className="relative">
                    <FiDollarSign
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      size={16}
                    />
                    <input
                      type="number"
                      name="basicSalary"
                      min="0"
                      step="0.01"
                      value={formState.basicSalary}
                      onChange={handleChange}
                      placeholder="Monto base mensual"
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Permisos y bonos
                  </label>
                  <div className="relative">
                    <FiPercent
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      size={16}
                    />
                    <input
                      type="number"
                      name="allowances"
                      min="0"
                      step="0.01"
                      value={formState.allowances}
                      onChange={handleChange}
                      placeholder="Montos adicionales"
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Deducciones
                  </label>
                  <div className="relative">
                    <FiUser
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      size={16}
                    />
                    <input
                      type="number"
                      name="deductions"
                      min="0"
                      step="0.01"
                      value={formState.deductions}
                      onChange={handleChange}
                      placeholder="Descuentos aplicados"
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Fecha de pago
                  </label>
                  <div className="relative">
                    <FiCalendar
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      size={16}
                    />
                    <input
                      type="date"
                      name="payDate"
                      value={formState.payDate}
                      onChange={handleChange}
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
                <FiCheckCircle size={18} />
                Guardar salario
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Add;
