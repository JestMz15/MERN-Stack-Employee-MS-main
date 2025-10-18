import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./apiConfig";
import { FiEdit3, FiTrash2 } from "react-icons/fi";

export const columns = [
  {
    name: "No",
    selector: (row) => row.sno,
  },
  {
    name: "Nombre del departamento",
    selector: (row) => row.dep_name,
    sortable: true,
  },
  {
    name: "Acciones",
    selector: (row) => row.action,
  },
];

export const DepartmentButtons = ({ Id, onDepartmentDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Esta accion eliminara el departamento. Deseas continuar?",
    );
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/department/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        onDepartmentDelete();
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-600 transition hover:bg-teal-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-teal-500/30 dark:text-teal-200"
        onClick={() => navigate(`/admin-dashboard/department/${Id}`)}
      >
        <FiEdit3 size={14} />
        Editar
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-rose-500/30 dark:text-rose-200"
        onClick={() => handleDelete(Id)}
      >
        <FiTrash2 size={14} />
        Eliminar
      </button>
    </div>
  );
};
