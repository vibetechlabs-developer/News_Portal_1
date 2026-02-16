import React, { useState } from 'react';
import { JobPosting, careersAPI } from '@/lib/careersAPI';
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface JobApplicationFormProps {
  job: JobPosting;
  onClose: () => void;
  onSuccess?: () => void;
}

export const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ job, onClose, onSuccess }) => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    years_of_experience: '',
    skills: '',
    cover_letter: '',
    portfolio_url: '',
    linkedin_url: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setError(language === 'en' ? 'Please upload a PDF or Word document' : 'કૃપયા PDF અથવા Word દસ્તાવેજ અપલોડ કરો');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(language === 'en' ? 'File size must be less than 5MB' : 'ફાઇલનું કદ 5MB કરતાં ઓછું હોવું જોઈએ');
        return;
      }
      setResumeFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!resumeFile) {
      setError(language === 'en' ? 'Please upload your resume' : 'કૃપયા તમારો રેઝ્યુમે અપલોડ કરો');
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        job_posting: job.id,
        resume: resumeFile,
        ...formData,
        years_of_experience: parseInt(formData.years_of_experience),
      };

      await careersAPI.submitApplication(submitData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || err.message;
      
      // Provide user-friendly error messages
      let userFriendlyError = errorMsg;
      if (errorMsg.includes('resume') || errorMsg.includes('file')) {
        userFriendlyError = language === 'en' 
          ? 'Please upload a valid resume file (PDF, DOC, or DOCX)'
          : 'કૃપયા માન્ય રેઝ્યુમે ફાઇલ અપલોડ કરો (PDF, DOC, અથવા DOCX)';
      } else if (errorMsg.includes('email') || errorMsg.includes('invalid')) {
        userFriendlyError = language === 'en'
          ? 'Please check your email address and try again.'
          : 'કૃપયા તમારું ઇમેઇલ સરનામું તપાસો અને ફરી પ્રયાસ કરો.';
      }
      
      setError(language === 'en' ? `Error: ${userFriendlyError}` : `ભૂલ: ${userFriendlyError}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border flex items-center justify-between p-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {language === 'en' ? 'Apply for Position' : 'પોઝિશન માટે અરજી કરો'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{job.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="flex gap-3 items-start p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex gap-3 items-start p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 dark:text-green-300">
                {language === 'en' ? 'Application submitted successfully!' : 'અરજી સફળતાપૂર્વક સમર્પિત કરી!'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="full_name"
              placeholder={language === 'en' ? 'Full Name' : 'પૂરું નામ'}
              value={formData.full_name}
              onChange={handleInputChange}
              required
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="email"
              name="email"
              placeholder={language === 'en' ? 'Email' : 'ઇમેઇલ'}
              value={formData.email}
              onChange={handleInputChange}
              required
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="tel"
              name="phone"
              placeholder={language === 'en' ? 'Phone Number' : 'ફોન નંબર'}
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              name="years_of_experience"
              placeholder={language === 'en' ? 'Years of Experience' : 'અનુભવના વર્ષો'}
              min="0"
              value={formData.years_of_experience}
              onChange={handleInputChange}
              required
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <input
            type="text"
            name="skills"
            placeholder={language === 'en' ? 'Skills (comma separated)' : 'કૌશલ્ય (અલ્પવિરામ દ્વારા વિભાજિત)'}
            value={formData.skills}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <textarea
            name="cover_letter"
            placeholder={language === 'en' ? 'Cover Letter' : 'આવરણ પત્ર'}
            value={formData.cover_letter}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              {language === 'en' ? 'Resume (PDF, DOC, DOCX)' : 'રેઝ્યુમે (PDF, DOC, DOCX)'}
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className="cursor-pointer block">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                {resumeFile ? (
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    {language === 'en' ? 'File selected:' : 'ફાઇલ પસંદ કરી:'} {resumeFile.name}
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">
                      {language === 'en' ? 'Click to upload resume' : 'રેઝ્યુમે અપલોડ કરવા માટે ક્લિક કરો'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'en' ? 'Max file size: 5 MB' : 'મહત્તમ ફાઇલ કદ: 5 MB'}
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="url"
              name="portfolio_url"
              placeholder={language === 'en' ? 'Portfolio URL (optional)' : 'પોર્ટફોલિયો URL (વૈકલ્પિક)'}
              value={formData.portfolio_url}
              onChange={handleInputChange}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="url"
              name="linkedin_url"
              placeholder={language === 'en' ? 'LinkedIn URL (optional)' : 'LinkedIn URL (વૈકલ્પિક)'}
              value={formData.linkedin_url}
              onChange={handleInputChange}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3 justify-end sticky bottom-0 bg-card pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              {language === 'en' ? 'Cancel' : 'રદ કરો'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (language === 'en' ? 'Submitting...' : 'સમર્પણ કરી રહ્યા છીએ...') : (language === 'en' ? 'Submit Application' : 'અરજી સમર્પિત કરો')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
