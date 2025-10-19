import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const RoleBaseRoutes = ({ children, requiredRole = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando permisos...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole =
    !Array.isArray(requiredRole) ||
    requiredRole.length === 0 ||
    requiredRole.includes(user.role);

  if (!hasRequiredRole) {
    const fallbackPath =
      user.role === "admin" ? "/admin-dashboard" : "/employee-dashboard";
    return <Navigate to={fallbackPath} replace />;
  }
  
  return children;
};

export default RoleBaseRoutes;

RoleBaseRoutes.propTypes = {
    children: PropTypes.node.isRequired,
    requiredRole: PropTypes.arrayOf(PropTypes.string),
};
