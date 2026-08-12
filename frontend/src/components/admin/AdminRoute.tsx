import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps): React.JSX.Element {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-500 font-medium text-xs">
        Verifying admin permissions...
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  // Check if role is stored in publicMetadata
  const userRole = (user?.publicMetadata as { role?: string })?.role;

  if (userRole !== "admin") {
    return <Navigate to="/homeowner" replace />; // Redirect non-admins away
  }

  return <>{children}</>;
}