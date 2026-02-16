import { FormEvent, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface LocationState {
  from?: { pathname: string };
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const redirectTo = state.from?.pathname || "/admin";

  const { login, isLoading, isAuthenticated, isEditor, isSuperAdmin, isReporter } = useAuth();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Missing details",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }
    try {
      setSubmitting(true);
      await login(username, password);
      toast({
        title: "Welcome back",
        description: "You have successfully signed in.",
      });
      // Route based on role
      if (isSuperAdmin) {
        navigate("/admin", { replace: true });
      } else if (isEditor) {
        navigate("/editor", { replace: true });
      } else if (isReporter) {
        navigate("/reporter", { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err: unknown) {
      console.error("Login failed:", err);
      const message =
        typeof err === "object" &&
        err !== null &&
        "data" in err &&
        typeof (err as { data?: unknown }).data === "object" &&
        (err as { data?: { detail?: unknown } }).data &&
        "detail" in (err as { data: { detail?: unknown } }).data
          ? String((err as { data: { detail?: unknown } }).data.detail)
          : err instanceof Error
            ? err.message
            : "Invalid username or password. Please try again.";
      toast({
        title: "Login failed",
        description:
          message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated && !isLoading) {
    // Already signed in – send them to appropriate dashboard
    if (isSuperAdmin) {
      navigate("/admin", { replace: true });
    } else if (isEditor) {
      navigate("/editor", { replace: true });
    } else if (isReporter) {
      navigate("/reporter", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
    return null;
  }

  return (
    <PageLayout showTicker={false}>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card/90 shadow-lg p-8 space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Admin & Editor Login
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in with your newsroom account to manage content.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                autoComplete="username"
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="your.username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Need an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>{" "}
            (or ask a Super Admin to create an Editor/Reporter user).
          </p>

          <div className="text-center">
            <Link
              to="/"
              className="text-xs font-medium text-primary hover:underline"
            >
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Login;

