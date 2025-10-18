import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./apiConfig";
import { FiCalendar, FiDollarSign, FiEdit3, FiEye } from "react-icons/fi";

export const columns = [
  {
    name: "No",
    selector: (row) => row.sno,
    width: "70px",
  },
  {
    name: "Nombre",
    selector: (row) => row.name,
    sortable: true,
    width: "150px",
  },
  {
    name: "Fotografia",
    selector: (row) => row.profileImage,
    width: "110px",
  },
  {
    name: "Departamento",
    selector: (row) => row.dep_name,
    width: "160px",
  },
  {
    name: "Fecha de nacimiento",
    selector: (row) => row.dob,
    sortable: true,
    width: "160px",
  },
  {
    name: "Acciones",
    selector: (row) => row.action,
    center: true,
  },
];

export const fetchDepartments = async () => {
  let departments = [];
  try {
    const response = await axios.get(`${API_BASE_URL}/api/department`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (response.data.success) {
      departments = response.data.departments;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      alert(error.response.data.error);
    }
  }
  return departments;
};

// employees for salary form
export const getEmployees = async (id) => {
  let employees = [];
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/employee/department/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    if (response.data.success) {
      employees = response.data.employees;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      alert(error.response.data.error);
    }
  }
  return employees;
};

export const EmployeeButtons = ({ Id }) => {
  const navigate = useNavigate();

  const buttonBase =
    "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className={`${buttonBase} border-teal-200 bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 focus-visible:outline-teal-500 dark:border-teal-500/30 dark:text-teal-200`}
        onClick={() => navigate(`/admin-dashboard/employees/${Id}`)}
      >
        <FiEye size={14} />
        Ver
      </button>
      <button
        type="button"
        className={`${buttonBase} border-sky-200 bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 focus-visible:outline-sky-500 dark:border-sky-500/30 dark:text-sky-200`}
        onClick={() => navigate(`/admin-dashboard/employees/edit/${Id}`)}
      >
        <FiEdit3 size={14} />
        Editar
      </button>
      <button
        type="button"
        className={`${buttonBase} border-amber-200 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 focus-visible:outline-amber-500 dark:border-amber-500/30 dark:text-amber-200`}
        onClick={() => navigate(`/admin-dashboard/employees/salary/${Id}`)}
      >
        <FiDollarSign size={14} />
        Salario
      </button>
      <button
        type="button"
        className={`${buttonBase} border-violet-200 bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 focus-visible:outline-violet-500 dark:border-violet-500/30 dark:text-violet-200`}
        onClick={() => navigate(`/admin-dashboard/employees/leaves/${Id}`)}
      >
        <FiCalendar size={14} />
        Permisos
      </button>
    </div>
  );
};
