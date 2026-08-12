import {
  Navigate,
} from "react-router-dom";

import type {
  ReactNode,
} from "react";

import {
  useUserContext,
} from "../context/AuthContext";

interface RoleRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

function RoleRoute({
  allowedRoles,
  children,
}: RoleRouteProps) {
  const {
    user,
    loading,
  } = useUserContext();

  console.log("--- RoleRoute Debug ---");
  console.log("loading:", loading);
  console.log("user:", user);
  console.log("user role:", user?.role);
  console.log("allowed roles:", allowedRoles);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-500 font-medium text-xs">
        Loading user permissions...
      </div>
    );
  }

  if (!user) {
    console.log("Redirecting to login: No user found");
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // Normalize roles to uppercase or lowercase to prevent mismatch issues (e.g. "Admin" vs "admin")
  const userRole = user.role ? String(user.role).trim().toLowerCase() : "";
  const normalizedAllowedRoles = allowedRoles.map((r) => r.trim().toLowerCase());

  if (!normalizedAllowedRoles.includes(userRole)) {
    console.log(`Redirecting: User role '${userRole}' not allowed in [${normalizedAllowedRoles.join(", ")}]`);
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return (
    <>
      {children}
    </>
  );
}

export default RoleRoute;