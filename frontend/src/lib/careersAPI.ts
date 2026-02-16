// API endpoints and helper functions for careers
import axios from '@/lib/axios';

export interface JobPosting {
  id: number;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  salary_range_min: number | null;
  salary_range_max: number | null;
  location: string;
  job_type: string;
  category: string;
  status: string;
  posted_by: any;
  created_at: string;
  updated_at: string;
  deadline: string | null;
  is_open: boolean;
  application_count: number;
}

export interface JobApplication {
  id: number;
  job_posting: number;
  job_posting_title?: string;
  user: number;
  user_name?: string;
  email: string;
  phone: string;
  full_name: string;
  years_of_experience: number;
  cover_letter: string;
  skills: string;
  resume: string;
  resume_url?: string;
  portfolio_url: string | null;
  linkedin_url: string | null;
  status: string;
  applied_at: string;
  updated_at: string;
  admin_notes: string | null;
  review?: ApplicationReview;
}

export interface ApplicationReview {
  id: number;
  application: number;
  reviewed_by: any;
  rating: number;
  feedback: string;
  reviewed_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  related_object_type: string | null;
  related_object_id: number | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

// Job Postings
export const careersAPI = {
  // Jobs
  getJobPostings: (params?: any) => axios.get('/careers/job-postings/', { params }),
  getOpenPositions: () => axios.get('/careers/job-postings/open_positions/'),
  getJobById: (id: number) => axios.get(`/careers/job-postings/${id}/`),
  createJob: (data: any) => axios.post('/careers/job-postings/', data),
  updateJob: (id: number, data: any) => axios.patch(`/careers/job-postings/${id}/`, data),
  deleteJob: (id: number) => axios.delete(`/careers/job-postings/${id}/`),
  getJobApplications: (jobId: number) => axios.get(`/careers/job-postings/${jobId}/applications/`),
  getJobStatistics: (jobId: number) => axios.get(`/careers/job-postings/${jobId}/statistics/`),

  // Applications
  getApplications: (params?: any) => axios.get('/careers/applications/', { params }),
  getApplicationById: (id: number) => axios.get(`/careers/applications/${id}/`),
  submitApplication: (data: any) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return axios.post('/careers/applications/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateApplication: (id: number, data: any) => axios.patch(`/careers/applications/${id}/`, data),
  deleteApplication: (id: number) => axios.delete(`/careers/applications/${id}/`),
  getAllApplications: (params?: any) => axios.get('/careers/applications/all_applications/', { params }),
  changeApplicationStatus: (id: number, status: string) =>
    axios.post(`/careers/applications/${id}/change_status/`, { status }),
  downloadResume: (id: number) => axios.get(`/careers/applications/${id}/download_resume/`),

  // Reviews
  getReviews: (params?: any) => axios.get('/careers/reviews/', { params }),
  getReviewById: (id: number) => axios.get(`/careers/reviews/${id}/`),
  createReview: (data: any) => axios.post('/careers/reviews/', data),
  updateReview: (id: number, data: any) => axios.patch(`/careers/reviews/${id}/`, data),
  deleteReview: (id: number) => axios.delete(`/careers/reviews/${id}/`),
  getReviewsByRating: (rating: number) => axios.get(`/careers/reviews/by_rating/?rating=${rating}`),

  // Notifications
  getNotifications: (params?: { unread_only?: boolean }) => {
    const queryParams = params?.unread_only ? { unread_only: 'true' } : {};
    return axios.get('/careers/notifications/', { params: queryParams });
  },
  getNotificationById: (id: number) => axios.get(`/careers/notifications/${id}/`),
  markNotificationRead: (id: number) => axios.post(`/careers/notifications/${id}/mark_read/`),
  markAllNotificationsRead: () => axios.post('/careers/notifications/mark_all_read/'),
  getUnreadCount: () => axios.get('/careers/notifications/unread_count/'),
};
