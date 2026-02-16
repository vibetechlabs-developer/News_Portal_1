import React, { useState, useEffect } from 'react';
import { careersAPI, JobPosting, JobApplication } from '@/lib/careersAPI';
import { AlertCircle, CheckCircle, Loader, Plus, Edit2, Trash2, Eye, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminComponent = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'reviews'>('jobs');
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Job form state
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    salary_range_min: '',
    salary_range_max: '',
    location: '',
    job_type: 'FULL_TIME',
    category: 'OTHER',
    status: 'OPEN',
    deadline: '',
  });

  useEffect(() => {
    if (activeTab === 'jobs') {
      fetchJobs();
    } else if (activeTab === 'applications') {
      fetchApplications();
    }
  }, [activeTab]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await careersAPI.getJobPostings();
      // Handle paginated response (results) or direct array
      const jobsData = response.data?.results || response.data || [];
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (err: any) {
      setError(language === 'en' ? 'Failed to load job postings' : 'નોકરી પોસ્ટિંગ લોડ કરવામાં વિફળ');
      setJobs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await careersAPI.getAllApplications();
      // Handle paginated response (results) or direct array
      const appsData = response.data?.results || response.data || [];
      setApplications(Array.isArray(appsData) ? appsData : []);
    } catch (err: any) {
      setError(language === 'en' ? 'Failed to load applications' : 'અરજીઓ લોડ કરવામાં વિફળ');
      setApplications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleJobFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setJobFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOrUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const data = {
        ...jobFormData,
        salary_range_min: jobFormData.salary_range_min ? parseInt(jobFormData.salary_range_min) : null,
        salary_range_max: jobFormData.salary_range_max ? parseInt(jobFormData.salary_range_max) : null,
      };

      if (editingJob) {
        await careersAPI.updateJob(editingJob.id, data);
        setSuccess(language === 'en' ? 'Job updated successfully' : 'નોકરી સફળતાપૂર્વક અપડેટ કરી');
      } else {
        await careersAPI.createJob(data);
        setSuccess(language === 'en' ? 'Job created successfully' : 'નોકરી સફળતાપૂર્વક બનાઈ');
      }

      setShowJobForm(false);
      setEditingJob(null);
      setJobFormData({
        title: '',
        description: '',
        requirements: '',
        responsibilities: '',
        salary_range_min: '',
        salary_range_max: '',
        location: '',
        job_type: 'FULL_TIME',
        category: 'OTHER',
        status: 'OPEN',
        deadline: '',
      });
      fetchJobs();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (window.confirm(language === 'en' ? 'Are you sure you want to delete this job?' : 'શું તમે આ નોકરી કાઢી નાખવા માટે ચોક્કસ છો?')) {
      try {
        await careersAPI.deleteJob(jobId);
        setSuccess(language === 'en' ? 'Job deleted successfully' : 'નોકરી સફળતાપૂર્વક કાઢી નાખી');
        fetchJobs();
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message);
      }
    }
  };

  const handleChangeApplicationStatus = async (appId: number, newStatus: string) => {
    try {
      await careersAPI.changeApplicationStatus(appId, newStatus);
      setSuccess(language === 'en' ? 'Status updated successfully' : 'સ્થિતિ સફળતાપૂર્વક અપડેટ કરી');
      fetchApplications();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'jobs'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {language === 'en' ? 'Job Postings' : 'નોકરી પોસ્ટિંગ'}
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'applications'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {language === 'en' ? 'Applications' : 'અરજીઓ'}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex gap-3 items-start p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900 dark:text-red-200">{language === 'en' ? 'Error' : 'ભૂલ'}</p>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}
      {success && (
        <div className="flex gap-3 items-start p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">
              {language === 'en' ? 'Job Postings' : 'નોકરી પોસ્ટિંગ'}
            </h3>
            <button
              onClick={() => {
                setEditingJob(null);
                setJobFormData({
                  title: '',
                  description: '',
                  requirements: '',
                  responsibilities: '',
                  salary_range_min: '',
                  salary_range_max: '',
                  location: '',
                  job_type: 'FULL_TIME',
                  category: 'OTHER',
                  status: 'OPEN',
                  deadline: '',
                });
                setShowJobForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {language === 'en' ? 'Add Job' : 'નોકરી ઉમેરો'}
            </button>
          </div>

          {/* Job Form Modal */}
          {showJobForm && (
            <div className="bg-card rounded-lg border border-border p-6">
              <form onSubmit={handleCreateOrUpdateJob} className="space-y-4">
                <input
                  type="text"
                  name="title"
                  placeholder={language === 'en' ? 'Job Title' : 'નોકરીનું મુખ્ય શીર્ષક'}
                  value={jobFormData.title}
                  onChange={handleJobFormChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                  name="description"
                  placeholder={language === 'en' ? 'Description' : 'વર્ણન'}
                  value={jobFormData.description}
                  onChange={handleJobFormChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                  name="requirements"
                  placeholder={language === 'en' ? 'Requirements' : 'આવશ્યકતાઓ'}
                  value={jobFormData.requirements}
                  onChange={handleJobFormChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                  name="responsibilities"
                  placeholder={language === 'en' ? 'Responsibilities' : 'જવાબદારીઓ'}
                  value={jobFormData.responsibilities}
                  onChange={handleJobFormChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="salary_range_min"
                    placeholder={language === 'en' ? 'Min Salary' : 'ન્યૂનતમ પગાર'}
                    value={jobFormData.salary_range_min}
                    onChange={handleJobFormChange}
                    className="px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="number"
                    name="salary_range_max"
                    placeholder={language === 'en' ? 'Max Salary' : 'મહત્તમ પગાર'}
                    value={jobFormData.salary_range_max}
                    onChange={handleJobFormChange}
                    className="px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <input
                  type="text"
                  name="location"
                  placeholder={language === 'en' ? 'Location' : 'સ્થાન'}
                  value={jobFormData.location}
                  onChange={handleJobFormChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="grid grid-cols-3 gap-4">
                  <select
                    name="job_type"
                    value={jobFormData.job_type}
                    onChange={handleJobFormChange}
                    className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="FULL_TIME">{language === 'en' ? 'Full Time' : 'પૂર્ણ સમય'}</option>
                    <option value="PART_TIME">{language === 'en' ? 'Part Time' : 'અંશકાલીન'}</option>
                    <option value="CONTRACT">{language === 'en' ? 'Contract' : 'કોન્ટ્રેક્ટ'}</option>
                    <option value="INTERNSHIP">{language === 'en' ? 'Internship' : 'ઇન્ટર્નશિપ'}</option>
                    <option value="REMOTE">{language === 'en' ? 'Remote' : 'દૂરવર્તી'}</option>
                  </select>
                  <select
                    name="category"
                    value={jobFormData.category}
                    onChange={handleJobFormChange}
                    className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="ENGINEERING">Engineering</option>
                    <option value="SALES">Sales</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="DESIGN">Design</option>
                    <option value="HR">HR</option>
                    <option value="OPERATIONS">Operations</option>
                    <option value="FINANCE">Finance</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <select
                    name="status"
                    value={jobFormData.status}
                    onChange={handleJobFormChange}
                    className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="OPEN">{language === 'en' ? 'Open' : 'ખુલ્લું'}</option>
                    <option value="CLOSED">{language === 'en' ? 'Closed' : 'બંધ'}</option>
                    <option value="ON_HOLD">{language === 'en' ? 'On Hold' : 'હોલ્ડ પર'}</option>
                  </select>
                </div>
                <input
                  type="datetime-local"
                  name="deadline"
                  value={jobFormData.deadline}
                  onChange={handleJobFormChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowJobForm(false)}
                    className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
                  >
                    {language === 'en' ? 'Cancel' : 'રદ કરો'}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? '...' : (editingJob ? (language === 'en' ? 'Update' : 'અપડેટ') : (language === 'en' ? 'Create' : 'બનાવો'))}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Jobs List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {Array.isArray(jobs) && jobs.length > 0 ? jobs.map(job => (
                <div key={job.id} className="bg-card rounded-lg border border-border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground text-lg">{job.title}</h4>
                    <p className="text-sm text-muted-foreground">{job.location} • {job.job_type} • {job.application_count} {language === 'en' ? 'applications' : 'અરજીઓ'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingJob(job);
                        setJobFormData({
                          title: job.title,
                          description: job.description,
                          requirements: job.requirements,
                          responsibilities: job.responsibilities,
                          salary_range_min: job.salary_range_min?.toString() || '',
                          salary_range_max: job.salary_range_max?.toString() || '',
                          location: job.location,
                          job_type: job.job_type,
                          category: job.category,
                          status: job.status,
                          deadline: job.deadline || '',
                        });
                        setShowJobForm(true);
                      }}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  {language === 'en' ? 'No job postings yet. Click "Add Job" to create one.' : 'હજુ સુધી કોઈ નોકરી પોસ્ટિંગ નથી. એક બનાવવા માટે "નોકરી ઉમેરો" ક્લિક કરો.'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {Array.isArray(applications) && applications.length > 0 ? applications.map(app => (
                <div key={app.id} className="bg-card rounded-lg border border-border p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{app.full_name}</h4>
                      <p className="text-sm text-muted-foreground">{app.job_posting_title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{app.email} • {app.phone}</p>
                    </div>
                    <select
                      value={app.status}
                      onChange={(e) => handleChangeApplicationStatus(app.id, e.target.value)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-primary ${
                        app.status === 'ACCEPTED'
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                          : app.status === 'REJECTED'
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                          : 'bg-muted border-border text-foreground'
                      }`}
                    >
                      <option value="SUBMITTED">{language === 'en' ? 'Submitted' : 'સમર્પિત'}</option>
                      <option value="UNDER_REVIEW">{language === 'en' ? 'Under Review' : 'પર્યાલોચન હેઠળ'}</option>
                      <option value="SHORTLISTED">{language === 'en' ? 'Shortlisted' : 'સંક્ષિપ્ત સૂચી'}</option>
                      <option value="REJECTED">{language === 'en' ? 'Rejected' : 'અસ્વીકૃત'}</option>
                      <option value="ACCEPTED">{language === 'en' ? 'Accepted' : 'સ્વીકૃત'}</option>
                    </select>
                    <a
                      href={app.resume_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-primary"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  {language === 'en' ? 'No applications yet.' : 'હજુ સુધી કોઈ અરજીઓ નથી.'}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminComponent;
