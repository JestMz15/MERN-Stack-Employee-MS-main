import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const statusLabels = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
};

export const columns = [
  {
    name: "No",
    selector: (row) => row.sno,
    width: "70px",
  },
  {
    name: "Codigo",
    selector: (row) => row.employeeId,
    width: "110px",
  },
  {
    name: "Nombre",
    selector: (row) => row.name,
    width: "150px",
  },
  {
    name: "Tipo de permiso",
    selector: (row) => row.leaveType,
    width: "160px",
  },
  {
    name: "Departamento",
    selector: (row) => row.department,
    width: "160px",
  },
  {
    name: "Dias",
    selector: (row) => row.days,
    width: "80px",
  },
  {
    name: "Estado",
    selector: (row) => row.status,
    cell: (row) => statusLabels[row.status?.toLowerCase()] ?? row.status,
    width: "120px",
  },
  {
    name: "Acciones",
    selector: (row) => row.action,
    center: true,
  },
];

export const LeaveButtons = ({ Id }) => {
  const navigate = useNavigate();

  const handleView = (id) => {
    navigate(`/admin-dashboard/leaves/${id}`);
  };

  return (
    <button
      className="px-4 py-1 bg-teal-500 rounded text-white hover:bg-teal-600"
      onClick={() => handleView(Id)}
    >
      Ver detalle
    </button>
  );
};

LeaveButtons.propTypes = {
  Id: PropTypes.string.isRequired,
};
