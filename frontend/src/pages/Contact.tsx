import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, MapPin, Clock, Send, Facebook, Twitter, Instagram, Youtube, Globe, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSubmitContactMessage, useSiteSettings } from '@/hooks/useNewsApi';

const Contact = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { data: settings } = useSiteSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const submitContact = useSubmitContactMessage();

  const editorName = settings?.editor_name ?? 'Japan A. Shah';
  const editorTitle =
    language === 'en'
      ? settings?.editor_title_en ?? 'Editor in Chief & Owner'
      : language === 'hi'
        ? (settings?.editor_title_hi || settings?.editor_title_en) ?? ''
        : (settings?.editor_title_gu || settings?.editor_title_en) ?? 'મુખ્ય સંપાદક અને માલિક';

  const contactPhonePrimary = settings?.contact_phone_primary || '+91 98247 49413';
  const contactPhoneSecondary = settings?.contact_phone_secondary || '+91 76230 46498';
  const contactEmail = settings?.contact_email || 'kanamexpress@gmail.com';
  const websiteUrl = settings?.website_url || 'https://www.kanamexpress.com';
  const address =
    settings?.contact_address ||
    'H.O. Gokul Lalani Khadki,\nJawahar Bazaar, Jambusar,\nDistrict: Bharuch,\nGujarat - 391150';

  const facebookUrl = settings?.facebook_url || 'https://facebook.com/kanamexpress';
  const instagramUrl = settings?.instagram_url || 'https://instagram.com/kanam_express';
  const twitterUrl = settings?.twitter_url || 'https://twitter.com/kanamexpress';
  const youtubeUrl = settings?.youtube_url || 'https://youtube.com/kanamexpress';

  const organizationName =
    language === 'en'
      ? settings?.organization_name_en || 'Kanam Express - Weekly Newspaper'
      : language === 'hi'
        ? (settings?.organization_name_hi || settings?.organization_name_en) || 'Kanam Express - Weekly Newspaper'
        : (settings?.organization_name_gu || settings?.organization_name_en) || 'કાનમ એક્સપ્રેસ - સાપ્તાહિક સમાચાર પત્ર';

  const workingHours =
    language === 'en'
      ? settings?.working_hours_en || 'Mon - Fri: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed'
      : language === 'hi'
        ? (settings?.working_hours_hi || settings?.working_hours_en) || ''
        : (settings?.working_hours_gu || settings?.working_hours_en) || '';

  const googleMapsUrl = settings?.google_maps_embed_url || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.5!2d72.95!3d21.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sJambusar%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1234567890';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        variant: 'destructive',
        description:
          language === 'en'
            ? 'Please fill in your name, email and message.'
            : 'કૃપા કરીને નામ, ઈમેઇલ અને સંદેશ ભરો.',
      });
      return;
    }

    try {
      setSubmitting(true);
      await submitContact.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject || undefined,
        message: formData.message,
      });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      toast({
        description:
          language === 'en'
            ? 'Thank you, your message has been sent.'
            : 'આભાર, તમારો સંદેશ મોકલવામાં આવ્યો છે.',
      });
    } catch (error) {
      console.error('Failed to submit contact message:', error);
      toast({
        variant: 'destructive',
        description:
          language === 'en'
            ? 'Sorry, something went wrong. Please try again later.'
            : 'માફ કરશો, કંઈક ખોટું થયું. કૃપા કરીને થોડા સમય પછી ફરી પ્રયાસ કરો.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout showTicker={false}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {language === 'en' ? 'Contact Us' : 'સંપર્ક કરો'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {language === 'en' 
              ? 'Get in touch with Kanam Express. We\'d love to hear from you!'
              : 'કાનમ એક્સપ્રેસ સાથે સંપર્ક કરો. અમને તમારા તરફથી સાંભળવું ગમશે!'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            {/* Editor Info (from Site Settings) */}
            <div className="bg-card rounded-xl p-6 shadow-card">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{editorName}</h2>
                  <p className="text-primary font-medium">
                    {editorTitle}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground">
                {language === 'en' ? 'Organization:' : 'સંસ્થા:'} {organizationName}
              </p>
            </div>

            {/* Contact Details (from Site Settings) */}
            <div className="bg-card rounded-xl p-6 shadow-card space-y-6">
              <h2 className="text-xl font-bold text-foreground mb-4">
                {language === 'en' ? 'Contact Information' : 'સંપર્ક માહિતી'}
              </h2>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {language === 'en' ? 'Phone' : 'ફોન'}
                  </h3>
                  <a href={`tel:${contactPhonePrimary.replace(/\s+/g, '')}`} className="text-muted-foreground hover:text-primary transition-colors block">
                    {contactPhonePrimary}
                  </a>
                  {contactPhoneSecondary && (
                    <a href={`tel:${contactPhoneSecondary.replace(/\s+/g, '')}`} className="text-muted-foreground hover:text-primary transition-colors block">
                      {contactPhoneSecondary}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {language === 'en' ? 'Email' : 'ઈમેઇલ'}
                  </h3>
                  <a href={`mailto:${contactEmail}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {language === 'en' ? 'Website' : 'વેબસાઈટ'}
                  </h3>
                  <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    {websiteUrl.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {language === 'en' ? 'Office Address' : 'ઓફિસ સરનામું'}
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {address}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media (from Site Settings) */}
            <div className="bg-card rounded-xl p-6 shadow-card">
              <h2 className="text-xl font-bold text-foreground mb-4">
                {language === 'en' ? 'Follow Us' : 'અમને ફોલો કરો'}
              </h2>
              <div className="flex flex-wrap gap-3">
                {facebookUrl && (
                  <a 
                    href={facebookUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Facebook className="w-4 h-4" />
                    <span>Facebook</span>
                  </a>
                )}
                {instagramUrl && (
                  <a 
                    href={instagramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:opacity-90 transition-opacity text-sm"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>{instagramUrl.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                {twitterUrl && (
                  <a 
                    href={twitterUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors text-sm"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>{twitterUrl.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                {youtubeUrl && (
                  <a 
                    href={youtubeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>YouTube</span>
                  </a>
                )}
              </div>
            </div>

            {/* Working Hours */}
            {workingHours && (
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  {language === 'en' ? 'Working Hours' : 'કામકાજના કલાકો'}
                </h3>
                <div className="space-y-2 text-sm">
                  <pre className="whitespace-pre-line text-muted-foreground font-sans">
                    {workingHours}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="bg-card rounded-xl p-8 shadow-card h-fit">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {language === 'en' ? 'Send us a Message' : 'અમને સંદેશ મોકલો'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {language === 'en' ? 'Your Name' : 'તમારું નામ'}
                  </label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={language === 'en' ? 'Enter your name' : 'તમારું નામ દાખલ કરો'} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {language === 'en' ? 'Email' : 'ઈમેઇલ'}
                  </label>
                  <Input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={language === 'en' ? 'Enter your email' : 'તમારો ઈમેઇલ દાખલ કરો'} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {language === 'en' ? 'Phone' : 'ફોન'}
                </label>
                <Input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={language === 'en' ? 'Enter your phone number' : 'તમારો ફોન નંબર દાખલ કરો'} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {language === 'en' ? 'Subject' : 'વિષય'}
                </label>
                <Input 
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder={language === 'en' ? 'Enter subject' : 'વિષય દાખલ કરો'} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {language === 'en' ? 'Message' : 'સંદેશ'}
                </label>
                <Textarea 
                  rows={5} 
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={language === 'en' ? 'Write your message here...' : 'તમારો સંદેશ અહીં લખો...'} 
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                <Send className="w-4 h-4 mr-2" />
                {submitting
                  ? language === 'en'
                    ? 'Sending...'
                    : 'મોકલી રહ્યા છીએ...'
                  : language === 'en'
                  ? 'Send Message'
                  : 'સંદેશ મોકલો'}
              </Button>
            </form>
          </div>
        </div>

        {/* Map */}
        {googleMapsUrl && (
          <div className="mt-12 bg-secondary rounded-xl overflow-hidden h-80">
            <iframe
              src={googleMapsUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Contact;
