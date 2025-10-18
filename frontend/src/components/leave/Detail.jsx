import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../../utils/apiConfig";
import { resolveImageUrl, FALLBACK_AVATAR } from "../../utils/imageUtils";
import { FiArrowLeft, FiCheckCircle, FiXCircle } from "react-icons/fi";

const statusTokens = {
  approved: "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-200",
  pending: "bg-amber-100 text-amber-600 dark:bg-amber-400/20 dark:text-amber-200",
  rejected: "bg-rose-100 text-rose-600 dark:bg-rose-400/20 dark:text-rose-200",
  default: "bg-slate-100 text-slate-600 dark:bg-slate-400/20 dark:text-slate-200",
};

const statusLabels = {
  approved: "Aprobado",
  pending: "Pendiente",
  rejected: "Rechazado",
};

const Detail = () => {
  const { id } = useParams();
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeave = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/leave/detail/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.success) {
          setLeave(response.data.leave);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeave();
  }, [id]);

  const changeStatus = async (status) => {
    setUpdating(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/leave/${leave._id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (response.data.success) {
        navigate("/admin-dashboard/leaves");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-6 py-12 text-sm font-medium text-slate-500 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-300">
        Cargando detalles del permiso...
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="flex min-h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-6 py-12 text-sm font-medium text-rose-500 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        No se encontro informacion del permiso solicitado.
      </div>
    );
  }

  const profileImage =
    resolveImageUrl(leave.employeeId.userId.profileImage) || FALLBACK_AVATAR;
  const statusKey = (leave.status || "").toLowerCase();
  const badgeClass = statusTokens[statusKey] ?? statusTokens.default;

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-teal-300 hover:text-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-300 dark:hover:text-teal-200"
        >
          <FiArrowLeft size={14} />
          Volver
        </button>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="grid gap-10 md:grid-cols-[320px_1fr]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-teal-500/20 blur-2xl" />
                <img
                  src={profileImage}
                  alt={`${leave.employeeId.userId.name} profile`}
                  className="relative h-48 w-48 rounded-full border-4 border-white object-cover shadow-xl ring-4 ring-teal-200/80 dark:border-slate-900 dark:ring-teal-500/40"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_AVATAR;
                  }}
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {leave.employeeId.userId.name}
                </p>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {leave.employeeId.employeeId}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Estado actual
                </span>
                <span
                  className={`inline-flex min-w-[110px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeClass}`}
                >
                  {statusLabels[statusKey] ?? leave.status}
                </span>
              </div>
              <div className="grid gap-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Tipo de permiso
                  </p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {leave.leaveType}
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Desde
                    </p>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {new Date(leave.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Hasta
                    </p>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Departamento
                  </p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {leave.employeeId.department.dep_name}
                  </p>
                </div>
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/70">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Motivo
                  </p>
                  <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
                    {leave.reason}
                  </p>
                </div>
              </div>

              {statusKey === "pending" && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => changeStatus("Approved")}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                  >
                    <FiCheckCircle size={16} />
                    Aprobar
                  </button>
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => changeStatus("Rejected")}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
                  >
                    <FiXCircle size={16} />
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Detail;
