import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import API_BASE_URL from "./apiConfig";

export const columns = [
  {
    name: "No",
    selector: (row) => row.sno,
    width: "80px",
  },
  {
    name: "Codigo",
    selector: (row) => row.employeeId,
    sortable: true,
    width: "130px",
  },
  {
    name: "Nombre",
    selector: (row) => row.name,
    sortable: true,
    grow: 1,
  },
  {
    name: "Departamento",
    selector: (row) => row.department,
    sortable: true,
    grow: 1,
  },
  {
    name: "Estado",
    selector: (row) => row.statusBadge,
    center: true,
    width: "160px",
  },
  {
    name: "Acciones",
    selector: (row) => row.action,
    center: true,
    minWidth: "260px",
  },
];

const STATUS_OPTIONS = [
  { value: "present", label: "Presente" },
  { value: "absent", label: "Ausente" },
  { value: "leave", label: "Permiso" },
  { value: "sick", label: "Enfermo" },
];

export const AttendanceHelper = ({ status, employeeId, statusChange }) => {
  const [selectedStatus, setSelectedStatus] = useState(status ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSelectedStatus(status ?? "");
  }, [status]);

  const markEmployee = async (nextStatus) => {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    try {
      await axios.put(
        `${API_BASE_URL}/api/attendance/update/${employeeId}`,
        { status: nextStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      await statusChange();
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      } else {
        alert("No se pudo actualizar la asistencia. Intenta nuevamente.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectChange = (event) => {
    const nextStatus = event.target.value;
    setSelectedStatus(nextStatus);
    markEmployee(nextStatus || null);
  };

  const handleReset = () => {
    if (!selectedStatus) {
      return;
    }
    setSelectedStatus("");
    markEmployee(null);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex-1">
        <select
          value={selectedStatus}
          onChange={handleSelectChange}
          disabled={submitting}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-teal-300"
        >
          <option value="">Sin marcar</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        disabled={submitting || !selectedStatus}
        onClick={handleReset}
        className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-500 transition hover:border-amber-300 hover:text-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:border-amber-400 dark:hover:text-amber-300"
      >
        Limpiar
      </button>
    </div>
  );
};

AttendanceHelper.propTypes = {
  status: PropTypes.string,
  employeeId: PropTypes.string.isRequired,
  statusChange: PropTypes.func.isRequired,
};
