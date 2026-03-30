import { PageLayout } from '@/components/layout/PageLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const Privacy = () => {
  const { language } = useLanguage();

  return (
    <PageLayout showTicker={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="headline-display text-foreground mb-4">
            {language === 'en' ? 'Privacy Policy' : 'ગોપનીયતા નીતિ'}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {language === 'en' ? 'Last updated: March 2026' : 'છેલ્લે અપડેટ: માર્ચ 2026'}
          </p>

          <div className="prose prose-lg text-muted-foreground space-y-8">

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '1. Introduction' : '1. પરિચય'}
              </h2>
              <p>
                {language === 'en'
                  ? 'We respect your privacy.'
                  : 'Kanam Express ("અમે") તમારી ગોપનીયતાનું મહત્વ સમજીએ છીએ અને તમારી વ્યક્તિગત માહિતીની સુરક્ષા માટે પ્રતિબદ્ધ છીએ. આ ગોપનીયતા નીતિ તમને સમજાવે છે કે અમે કેવી રીતે માહિતી એકત્રિત કરીએ છીએ, તેનો ઉપયોગ કરીએ છીએ અને તેને સુરક્ષિત રાખીએ છીએ.'}
              </p>
              <p className="mt-3">
                {language === 'en'
                  ? 'Use implies agreement.'
                  : 'આ વેબસાઇટનો ઉપયોગ કરીને તમે આ નીતિ સાથે સહમત થાઓ છો.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '2. Information We Collect' : '2. અમે કઈ માહિતી એકત્રિત કરીએ છીએ'}
              </h2>

              <p className="mt-2">
                {language === 'en'
                  ? 'We collect different data types.'
                  : 'અમે વિવિધ પ્રકારની માહિતી એકત્રિત કરીએ છીએ:'}
              </p>

              <ul className="mt-3 list-disc list-inside space-y-2">
                <li>વ્યક્તિગત માહિતી — નામ, ઈમેઈલ, ફોન નંબર (ફક્ત તમે આપો ત્યારે)</li>
                <li>ટેકનિકલ માહિતી — IP સરનામું, બ્રાઉઝર પ્રકાર, ડિવાઇસ માહિતી</li>
                <li>ઉપયોગ ડેટા — કયા પેજ જુઓ છો, કેટલો સમય વિતાવો છો</li>
                <li>કૂકીઝ — તમારી પસંદગીઓ અને અનુભવ સુધારવા માટે</li>
                <li>યૂઝર કન્ટેન્ટ — ટિપ્પણીઓ, પ્રતિસાદ</li>
              </ul>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '3. How We Use Information' : '3. માહિતીનો ઉપયોગ કેવી રીતે કરીએ છીએ'}
              </h2>

              <ul className="mt-3 list-disc list-inside space-y-2">
                <li>વેબસાઇટ ચલાવવા અને સુધારવા</li>
                <li>ન્યૂઝ અને અપડેટ મોકલવા (તમારી મંજૂરીથી)</li>
                <li>ગ્રાહક સપોર્ટ માટે જવાબ આપવા</li>
                <li>Google AdSense દ્વારા જાહેરાતો બતાવવા</li>
                <li>સુરક્ષા, ફ્રોડ અને દુરૂપયોગ અટકાવવા</li>
                <li>એનલિટિક્સ દ્વારા યૂઝર વર્તન સમજવા</li>
              </ul>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '4. Cookies & Tracking' : '4. કૂકીઝ અને ટ્રેકિંગ ટેક્નોલોજી'}
              </h2>
              <p>
                {language === 'en'
                  ? 'We use cookies.'
                  : 'અમે કૂકીઝ અને સમાન ટ્રેકિંગ ટેક્નોલોજીનો ઉપયોગ કરીએ છીએ જેથી તમારા અનુભવને વધુ સારો બનાવી શકીએ.'}
              </p>
              <p className="mt-3">
                {language === 'en'
                  ? 'Types of cookies.'
                  : 'કૂકીઝના પ્રકાર:'}
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>આવશ્યક કૂકીઝ (સાઇટ કાર્ય માટે)</li>
                <li>એનલિટિક્સ કૂકીઝ (Google Analytics)</li>
                <li>જાહેરાત કૂકીઝ (Google AdSense)</li>
              </ul>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '5. Google AdSense & Ads' : '5. Google AdSense અને જાહેરાતો'}
              </h2>
              <p>
                {language === 'en'
                  ? 'We use Google Ads.'
                  : 'અમે Google AdSense નો ઉપયોગ કરીએ છીએ. Google તમારી બ્રાઉઝિંગ હિસ્ટ્રી આધારે જાહેરાતો બતાવી શકે છે.'}
              </p>
              <p className="mt-3">
                {language === 'en'
                  ? 'Opt-out.'
                  : 'તમે Google Ads Settings દ્વારા personalized ads બંધ કરી શકો છો.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '6. Third-Party Services' : '6. તૃતીય પક્ષ સેવાઓ'}
              </h2>
              <p>
                {language === 'en'
                  ? 'We use third parties.'
                  : 'અમે તૃતીય પક્ષ સેવાઓ (Google Analytics, AdSense વગેરે) નો ઉપયોગ કરીએ છીએ, જે પોતાની ગોપનીયતા નીતિ મુજબ માહિતી પ્રોસેસ કરે છે.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '7. Data Retention' : '7. ડેટા સંગ્રહ સમય'}
              </h2>
              <p>
                {language === 'en'
                  ? 'We retain data as needed.'
                  : 'અમે તમારી માહિતી એટલા સમય સુધી જ રાખીએ છીએ જેટલો સમય જરૂરી હોય. પછી તેને સુરક્ષિત રીતે ડિલીટ અથવા અનામી બનાવીએ છીએ.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '8. Data Security' : '8. ડેટા સુરક્ષા'}
              </h2>
              <p>
                {language === 'en'
                  ? 'We protect data.'
                  : 'અમે તમારી માહિતી સુરક્ષિત રાખવા માટે યોગ્ય પગલાં લઈએ છીએ, પરંતુ ઇન્ટરનેટ પર સંપૂર્ણ સુરક્ષા ગેરંટી નથી.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '9. User Rights' : '9. તમારા અધિકારો'}
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>તમારી માહિતી ઍક્સેસ કરવાનો અધિકાર</li>
                <li>માહિતી સુધારવાનો અધિકાર</li>
                <li>માહિતી ડિલીટ કરવાનો અધિકાર</li>
                <li>માર્કેટિંગમાંથી opt-out કરવાનો અધિકાર</li>
              </ul>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '10. Children Privacy' : '10. બાળકોની ગોપનીયતા'}
              </h2>
              <p>
                {language === 'en'
                  ? 'Not for children.'
                  : 'આ વેબસાઇટ 13 વર્ષથી ઓછા બાળકો માટે નથી અને અમે જાણીને તેમની માહિતી એકત્રિત કરતા નથી.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '11. Policy Updates' : '11. નીતિમાં ફેરફાર'}
              </h2>
              <p>
                {language === 'en'
                  ? 'We may update.'
                  : 'આ નીતિ સમયાંતરે બદલાઈ શકે છે. નવી માહિતી આ પેજ પર અપડેટ થશે.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '12. Contact Us' : '12. સંપર્ક કરો'}
              </h2>
              <ul className="list-disc list-inside">
                <li>Email: kanamexpress@gmail.com</li>
                <li>{language === 'en' ? 'Phone: +91 98247 49413' : 'ફોન: +91 98247 49413'}</li>
                <li>{language === 'en' ? 'Address: Gujarat, India' : 'સરનામું: ગુજરાત, ભારત'}</li>
              </ul>
            </section>

          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Privacy;