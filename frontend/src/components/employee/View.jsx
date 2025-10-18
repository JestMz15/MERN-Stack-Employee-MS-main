import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../../utils/apiConfig";
import { resolveImageUrl, FALLBACK_AVATAR } from "../../utils/imageUtils";
import {
  FiCalendar,
  FiCreditCard,
  FiMail,
  FiShield,
  FiTag,
  FiUser,
} from "react-icons/fi";

const View = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

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
          setEmployee(response.data.employee);
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

  if (loading) {
    return (
      <div className="flex min-h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-6 py-10 text-sm font-medium text-slate-500 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-300">
        Cargando informacion del empleado...
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex min-h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-6 py-10 text-sm font-medium text-rose-500 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        No se encontro informacion del empleado.
      </div>
    );
  }

  const profileImage =
    resolveImageUrl(employee.userId?.profileImage) || FALLBACK_AVATAR;

  const maritalStatusMap = {
    single: "Soltero",
    married: "Casado",
  };

  const genderMap = {
    male: "Masculino",
    female: "Femenino",
  };

  const roleMap = {
    admin: "Administrador",
    employee: "Empleado",
  };

  const maritalStatusLabel =
    maritalStatusMap[employee.maritalStatus?.toLowerCase()] ?? employee.maritalStatus ?? "Sin informacion";

  const genderLabel =
    genderMap[employee.gender?.toLowerCase()] ?? employee.gender ?? "Sin informacion";

  const roleLabel =
    roleMap[employee.userId?.role?.toLowerCase()] ?? employee.userId?.role ?? "Sin asignar";

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
            <div className="relative flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-teal-500/20 blur-2xl" />
                <img
                  src={profileImage}
                  alt={`${employee.userId?.name ?? "Empleado"} profile`}
                  className="relative h-44 w-44 rounded-full border-4 border-white object-cover shadow-xl ring-4 ring-teal-200/80 dark:border-slate-900 dark:ring-teal-500/40"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_AVATAR;
                  }}
                />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {employee.userId?.name}
                </p>
                <p className="text-sm font-medium uppercase tracking-widest text-teal-500 dark:text-teal-300">
                  {employee.designation}
                </p>
              </div>
            </div>

            <div className="grid flex-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-200">
                    <FiUser size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Identidad
                    </p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {employee.employeeId}
                    </p>
                  </div>
                </div>
                <dl className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <FiMail className="mt-0.5 text-teal-500 dark:text-teal-300" size={16} />
                    <div>
                      <dt className="font-semibold text-slate-700 dark:text-slate-200">
                        Correo
                      </dt>
                      <dd>{employee.userId?.email ?? "No disponible"}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiCalendar className="mt-0.5 text-teal-500 dark:text-teal-300" size={16} />
                    <div>
                      <dt className="font-semibold text-slate-700 dark:text-slate-200">
                        Fecha de nacimiento
                      </dt>
                      <dd>{new Date(employee.dob).toLocaleDateString()}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiShield className="mt-0.5 text-teal-500 dark:text-teal-300" size={16} />
                    <div>
                      <dt className="font-semibold text-slate-700 dark:text-slate-200">
                        Estado civil
                      </dt>
                      <dd>{maritalStatusLabel}</dd>
                    </div>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-200">
                    <FiTag size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Informacion laboral
                    </p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {employee.department?.dep_name ?? "Sin departamento"}
                    </p>
                  </div>
                </div>
                <dl className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <FiCreditCard
                      className="mt-0.5 text-teal-500 dark:text-teal-300"
                      size={16}
                    />
                    <div>
                      <dt className="font-semibold text-slate-700 dark:text-slate-200">
                        Rol en el sistema
                      </dt>
                      <dd>{roleLabel}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiShield className="mt-0.5 text-teal-500 dark:text-teal-300" size={16} />
                    <div>
                      <dt className="font-semibold text-slate-700 dark:text-slate-200">
                        Genero
                      </dt>
                      <dd>{genderLabel}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiTag className="mt-0.5 text-teal-500 dark:text-teal-300" size={16} />
                    <div>
                      <dt className="font-semibold text-slate-700 dark:text-slate-200">
                        Designacion
                      </dt>
                      <dd>{employee.designation}</dd>
                    </div>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default View;
