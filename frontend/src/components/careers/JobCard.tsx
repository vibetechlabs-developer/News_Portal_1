import React, { useState } from 'react';
import { JobPosting } from '@/lib/careersAPI';
import { MapPin, Clock, DollarSign, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface JobCardProps {
  job: JobPosting;
  onApplyClick?: (job: JobPosting) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onApplyClick }) => {
  const { language } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <div
      className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onApplyClick?.(job)}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">{job.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>{job.location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>{jobTypeLabels[job.job_type] || job.job_type}</span>
        </div>

        {formatSalary() && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="w-4 h-4 flex-shrink-0" />
            <span>{formatSalary()}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
          job.is_open
            ? 'bg-green-100/20 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-100/20 text-red-700 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {job.is_open ? (language === 'en' ? 'Open' : 'ખુલ્લું') : (language === 'en' ? 'Closed' : 'બંધ')}
        </span>

        <button
          className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-primary hover:gap-3 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onApplyClick?.(job);
          }}
        >
          {language === 'en' ? 'View' : 'જુઓ'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
