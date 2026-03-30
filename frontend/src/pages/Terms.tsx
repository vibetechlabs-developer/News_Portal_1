import { PageLayout } from '@/components/layout/PageLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const Terms = () => {
  const { language } = useLanguage();

  return (
    <PageLayout showTicker={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="headline-display text-foreground mb-4">
            {language === 'en' ? 'Terms & Conditions' : 'નિયમો અને શરતો'}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {language === 'en' ? 'Last updated: March 2026' : 'છેલ્લે અપડેટ: માર્ચ 2026'}
          </p>

          <div className="prose prose-lg text-muted-foreground space-y-8">

            <section>
              <h2 className="headline-secondary mb-3">
                {language === 'en' ? '1. Acceptance of Terms' : '1. શરતોની સ્વીકૃતિ'}
              </h2>
              <p>
                {language === 'en'
                  ? 'By using this website you agree to terms.'
                  : 'Kanam Express વેબસાઇટનો ઉપયોગ કરીને તમે આ તમામ નિયમો અને શરતોને સ્વીકારો છો. જો તમે આ શરતો સાથે સહમત નથી, તો વેબસાઇટનો ઉપયોગ ન કરો.'}
              </p>
              <p className="mt-3">
                {language === 'en'
                  ? 'Applies to all users.'
                  : 'આ શરતો તમામ મુલાકાતીઓ, વપરાશકર્તાઓ અને સેવાઓનો ઉપયોગ કરનારાઓ પર લાગુ પડે છે.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary mb-3">
                {language === 'en' ? '2. Use of Website' : '2. વેબસાઇટનો ઉપયોગ'}
              </h2>

              <p>
                {language === 'en'
                  ? 'Lawful use only.'
                  : 'તમે વેબસાઇટનો ઉપયોગ ફક્ત કાનૂની હેતુઓ માટે જ કરશો અને અન્ય લોકોના અધિકારોનું ઉલ્લંઘન નહીં કરો.'}
              </p>

              <ul className="mt-3 list-disc list-inside space-y-2">
                <li>ગેરકાનૂની, અપમાનજનક અથવા નુકસાનકારક સામગ્રી પોસ્ટ ન કરવી</li>
                <li>સિસ્ટમમાં અનધિકૃત પ્રવેશ કરવાનો પ્રયત્ન ન કરવો</li>
                <li>બોટ્સ અથવા સ્ક્રેપર્સથી ડેટા એકત્રિત ન કરવો</li>
                <li>વેબસાઇટની કામગીરીમાં અવરોધ ન લાવવો</li>
                <li>પરવાનગી વગર સામગ્રીનો વ્યાપારી ઉપયોગ ન કરવો</li>
              </ul>
            </section>

            <section>
              <h2 className="headline-secondary mb-3">
                {language === 'en' ? '3. Intellectual Property' : '3. બૌદ્ધિક સંપત્તિ'}
              </h2>

              <p>
                {language === 'en'
                  ? 'Content owned by us.'
                  : 'વેબસાઇટ પરની તમામ સામગ્રી (લેખો, ફોટા, વિડિઓ, ડિઝાઇન) Kanam Express અથવા તેના માલિકોની બૌદ્ધિક સંપત્તિ છે.'}
              </p>

              <p className="mt-3">
                {language === 'en'
                  ? 'No reuse.'
                  : 'લખિત પરવાનગી વગર કોઈપણ સામગ્રીનું પુનઃપ્રકાશન, નકલ અથવા વિતરણ મનાઈ છે.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary mb-3">
                {language === 'en' ? '4. User Content' : '4. વપરાશકર્તા સામગ્રી'}
              </h2>

              <p>
                {language === 'en'
                  ? 'User responsibility.'
                  : 'તમે જે સામગ્રી પોસ્ટ કરો છો તેના માટે તમે સંપૂર્ણ જવાબદાર છો.'}
              </p>

              <p className="mt-3">
                {language === 'en'
                  ? 'We can use it.'
                  : 'તમે આપેલી સામગ્રીનો ઉપયોગ, ફેરફાર અને પ્રકાશન કરવાનો અધિકાર અમને મળે છે.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary mb-3">
                {language === 'en' ? '5. External Links' : '5. બાહ્ય લિંક્સ'}
              </h2>

              <p>
                {language === 'en'
                  ? 'Not responsible.'
                  : 'બાહ્ય વેબસાઇટ્સની સામગ્રી અથવા નીતિ માટે અમે જવાબદાર નથી.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary mb-3">
                {language === 'en' ? '6. Advertising & Monetization' : '6. જાહેરાત અને કમાણી'}
              </h2>

              <p>
                {language === 'en'
                  ? 'Ads displayed.'
                  : 'આ વેબસાઇટ પર Google AdSense અને અન્ય જાહેરાતો દર્શાવવામાં આવે છે.'}
              </p>

              <p className="mt-3">
                {language === 'en'
                  ? 'No endorsement.'
                  : 'જાહેરાત દર્શાવવાનો અર્થ એ નથી કે અમે તે પ્રોડક્ટ અથવા સેવાઓને સમર્થન આપીએ છીએ.'}
              </p>

              <p className="mt-3">
                {language === 'en'
                  ? 'Affiliate disclosure.'
                  : 'કેટલાક લિંક્સ એફિલિએટ હોઈ શકે છે, જેના દ્વારા અમને કમિશન મળી શકે છે.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary mb-3">
                {language === 'en' ? '7. Limitation of Liability' : '7. જવાબદારી મર્યાદા'}
              </h2>

              <p>
                {language === 'en'
                  ? 'No liability.'
                  : 'વેબસાઇટના ઉપયોગથી થતા કોઈપણ સીધા કે આડકતરા નુકસાન માટે Kanam Express જવાબદાર નહીં હોય.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary mb-3">
                {language === 'en' ? '8. Governing Law' : '8. લાગુ કાયદો'}
              </h2>

              <p>
                {language === 'en'
                  ? 'Indian law applies.'
                  : 'આ શરતો ભારતના કાયદા મુજબ શાસિત છે અને કોઈપણ વિવાદ માટે ગુજરાતના કોર્ટ લાગુ પડશે.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary mb-3">
                {language === 'en' ? '9. Changes to Terms' : '9. શરતોમાં ફેરફાર'}
              </h2>

              <p>
                {language === 'en'
                  ? 'We may update.'
                  : 'અમે આ શરતો કોઈપણ સમયે બદલી શકીએ છીએ. નવી શરતો પોસ્ટ થયા પછી તરત જ લાગુ થશે.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary mb-3">
                {language === 'en' ? '10. Contact Us' : '10. સંપર્ક કરો'}
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

export default Terms; 