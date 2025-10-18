import axios from "axios";
import React from "react";
import API_BASE_URL from "./apiConfig";

const statusLabels = {
  present: "Presente",
  absent: "Ausente",
  sick: "Enfermo",
  leave: "Permiso",
};

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

export const AttendanceHelper = ({ status, employeeId, statusChange }) => {
  const markEmployee = async (nextStatus) => {
    const response = await axios.put(
      `${API_BASE_URL}/api/attendance/update/${employeeId}`,
      { status: nextStatus },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    if (response.data.success) {
      statusChange();
    }
  };

  const buttonBase =
    "inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

  if (status) {
    return (
      <span className="inline-flex min-w-[88px] items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-200">
        {statusLabels[status] ?? status}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className={`${buttonBase} bg-emerald-500/90 text-white hover:bg-emerald-500 focus-visible:outline-emerald-500`}
        onClick={() => markEmployee("present")}
      >
        Presente
      </button>
      <button
        type="button"
        className={`${buttonBase} bg-rose-500/90 text-white hover:bg-rose-500 focus-visible:outline-rose-500`}
        onClick={() => markEmployee("absent")}
      >
        Ausente
      </button>
      <button
        type="button"
        className={`${buttonBase} bg-slate-500/90 text-white hover:bg-slate-500 focus-visible:outline-slate-500`}
        onClick={() => markEmployee("sick")}
      >
        Enfermo
      </button>
      <button
        type="button"
        className={`${buttonBase} bg-amber-400 text-slate-900 hover:bg-amber-300 focus-visible:outline-amber-400`}
        onClick={() => markEmployee("leave")}
      >
        Permiso
      </button>
    </div>
  );
};
