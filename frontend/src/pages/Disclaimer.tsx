import { PageLayout } from '@/components/layout/PageLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const Disclaimer = () => {
  const { language } = useLanguage();

  return (
    <PageLayout showTicker={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="headline-display text-foreground mb-4">
            {language === 'en' ? 'Disclaimer' : 'અસ્વીકૃતિ'}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {language === 'en' ? 'Last updated: March 2026' : 'છેલ્લે અપડેટ: માર્ચ 2026'}
          </p>

          <div className="prose prose-lg text-muted-foreground space-y-8">

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '1. General Information Disclaimer' : '1. સામાન્ય માહિતી અસ્વીકૃતિ'}
              </h2>
              <p>
                {language === 'en'
                  ? 'All information provided on Kanam Express is for general informational and news reporting purposes only.'
                  : 'Kanam Express (kanamexpress.com) પર પ્રકાશિત તમામ માહિતી માત્ર સામાન્ય માહિતી અને સમાચાર હેતુઓ માટે છે. અમે માહિતી સાચી અને અપડેટ રાખવા પ્રયત્ન કરીએ છીએ, પરંતુ તેની સંપૂર્ણ ચોકસાઈ, વિશ્વસનીયતા અથવા પૂર્ણતા માટે કોઈ ગેરંટી આપતા નથી.'}
              </p>
              <p className="mt-3">
                {language === 'en'
                  ? 'Use at your own risk.'
                  : 'સાઇટનો ઉપયોગ સંપૂર્ણપણે તમારી પોતાની જવાબદારી પર છે. કોઈપણ માહિતી પર આધાર રાખીને લેવામાં આવેલા નિર્ણયો માટે Kanam Express જવાબદાર નહીં હોય.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '2. News Accuracy & Editorial Policy' : '2. સમાચારની ચોકસાઈ અને સંપાદકીય નીતિ'}
              </h2>
              <p>
                {language === 'en'
                  ? 'We aim for accuracy.'
                  : 'Kanam Express ચોકસાઈ, નિષ્પક્ષતા અને વિશ્વસનીયતા સાથે સમાચાર પ્રસ્તુત કરવા પ્રતિબદ્ધ છે. અમારી ટીમ વિવિધ સ્ત્રોતોથી માહિતી ચકાસે છે, છતાં ઝડપી બદલાતી પરિસ્થિતિમાં કેટલીક માહિતીમાં બાદમાં સુધારા કરવાની જરૂર પડી શકે છે.'}
              </p>
              <p className="mt-3">
                {language === 'en'
                  ? 'Opinions are personal.'
                  : 'મંતવ્ય લેખો, કોલમ અને સંપાદકીય લેખોમાં દર્શાવેલા વિચારો લેખકોના વ્યક્તિગત હોય છે અને તે Kanam Express ની સત્તાવાર સ્થિતિ દર્શાવતા નથી.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '3. External Links Disclaimer' : '3. બાહ્ય લિંક્સ અસ્વીકૃતિ'}
              </h2>
              <p>
                {language === 'en'
                  ? 'External links are not controlled.'
                  : 'અમારી વેબસાઇટ પર ત્રીજા પક્ષની વેબસાઇટ્સના લિંક્સ હોઈ શકે છે. આ વેબસાઇટ્સ અમારા નિયંત્રણ હેઠળ નથી અને તેમની સામગ્રી, નીતિઓ અથવા સેવાઓ માટે અમે જવાબદાર નથી.'}
              </p>
              <p className="mt-3">
                {language === 'en'
                  ? 'No guarantee.'
                  : 'આ લિંક્સ માત્ર સુવિધા માટે આપવામાં આવે છે. બાહ્ય વેબસાઇટ્સ પરની માહિતીની ચોકસાઈ અથવા વિશ્વસનીયતા માટે અમે કોઈ ગેરંટી આપતા નથી.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '4. No Professional Advice' : '4. વ્યાવસાયિક સલાહ નહીં'}
              </h2>
              <p>
                {language === 'en'
                  ? 'Not professional advice.'
                  : 'આ વેબસાઇટ પરની માહિતી કાનૂની, નાણાકીય, તબીબી અથવા રોકાણ સંબંધિત વ્યાવસાયિક સલાહ તરીકે માનવી નહીં. કોઈપણ મહત્વપૂર્ણ નિર્ણય લેતા પહેલા લાયક નિષ્ણાતની સલાહ લેવી જરૂરી છે.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '5. Advertising & Affiliate Disclaimer' : '5. જાહેરાત અને એફિલિએટ અસ્વીકૃતિ'}
              </h2>
              <p>
                {language === 'en'
                  ? 'We display ads.'
                  : 'Kanam Express પર Google AdSense અને અન્ય જાહેરાત ભાગીદારો દ્વારા જાહેરાતો દર્શાવવામાં આવે છે. આ જાહેરાતો સંપાદકીય સામગ્રીથી અલગ હોય છે.'}
              </p>
              <p className="mt-3">
                {language === 'en'
                  ? 'No endorsement.'
                  : 'કોઈપણ જાહેરાત દર્શાવવાનું અર્થ એ નથી કે અમે તે પ્રોડક્ટ, સેવા અથવા બ્રાન્ડને સમર્થન આપીએ છીએ.'}
              </p>
              <p className="mt-3">
                {language === 'en'
                  ? 'Affiliate links may be used.'
                  : 'કેટલાક લિંક્સ એફિલિએટ હોઈ શકે છે, જેના માધ્યમથી અમને કમિશન મળી શકે છે, પરંતુ તેનો તમારા ખર્ચ પર કોઈ પ્રભાવ પડતો નથી.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '6. Copyright & Content Usage' : '6. કૉપિરાઇટ અને સામગ્રી ઉપયોગ'}
              </h2>
              <p>
                {language === 'en'
                  ? 'All content protected.'
                  : 'Kanam Express પર પ્રકાશિત તમામ લેખો, ફોટોગ્રાફ્સ, ગ્રાફિક્સ અને અન્ય સામગ્રી કૉપિરાઇટ કાયદા હેઠળ સુરક્ષિત છે.'}
              </p>
              <p className="mt-3">
                {language === 'en'
                  ? 'No reuse without permission.'
                  : 'લખિત પરવાનગી વગર કોઈપણ સામગ્રીનું પુનઃપ્રકાશન, વિતરણ અથવા ઉપયોગ કડક મનાઈ છે.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '7. Limitation of Liability' : '7. જવાબદારી મર્યાદા'}
              </h2>
              <p>
                {language === 'en'
                  ? 'No liability.'
                  : 'Kanam Express કોઈપણ સીધી કે પરોક્ષ નુકસાન માટે જવાબદાર નહીં હોય જે સાઇટના ઉપયોગ અથવા માહિતી પર આધાર રાખવાથી થાય.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '8. Updates to Disclaimer' : '8. અસ્વીકૃતિમાં ફેરફાર'}
              </h2>
              <p>
                {language === 'en'
                  ? 'We may update.'
                  : 'આ અસ્વીકૃતિ સમયાંતરે અપડેટ થઈ શકે છે. નવા ફેરફારો આ પેજ પર પોસ્ટ કરવામાં આવશે.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-3">
                {language === 'en' ? '9. Contact Us' : '9. સંપર્ક કરો'}
              </h2>
              <ul className="mt-3 space-y-1 list-disc list-inside">
                <li>Email: kanamexpress@gmail.com</li>
                <li>{language === 'en' ? 'Phone: +91 98247 49413' : 'ફોન: +91 98247 49413'}</li>
                <li>
                  {language === 'en'
                    ? 'Address: Jambusar, Bharuch, Gujarat - 392150'
                    : 'સરનામું: જામ્બુસર, ભરુચ, ગુજરાત - 392150'}
                </li>
              </ul>
            </section>

          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Disclaimer;