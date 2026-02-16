import { PageLayout } from '@/components/layout/PageLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const Privacy = () => {
  const { language } = useLanguage();

  return (
    <PageLayout showTicker={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="headline-display text-foreground mb-8">
            {language === 'en' ? 'Privacy Policy' : 'ગોપનીયતા નીતિ'}
          </h1>

          <div className="prose prose-lg text-muted-foreground space-y-6">
            <section>
              <h2 className="headline-secondary text-foreground mb-4">
                {language === 'en' ? 'Information We Collect' : 'અમે જે માહિતી એકત્રિત કરીએ છીએ'}
              </h2>
              <p>
                {language === 'en'
                  ? 'We collect information you provide directly, such as when you subscribe to our newsletter, create an account, or contact us. This may include your name, email address, phone number, and any other information you choose to provide.'
                  : 'અમે તમે સીધી રીતે આપેલી માહિતી એકત્રિત કરીએ છીએ, જેમ કે જ્યારે તમે અમારા ન્યૂઝલેટર પર સબ્સ્ક્રાઇબ કરો, એકાઉન્ટ બનાવો અથવા અમારો સંપર્ક કરો. આમાં તમારું નામ, ઇમેઇલ સરનામું, ફોન નંબર અને તમે આપવાનું પસંદ કરો તે અન્ય કોઈપણ માહિતી શામેલ હોઈ શકે છે.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-4">
                {language === 'en' ? 'How We Use Your Information' : 'અમે તમારી માહિતીનો ઉપયોગ કેવી રીતે કરીએ છીએ'}
              </h2>
              <p>
                {language === 'en'
                  ? 'We use the information we collect to provide, maintain, and improve our services, communicate with you, and personalize your experience on our platform.'
                  : 'અમે એકત્રિત કરેલી માહિતીનો ઉપયોગ અમારી સેવાઓ પ્રદાન કરવા, જાળવવા અને સુધારવા, તમારી સાથે સંવાદ કરવા અને અમારા પ્લેટફોર્મ પર તમારા અનુભવને વ્યક્તિગત બનાવવા માટે કરીએ છીએ.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-4">
                {language === 'en' ? 'Cookies and Tracking' : 'કૂકીઝ અને ટ્રેકિંગ'}
              </h2>
              <p>
                {language === 'en'
                  ? 'We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings.'
                  : 'અમે તમારી બ્રાઉઝિંગ પ્રવૃત્તિઓ વિશે માહિતી એકત્રિત કરવા માટે કૂકીઝ અને સમાન ટ્રેકિંગ ટેક્નોલોજીનો ઉપયોગ કરીએ છીએ. તમે તમારી બ્રાઉઝર સેટિંગ્સ દ્વારા કૂકીઝને નિયંત્રિત કરી શકો છો.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-4">
                {language === 'en' ? 'Data Security' : 'ડેટા સુરક્ષા'}
              </h2>
              <p>
                {language === 'en'
                  ? 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.'
                  : 'અમે તમારી વ્યક્તિગત માહિતીને અનધિકૃત ઍક્સેસ, ફેરફાર, જાહેરાત અથવા વિનાશ સામે રક્ષણ આપવા માટે યોગ્ય સુરક્ષા પગલાં અમલમાં મૂકીએ છીએ.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-4">
                {language === 'en' ? 'Contact Us' : 'અમારો સંપર્ક કરો'}
              </h2>
              <p>
                {language === 'en'
                  ? 'If you have any questions about this Privacy Policy, please contact us at privacy@sandesh.com.'
                  : 'જો તમને આ ગોપનીયતા નીતિ વિશે કોઈ પ્રશ્નો હોય, તો કૃપા કરીને privacy@sandesh.com પર અમારો સંપર્ક કરો.'}
              </p>
            </section>

            <p className="text-sm text-muted-foreground mt-8">
              {language === 'en' ? 'Last updated: February 2024' : 'છેલ્લે અપડેટ: ફેબ્રુઆરી ૨૦૨૪'}
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Privacy;
