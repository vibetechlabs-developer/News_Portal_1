import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const Signup = () => {
  const { language } = useLanguage();

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
                ? "સમાચાર પોર્ટલ એકાઉન્ટ માટે, કૃપા કરીને સંપર્ક કરો અથવા એડમિનિસ્ટ્રેટર સાથે વાત કરો."
                : language === "hi"
                ? "समाचार पोर्टल खाते के लिए, कृपया संपर्क करें या व्यवस्थापक से बात करें।"
                : "To get an account on the news portal, please contact us or speak to an administrator."}
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground space-y-2">
            <p>
              {language === "gu"
                ? "રિપોર્ટર અથવા એડિટર એકાઉન્ટ સુપર એડમિન દ્વારા બનાવવામાં આવે છે."
                : language === "hi"
                ? "रिपोर्टर या एडिटर खाते सुपर एडमिन द्वारा बनाए जाते हैं।"
                : "Reporter or editor accounts are created by a Super Admin."}
            </p>
            <p>
              {language === "gu"
                ? "જો તમે પહેલેથી જ લોગિન કર્યું છે તો નીચે લોગિન પર જાઓ."
                : language === "hi"
                ? "यदि आपके पास पहले से खाता है तो नीचे लॉगिन पर जाएं।"
                : "If you already have an account, use the link below to sign in."}
            </p>
          </div>

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
