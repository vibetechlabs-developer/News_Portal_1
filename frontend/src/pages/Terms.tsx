import { PageLayout } from '@/components/layout/PageLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const Terms = () => {
  const { language } = useLanguage();

  return (
    <PageLayout showTicker={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="headline-display text-foreground mb-8">
            {language === 'en' ? 'Terms of Use' : 'ઉપયોગની શરતો'}
          </h1>

          <div className="prose prose-lg text-muted-foreground space-y-6">
            <section>
              <h2 className="headline-secondary text-foreground mb-4">
                {language === 'en' ? 'Acceptance of Terms' : 'શરતોની સ્વીકૃતિ'}
              </h2>
              <p>
                {language === 'en'
                  ? 'By accessing and using this website, you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our services.'
                  : 'આ વેબસાઇટને ઍક્સેસ કરીને અને ઉપયોગ કરીને, તમે આ ઉપયોગની શરતોથી બંધાયેલા રહેવા માટે સ્વીકારો છો અને સંમત થાઓ છો. જો તમે આ શરતો સાથે સંમત ન હોવ, તો કૃપા કરીને અમારી સેવાઓનો ઉપયોગ કરશો નહીં.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-4">
                {language === 'en' ? 'Intellectual Property' : 'બૌદ્ધિક સંપત્તિ'}
              </h2>
              <p>
                {language === 'en'
                  ? 'All content on this website, including text, graphics, logos, images, and software, is the property of Sandesh and is protected by copyright and other intellectual property laws.'
                  : 'આ વેબસાઇટ પરની તમામ સામગ્રી, જેમાં ટેક્સ્ટ, ગ્રાફિક્સ, લોગો, છબીઓ અને સોફ્ટવેરનો સમાવેશ થાય છે, તે સંદેશની મિલકત છે અને કૉપિરાઇટ અને અન્ય બૌદ્ધિક સંપત્તિ કાયદાઓ દ્વારા સુરક્ષિત છે.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-4">
                {language === 'en' ? 'User Conduct' : 'વપરાશકર્તા આચરણ'}
              </h2>
              <p>
                {language === 'en'
                  ? 'You agree to use our services only for lawful purposes and in accordance with these Terms. You may not use our services in any way that could damage, disable, or impair our services.'
                  : 'તમે અમારી સેવાઓનો ઉપયોગ ફક્ત કાયદેસર હેતુઓ માટે અને આ શરતો અનુસાર કરવા સંમત થાઓ છો. તમે અમારી સેવાઓનો ઉપયોગ એવી કોઈ રીતે કરી શકતા નથી જે અમારી સેવાઓને નુકસાન, અક્ષમ અથવા નબળી બનાવી શકે.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-4">
                {language === 'en' ? 'Disclaimer' : 'અસ્વીકૃતિ'}
              </h2>
              <p>
                {language === 'en'
                  ? 'The information provided on this website is for general informational purposes only. We make no warranties about the accuracy, reliability, or completeness of this information.'
                  : 'આ વેબસાઇટ પર આપેલી માહિતી ફક્ત સામાન્ય માહિતીના હેતુઓ માટે છે. અમે આ માહિતીની ચોકસાઈ, વિશ્વસનીયતા અથવા સંપૂર્ણતા વિશે કોઈ વોરંટી આપતા નથી.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-4">
                {language === 'en' ? 'Limitation of Liability' : 'જવાબદારીની મર્યાદા'}
              </h2>
              <p>
                {language === 'en'
                  ? 'Sandesh shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of or inability to use our services.'
                  : 'તમારા ઉપયોગ અથવા અમારી સેવાઓનો ઉપયોગ કરવામાં અસમર્થતાના પરિણામે કોઈપણ પ્રત્યક્ષ, પરોક્ષ, આકસ્મિક, વિશેષ અથવા પરિણામી નુકસાન માટે સંદેશ જવાબદાર રહેશે નહીં.'}
              </p>
            </section>

            <section>
              <h2 className="headline-secondary text-foreground mb-4">
                {language === 'en' ? 'Changes to Terms' : 'શરતોમાં ફેરફારો'}
              </h2>
              <p>
                {language === 'en'
                  ? 'We reserve the right to modify these Terms at any time. Your continued use of our services after any changes indicates your acceptance of the new Terms.'
                  : 'અમે કોઈપણ સમયે આ શરતોમાં ફેરફાર કરવાનો અધિકાર અનામત રાખીએ છીએ. કોઈપણ ફેરફારો પછી અમારી સેવાઓનો તમારો સતત ઉપયોગ નવી શરતોની તમારી સ્વીકૃતિ સૂચવે છે.'}
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

export default Terms;
