import { FormEvent, useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { confirmPasswordReset } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !token) {
      setError("Invalid password reset link. Please request a new one.");
    }
  }, [uid, token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!uid || !token) {
      setError("Invalid password reset link. Please request a new one.");
      return;
    }
    if (!password) {
      toast({
        title: "Missing password",
        description: "Please enter a new password.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Password and confirm password must match.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await confirmPasswordReset(uid, token, password);
      toast({
        title: "Password Reset",
        description: "Your password has been successfully reset. You can now sign in.",
      });
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      console.error("Password reset failed:", err);
      const message = err instanceof Error ? err.message : "Failed to reset password. The link might be expired.";
      toast({
        title: "Reset Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout showTicker={false}>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card/90 shadow-lg p-8 space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
            <p className="text-sm text-muted-foreground">
              Create a new password for your account.
            </p>
          </div>

          {error ? (
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                <p className="text-sm text-center font-medium">
                  {error}
                </p>
              </div>
              <Link
                to="/forgot-password"
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
              >
                Request New Link
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <div className="text-center">
            <Link to="/" className="text-xs font-medium text-primary hover:underline">
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ResetPassword;
