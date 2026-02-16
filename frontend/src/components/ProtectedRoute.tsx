import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Single role required (user must have this role) */
  requireRole?: "SUPER_ADMIN" | "EDITOR" | "REPORTER";
  /** Alternatively allow any of these roles */
  requireRoles?: ("SUPER_ADMIN" | "EDITOR" | "REPORTER")[];
}

export function ProtectedRoute({ children, requireRole, requireRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking your access…</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: location.pathname } }}
      />
    );
  }

  const allowedByRole = requireRole
    ? (requireRole === "SUPER_ADMIN" && user.role === "SUPER_ADMIN") ||
      (requireRole === "EDITOR" && ["EDITOR", "SUPER_ADMIN"].includes(user.role)) ||
      (requireRole === "REPORTER" && ["REPORTER", "EDITOR", "SUPER_ADMIN"].includes(user.role))
    : true;

  const allowedByRoles = requireRoles
    ? requireRoles.includes(user.role as "SUPER_ADMIN" | "EDITOR" | "REPORTER")
    : true;

  if (requireRole && !allowedByRole) {
    if (user.role === "SUPER_ADMIN") return <Navigate to="/admin" replace />;
    if (["EDITOR", "REPORTER"].includes(user.role)) return <Navigate to="/editor" replace />;
    return <Navigate to="/" replace />;
  }

  if (requireRoles && !allowedByRoles) {
    if (user.role === "SUPER_ADMIN") return <Navigate to="/admin" replace />;
    if (user.role === "EDITOR") return <Navigate to="/editor" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

