import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const RoleBaseRoutes = ({ children, requiredRole = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Cargando permisos...</div>;
    }

    if (!requiredRole.includes(user.role)) {
        alert("No tienes permisos para acceder a esta seccion.");
        return <Navigate to="/unauthorized" replace />;
    }
  
    return user ? children : <Navigate to="/login" />;
};

export default RoleBaseRoutes;

RoleBaseRoutes.propTypes = {
    children: PropTypes.node.isRequired,
    requiredRole: PropTypes.arrayOf(PropTypes.string),
};
