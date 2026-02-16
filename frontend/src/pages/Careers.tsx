import React, { useState, useEffect, useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Briefcase, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { JobCard, JobDetails, JobApplicationForm } from '@/components/careers';
import { careersAPI, JobPosting } from '@/lib/careersAPI';

const Careers = () => {
  const { language } = useLanguage();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [filterJobType, setFilterJobType] = useState<string>('ALL');

  // Filter jobs based on selected job type
  const filteredJobs = useMemo(() => {
    if (filterJobType === 'ALL') {
      return jobs;
    }
    return jobs.filter(job => job.job_type === filterJobType);
  }, [jobs, filterJobType]);
  
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await careersAPI.getOpenPositions();
        setJobs(response.data);
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
        setError(language === 'en' ? 'Failed to load job postings' : 'નોકરી પોસ્ટિંગ લોડ કરવામાં વિફળ');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [language]);


  const handleJobCardClick = (job: JobPosting) => {
    setSelectedJob(job);
    setShowDetails(true);
    setShowApplicationForm(false);
  };

  const handleApplyClick = () => {
    if (selectedJob) {
      setShowDetails(false);
      setShowApplicationForm(true);
    }
  };

  const handleApplicationFormClose = () => {
    setShowApplicationForm(false);
    setShowDetails(true);
  };

  const handleApplicationSuccess = () => {
    // Refresh jobs after successful application
    if (selectedJob) {
      const updatedJob = { ...selectedJob, application_count: selectedJob.application_count + 1 };
      setSelectedJob(updatedJob);
      const updatedJobs = jobs.map(j => j.id === updatedJob.id ? updatedJob : j);
      setJobs(updatedJobs);
    }
  };


  return (
    <PageLayout showTicker={false}>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-2xl p-8 md:p-12 mb-12 text-center">
          <h1 className="headline-display text-foreground mb-4">
            {language === 'en' ? 'Join Our Team' : 'અમારી ટીમમાં જોડાઓ'}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {language === 'en'
              ? 'Be part of Gujarat\'s most trusted news organization. We\'re always looking for talented individuals who are passionate about journalism.'
              : 'ગુજરાતની સૌથી વિશ્વસનીય સમાચાર સંસ્થાનો ભાગ બનો. અમે હંમેશા પ્રતિભાશાળી વ્યક્તિઓ શોધીએ છીએ જેઓ પત્રકારત્વ પ્રત્યે ઉત્સાહી છે.'}
          </p>
        </div>

        {/* Current Openings */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="headline-secondary text-foreground">
              {language === 'en' ? 'Current Openings' : 'વર્તમાન ખાલી જગ્યાઓ'}
            </h2>
            
            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              {['ALL', 'FULL_TIME', 'PART_TIME', 'REMOTE', 'INTERNSHIP'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterJobType(type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterJobType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {type === 'ALL' 
                    ? (language === 'en' ? 'All' : 'બધું')
                    : type === 'FULL_TIME'
                    ? (language === 'en' ? 'Full-Time' : 'પૂર્ણ સમય')
                    : type === 'PART_TIME'
                    ? (language === 'en' ? 'Part-Time' : 'અંશકાલીન')
                    : type === 'REMOTE'
                    ? (language === 'en' ? 'Remote' : 'દૂરવર્તી')
                    : (language === 'en' ? 'Internship' : 'ઇન્ટર્નશિપ')
                  }
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader className="w-6 h-6 text-primary animate-spin" />
                <p className="text-muted-foreground">
                  {language === 'en' ? 'Loading opportunities...' : 'તકો લોડ કરી રહ્યા છીએ...'}
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApplyClick={() => handleJobCardClick(job)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground text-lg">
                {language === 'en' 
                  ? 'No openings available in selected category' 
                  : 'પસંદ કરેલ શ્રેણીમાં કોય ખાલી જગ્યાઓ નથી'}
              </p>
            </div>
          )}
        </div>

        {/* Why Join Us */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card rounded-xl p-6 shadow-card">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {language === 'en' ? 'Growth Opportunities' : 'વિકાસની તકો'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'en'
                ? 'Continuous learning and career advancement opportunities.'
                : 'સતત શીખવાની અને કારકિર્દી આગળ વધારવાની તકો.'}
            </p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-card">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💪</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {language === 'en' ? 'Great Benefits' : 'ઉત્તમ લાભો'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'en'
                ? 'Competitive salary, health insurance, and other perks.'
                : 'સ્પર્ધાત્મક પગાર, આરોગ્ય વીમો અને અન્ય લાભો.'}
            </p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-card">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {language === 'en' ? 'Impactful Work' : 'પ્રભાવશાળી કાર્ય'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'en'
                ? 'Make a difference by informing millions of readers.'
                : 'લાખો વાચકોને માહિતગાર કરીને ફરક પાડો.'}
            </p>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-secondary rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">
            {language === 'en' ? "Don't see a role that fits?" : 'તમને અનુકૂળ ભૂમિકા નથી દેખાતી?'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {language === 'en'
              ? 'Send us your resume and we\'ll keep you in mind for future opportunities.'
              : 'અમને તમારો રેઝ્યુમે મોકલો અને ભવિષ્યની તકો માટે અમે તમને ધ્યાનમાં રાખીશું.'}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            {language === 'en' ? 'Contact HR' : 'HR નો સંપર્ક કરો'}
          </Link>
        </div>
      </div>

      {/* Job Details Modal */}
      {showDetails && selectedJob && (
        <JobDetails
          job={selectedJob}
          onClose={() => {
            setShowDetails(false);
            setSelectedJob(null);
          }}
          onApplyClick={handleApplyClick}
        />
      )}

      {/* Application Form Modal */}
      {showApplicationForm && selectedJob && (
        <JobApplicationForm
          job={selectedJob}
          onClose={handleApplicationFormClose}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </PageLayout>
  );
};

export default Careers;
