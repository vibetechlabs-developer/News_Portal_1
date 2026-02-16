import React, { useEffect, useState } from 'react';
import { JobPosting, careersAPI } from '@/lib/careersAPI';
import { MapPin, Clock, DollarSign, Calendar, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface JobDetailsProps {
  job: JobPosting;
  onClose: () => void;
  onApplyClick?: () => void;
}

export const JobDetails: React.FC<JobDetailsProps> = ({ job, onClose, onApplyClick }) => {
  const { language } = useLanguage();
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    requirements: true,
    responsibilities: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const jobTypeLabels: { [key: string]: string } = {
    FULL_TIME: language === 'en' ? 'Full Time' : 'સમપૂર્ણ સમય',
    PART_TIME: language === 'en' ? 'Part Time' : 'અંશકાલીન',
    CONTRACT: language === 'en' ? 'Contract' : 'કોન્ટ્રેક્ટ',
    INTERNSHIP: language === 'en' ? 'Internship' : 'ઇન્ટર્નશિપ',
    REMOTE: language === 'en' ? 'Remote' : 'દૂરવર્તી',
  };

  const formatSalary = () => {
    if (!job.salary_range_min && !job.salary_range_max) return null;
    if (job.salary_range_min && job.salary_range_max) {
      return `₹${job.salary_range_min / 100000}L - ₹${job.salary_range_max / 100000}L`;
    }
    return `₹${(job.salary_range_min || job.salary_range_max) / 100000}L`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(language === 'en' ? 'en-US' : 'gu-IN');
  };

  const Section = ({ 
    title, 
    content, 
    sectionKey 
  }: { 
    title: string; 
    content: string; 
    sectionKey: keyof typeof expandedSections;
  }) => {
    const isExpanded = expandedSections[sectionKey];
    return (
      <div className="border border-border rounded-lg">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors"
        >
          <h3 className="font-semibold text-foreground">{title}</h3>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-border">
            <p className="text-sm text-muted-foreground whitespace-pre-line">{content}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{job.title}</h1>
            <p className="text-muted-foreground">{job.category}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-medium">{language === 'en' ? 'Location' : 'સ્થાન'}</span>
              </div>
              <p className="font-semibold text-foreground">{job.location}</p>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">{language === 'en' ? 'Job Type' : 'નોકરીનો પ્રકાર'}</span>
              </div>
              <p className="font-semibold text-foreground">{jobTypeLabels[job.job_type]}</p>
            </div>

            {formatSalary() && (
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-medium">{language === 'en' ? 'Salary' : 'પગાર'}</span>
                </div>
                <p className="font-semibold text-foreground">{formatSalary()}</p>
              </div>
            )}

            {job.deadline && (
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">{language === 'en' ? 'Deadline' : 'સમયમર્યાદા'}</span>
                </div>
                <p className="font-semibold text-foreground text-sm">{formatDate(job.deadline)}</p>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="text-sm font-medium text-muted-foreground">
              {language === 'en' ? 'Status' : 'સ્થિતિ'}:
            </span>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
              job.is_open
                ? 'bg-green-100/20 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-100/20 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {job.is_open ? (language === 'en' ? '✓ Open for Applications' : '✓ અરજીઓ માટે ખુલ્લું') : (language === 'en' ? '✗ Closed' : '✗ બંધ')}
            </span>
          </div>

          {/* Expandable Sections */}
          <div className="space-y-4">
            <Section
              title={language === 'en' ? 'Description' : 'વર્ણન'}
              content={job.description}
              sectionKey="description"
            />

            <Section
              title={language === 'en' ? 'Requirements' : 'આવશ્યકતાઓ'}
              content={job.requirements}
              sectionKey="requirements"
            />

            <Section
              title={language === 'en' ? 'Responsibilities' : 'જવાબદારીઓ'}
              content={job.responsibilities}
              sectionKey="responsibilities"
            />
          </div>

          {/* Application Stats */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              {job.application_count} {language === 'en' ? 'application(s) received' : 'અરજીઓ પ્રાપ્ત થાય'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium"
          >
            {language === 'en' ? 'Close' : 'બંધ કરો'}
          </button>
          {job.is_open && (
            <button
              onClick={onApplyClick}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              {language === 'en' ? 'Apply Now' : 'હવે અરજી કરો'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
