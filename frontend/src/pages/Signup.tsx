import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { registerUser } from "@/lib/api";

const Signup = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
  });

  const onChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      toast({
        title: language === "gu" ? "માહિતી અધૂરી છે" : "Missing information",
        description:
          language === "gu"
            ? "યૂઝરનેમ, ઇમેઇલ અને પાસવર્ડ જરૂરી છે."
            : "Username, email and password are required.",
        variant: "destructive",
      });
      return;
    }
    if (form.password.length < 8) {
      toast({
        title: language === "gu" ? "પાસવર્ડ નાનો છે" : "Password too short",
        description:
          language === "gu"
            ? "પાસવર્ડ ઓછામાં ઓછા 8 અક્ષરનો હોવો જોઈએ."
            : "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast({
        title: language === "gu" ? "પાસવર્ડ મેળ ખાતો નથી" : "Password mismatch",
        description:
          language === "gu"
            ? "પાસવર્ડ અને કન્ફર્મ પાસવર્ડ સરખા હોવા જોઈએ."
            : "Password and confirm password must match.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await registerUser({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        first_name: form.first_name.trim() || undefined,
        last_name: form.last_name.trim() || undefined,
        phone_number: form.phone_number.trim() || undefined,
      });
      await login(form.username.trim(), form.password);
      toast({
        title: language === "gu" ? "એકાઉન્ટ બની ગયું" : "Account created",
        description:
          language === "gu"
            ? "તમે સફળતાપૂર્વક સાઇન અપ થયા."
            : "You have successfully signed up.",
      });
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed. Please try again.";
      toast({
        title: language === "gu" ? "સાઇન અપ નિષ્ફળ" : "Signup failed",
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
            <h1 className="text-2xl font-semibold tracking-tight">
              {language === "gu"
                ? "સાઇન અપ"
                : language === "hi"
                ? "साइन अप"
                : "Sign up"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === "gu"
                ? "સમાચાર વાંચવા, લાઈક/કમેન્ટ અને પર્સનલ અપડેટ્સ માટે એકાઉન્ટ બનાવો."
                : language === "hi"
                ? "समाचार पढ़ने, लाइक/कमेंट और पर्सनल अपडेट्स के लिए अकाउंट बनाएं।"
                : "Create your reader account for likes, comments and personalized updates."}
            </p>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => onChange("first_name", e.target.value)}
                placeholder={language === "gu" ? "પ્રથમ નામ" : "First name"}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => onChange("last_name", e.target.value)}
                placeholder={language === "gu" ? "છેલ્લું નામ" : "Last name"}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <input
              type="text"
              value={form.username}
              onChange={(e) => onChange("username", e.target.value)}
              placeholder={language === "gu" ? "યૂઝરનેમ *" : "Username *"}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder={language === "gu" ? "ઇમેઇલ *" : "Email *"}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
            <input
              type="text"
              value={form.phone_number}
              onChange={(e) => onChange("phone_number", e.target.value)}
              placeholder={language === "gu" ? "ફોન નંબર" : "Phone number"}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
              placeholder={language === "gu" ? "પાસવર્ડ (8+) *" : "Password (8+) *"}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => onChange("confirmPassword", e.target.value)}
              placeholder={language === "gu" ? "કન્ફર્મ પાસવર્ડ *" : "Confirm password *"}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting
                ? language === "gu"
                  ? "સાઇન અપ થઈ રહ્યું છે..."
                  : "Creating account..."
                : language === "gu"
                ? "સાઇન અપ કરો"
                : "Sign up"}
            </button>
          </form>

          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            {language === "gu" ? "લોગિન પર જાઓ" : language === "hi" ? "लॉगिन पर जाओ" : "Go to Login"}
          </Link>

          <div className="text-center">
            <Link to="/" className="text-xs font-medium text-primary hover:underline">
              ← {language === "gu" ? "હોમ પેજ" : language === "hi" ? "होम पेज" : "Back to homepage"}
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Signup;
