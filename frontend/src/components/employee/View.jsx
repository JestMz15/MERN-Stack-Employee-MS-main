import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiFileText,
  FiMail,
  FiPower,
  FiShield,
  FiUser,
} from "react-icons/fi";
import API_BASE_URL from "../../utils/apiConfig";
import { resolveImageUrl, FALLBACK_AVATAR } from "../../utils/imageUtils";
import { useAuth } from "../../context/AuthContext";

const formatDate = (value) => {
  if (!value) {
    return "Sin registro";
  }
  try {
    return new Date(value).toLocaleDateString();
  } catch (error) {
    return "Sin registro";
  }
};

const translateMaritalStatus = (status) => {
  if (!status) return "Sin registro";
  const dictionary = {
    single: "Soltero",
    married: "Casado",
    divorced: "Divorciado",
    widowed: "Viudo",
  };
  return dictionary[status.toLowerCase()] ?? status;
};

const translateGender = (gender) => {
  if (!gender) return "Sin registro";
  const dictionary = {
    male: "Masculino",
    female: "Femenino",
    other: "Otro",
  };
  return dictionary[gender.toLowerCase()] ?? gender;
};

const View = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchEmployee = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`${API_BASE_URL}/api/employee/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!isMounted) {
          return;
        }

        if (response.data.success && response.data.employee) {
          setEmployee(response.data.employee);
        } else {
          setEmployee(null);
          setError("No se encontro informacion del empleado solicitado.");
        }
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }
        const serverMessage =
          fetchError.response?.data?.error ??
          fetchError.response?.data?.message ??
          "No se pudo cargar la informacion del empleado.";
        setError(serverMessage);
        setEmployee(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEmployee();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const profileImage = useMemo(() => {
    if (!employee?.userId?.profileImage) {
      return FALLBACK_AVATAR;
    }
    return resolveImageUrl(employee.userId.profileImage) ?? FALLBACK_AVATAR;
  }, [employee]);

  const statusBadge = useMemo(() => {
    const status = employee?.status?.toLowerCase() ?? "inactive";
    const isActive = status === "active";
    return {
      label: isActive ? "Activo" : "Inactivo",
      badgeClass: isActive
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200"
        : "bg-rose-100 text-rose-600 dark:bg-rose-400/20 dark:text-rose-200",
      icon: <FiCheckCircle size={16} />,
    };
  }, [employee]);

  const salaryFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-GT", {
        style: "currency",
        currency: "GTQ",
        maximumFractionDigits: 2,
      }),
    [],
  );

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    if (user?.role === "employee") {
      navigate("/employee-dashboard");
    } else {
      navigate("/admin-dashboard/employees");
    }
  };

  const handleStatusToggle = async () => {
    if (!employee) {
      return;
    }
    setUpdatingStatus(true);
    const nextStatus =
      employee.status === "inactive" ? "active" : "inactive";
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/employee/${employee._id}/status`,
        { status: nextStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (response.data.success && response.data.employee) {
        setEmployee(response.data.employee);
      }
    } catch (statusError) {
      const serverMessage =
        statusError.response?.data?.error ??
        statusError.response?.data?.message;
      alert(serverMessage || "No se pudo actualizar el estado del empleado.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const documents = useMemo(
    () =>
      (employee?.documents ?? []).filter(
        (doc) => doc.category?.toLowerCase() !== "expediente",
      ),
    [employee],
  );
  const expedienteUrl = employee?.expedienteFile
    ? resolveImageUrl(employee.expedienteFile)
    : null;

  const dashboardPathPrefix = location.pathname.startsWith("/employee-dashboard")
    ? "/employee-dashboard"
    : "/admin-dashboard";
  const isAdmin = user?.role === "admin";
  const isEmployeeView = dashboardPathPrefix === "/employee-dashboard";
  const salaryLink = isEmployeeView
    ? `/employee-dashboard/salary/${employee?.userId?._id ?? id}`
    : `/admin-dashboard/employees/salary/${employee?._id ?? id}`;
  const editLink = `/admin-dashboard/employees/edit/${employee?._id ?? id}`;

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-teal-300 hover:text-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-300 dark:hover:text-teal-200"
          >
            <FiArrowLeft size={16} />
            Regresar
          </button>

          {employee && (
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest ${statusBadge.badgeClass}`}
              >
                {statusBadge.icon}
                {statusBadge.label}
              </span>
              {isAdmin && (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={handleStatusToggle}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    employee.status === "inactive"
                      ? "border-emerald-200 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 focus-visible:outline-emerald-500 dark:border-emerald-500/30 dark:text-emerald-200"
                      : "border-rose-200 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 focus-visible:outline-rose-500 dark:border-rose-500/30 dark:text-rose-200"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <FiPower size={14} />
                  {employee.status === "inactive" ? "Reactivar" : "Dar de baja"}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-300">
              Cargando informacion del empleado...
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-500 dark:bg-rose-500/20 dark:text-rose-200">
                <FiShield size={20} />
              </span>
              <p className="max-w-xs text-sm font-medium text-rose-600 dark:text-rose-200">
                {error}
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
                <div className="flex flex-col items-center gap-6 rounded-3xl border border-slate-200 bg-white/80 p-6 text-center shadow-inner dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="relative h-36 w-36 overflow-hidden rounded-full border-4 border-white shadow-lg ring-4 ring-teal-100/80 dark:border-slate-900 dark:ring-teal-500/20">
                    <img
                      src={profileImage}
                      alt={employee?.userId?.name ?? "Perfil de empleado"}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = FALLBACK_AVATAR;
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {employee?.userId?.name ?? "Sin nombre"}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {employee?.designation ?? "Sin puesto asignado"}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1 font-semibold text-teal-600 dark:text-teal-200">
                      <FiShield size={14} />
                      {employee?.userId?.role === "admin"
                        ? "Administrador"
                        : "Empleado"}
                    </div>
                    <span className="inline-flex items-center gap-2">
                      <FiBriefcase size={14} />
                      {employee?.department?.dep_name ?? "Sin departamento"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <FiCalendar size={14} />
                      Ingreso: {formatDate(employee?.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Identificacion
                    </p>
                    <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-200">
                          <FiUser size={16} />
                        </span>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Codigo
                          </p>
                          <p className="text-base font-semibold text-slate-900 dark:text-white">
                            {employee?.employeeId ?? "Sin codigo"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Estado civil
                        </p>
                        <p className="font-semibold">
                          {translateMaritalStatus(employee?.maritalStatus)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Genero
                        </p>
                        <p className="font-semibold">
                          {translateGender(employee?.gender)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Contacto
                    </p>
                    <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-200">
                          <FiMail size={16} />
                        </span>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Correo
                          </p>
                          <p className="font-semibold break-all">
                            {employee?.userId?.email ?? "Sin correo"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Fecha de nacimiento
                        </p>
                        <p className="font-semibold">
                          {formatDate(employee?.dob)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Ultima actualizacion
                        </p>
                        <p className="font-semibold">
                          {formatDate(employee?.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Datos laborales
                    </p>
                    <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Departamento
                        </p>
                        <p className="font-semibold">
                          {employee?.department?.dep_name ?? "Sin departamento"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Puesto
                        </p>
                        <p className="font-semibold">
                          {employee?.designation ?? "Sin puesto asignado"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Salario base
                        </p>
                        <p className="font-semibold">
                          {employee?.salary !== undefined && employee?.salary !== null
                            ? salaryFormatter.format(Number(employee.salary))
                            : "Sin registro"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Accesos rapidos
                    </p>
                    <div className="mt-3 flex flex-col gap-3">
                      {!isEmployeeView && (
                        <Link
                          to={`/admin-dashboard/employees/${employee?._id ?? id}/documentos`}
                          className="inline-flex items-center justify-between rounded-2xl border border-teal-200 bg-teal-500/10 px-4 py-3 text-sm font-semibold text-teal-600 shadow-sm transition hover:border-teal-300 hover:bg-teal-500/20 hover:text-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-200"
                        >
                          Gestionar expediente
                          <FiFileText
                            size={16}
                            className="text-teal-500 dark:text-teal-200"
                          />
                        </Link>
                      )}
                      <Link
                        to={salaryLink}
                        className="inline-flex items-center justify-between rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-600 shadow-sm transition hover:border-teal-200 hover:bg-teal-100 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-200"
                      >
                        Historial salarial
                        <FiArrowLeft
                          size={16}
                          className="rotate-180 text-teal-500 dark:text-teal-200"
                        />
                      </Link>
                      {!isEmployeeView && (
                        <Link
                          to={editLink}
                          className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-teal-200 hover:text-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-300 dark:hover:text-teal-200"
                        >
                          Editar empleado
                          <FiArrowLeft
                            size={16}
                            className="rotate-180 text-slate-400 dark:text-slate-500"
                          />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Documentacion
                    </p>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Expedientes y archivos cargados
                    </h2>
                    <p className="mt-1 max-w-xl text-xs text-slate-500 dark:text-slate-400">
                      Consulta los archivos disponibles del empleado. Para agregar o actualizar documentos utiliza el mantenimiento exclusivo del expediente.
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    {expedienteUrl && (
                      <a
                        href={expedienteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-teal-300 hover:text-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-300 dark:hover:text-teal-200"
                      >
                        <FiFileText size={16} />
                        Ver expediente
                      </a>
                    )}
                    {!isEmployeeView && (
                      <Link
                        to={`/admin-dashboard/employees/${employee?._id ?? id}/documentos`}
                        className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-teal-600 shadow-sm transition hover:border-teal-300 hover:bg-teal-500/20 hover:text-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-200"
                      >
                        Administrar expediente
                        <FiFileText size={14} />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  {documents.length === 0 && !expedienteUrl ? (
                    <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                      No hay documentos asociados a este empleado.
                    </div>
                  ) : (
                    <ul className="grid gap-4 md:grid-cols-2">
                    {expedienteUrl && (
                      <li className="flex items-center justify-between rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm text-teal-700 shadow-sm dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-200">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-teal-500 shadow-sm dark:bg-slate-900 dark:text-teal-200">
                            <FiFileText size={16} />
                          </span>
                          <div>
                            <p className="font-semibold">
                              Expediente general
                            </p>
                            <p className="text-xs uppercase tracking-wide text-teal-500/80 dark:text-teal-200/80">
                              {employee?.expedienteOriginalName ?? "Documento"}
                            </p>
                          </div>
                        </div>
                        <a
                          href={expedienteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold uppercase tracking-widest text-teal-600 transition hover:text-teal-500 dark:text-teal-200"
                        >
                          Abrir
                        </a>
                      </li>
                    )}

                    {documents.map((doc) => {
                      const documentUrl = resolveImageUrl(doc.fileUrl) ?? doc.fileUrl;
                      return (
                        <li
                          key={doc.publicId}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                              <FiFileText size={16} />
                            </span>
                            <div>
                              <p className="font-semibold">{doc.label}</p>
                              <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                {formatDate(doc.uploadedAt)} - {doc.category}
                              </p>
                            </div>
                          </div>
                          <a
                            href={documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold uppercase tracking-widest text-teal-600 transition hover:text-teal-500 dark:text-teal-200"
                          >
                            Abrir
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default View;

