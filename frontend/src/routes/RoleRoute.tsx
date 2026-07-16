import { Navigate } from "react-router-dom";
import { useUserContext } from "../context/AuthContext";

interface RoleRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

function RoleRoute({
  allowedRoles,
  children,
}: RoleRouteProps) {

  const {
    user,
    loading,
  } = useUserContext();

  console.log("RoleRoute");
  console.log("loading:", loading);
  console.log("user:", user);
  console.log("role:", user?.role);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!user) {
    console.log("Redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    console.log("Redirecting to home");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default RoleRoute;