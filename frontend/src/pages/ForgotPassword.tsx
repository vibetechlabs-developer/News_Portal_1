import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { requestPasswordReset } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Missing email",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await requestPasswordReset(email);
      setSuccess(true);
      toast({
        title: "Request Sent",
        description: res.detail || "Check your email for the reset link.",
      });
    } catch (err: unknown) {
      console.error("Password reset request failed:", err);
      const message = err instanceof Error ? err.message : "Failed to request password reset. Please try again.";
      toast({
        title: "Error",
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
            <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50">
                <p className="text-sm text-center">
                  If an account exists with this email, you will receive a password reset link shortly.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="your.email@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Remember your password?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
            <div className="pt-2">
              <Link to="/" className="text-xs font-medium text-primary hover:underline">
                ← Back to homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ForgotPassword;
