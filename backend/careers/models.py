from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import FileExtensionValidator
from datetime import datetime, timedelta

User = get_user_model()


class JobPosting(models.Model):
    """Job postings by admin"""
    
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
        ('ON_HOLD', 'On Hold'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField(help_text="List of job requirements")
    responsibilities = models.TextField(help_text="Job responsibilities")
    
    salary_range_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_range_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    location = models.CharField(max_length=255)
    job_type = models.CharField(
        max_length=20,
        choices=[
            ('FULL_TIME', 'Full Time'),
            ('PART_TIME', 'Part Time'),
            ('CONTRACT', 'Contract'),
            ('INTERNSHIP', 'Internship'),
            ('REMOTE', 'Remote'),
        ]
    )
    
    category = models.CharField(
        max_length=100,
        choices=[
            ('ENGINEERING', 'Engineering'),
            ('SALES', 'Sales'),
            ('MARKETING', 'Marketing'),
            ('DESIGN', 'Design'),
            ('HR', 'Human Resources'),
            ('OPERATIONS', 'Operations'),
            ('FINANCE', 'Finance'),
            ('OTHER', 'Other'),
        ],
        default='OTHER'
    )
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='OPEN')
    
    posted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='job_postings')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    deadline = models.DateTimeField(null=True, blank=True, help_text="Application deadline")
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.location}"
    
    def is_open(self):
        """Check if job is still open for applications"""
        if self.status != 'OPEN':
            return False
        if self.deadline and datetime.now() > self.deadline:
            return False
        return True


class JobApplication(models.Model):
    """User applications for jobs"""
    
    STATUS_CHOICES = [
        ('SUBMITTED', 'Submitted'),
        ('UNDER_REVIEW', 'Under Review'),
        ('SHORTLISTED', 'Shortlisted'),
        ('REJECTED', 'Rejected'),
        ('ACCEPTED', 'Accepted'),
    ]
    
    job_posting = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='applications')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_applications', null=True, blank=True)
    
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    full_name = models.CharField(max_length=255)
    
    # Skills and experience
    years_of_experience = models.PositiveIntegerField()
    cover_letter = models.TextField()
    skills = models.CharField(max_length=500, help_text="Comma-separated skills")
    
    # Resume upload
    resume = models.FileField(
        upload_to='resumes/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx'])]
    )
    
    # Portfolio/links
    portfolio_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUBMITTED')
    
    # Timestamps
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Admin notes
    admin_notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-applied_at']
        # Note: unique_together removed to allow multiple public applications per job
        # Applications are identified by email + job_posting combination
    
    def __str__(self):
        return f"{self.full_name} - {self.job_posting.title}"


class ApplicationReview(models.Model):
    """Track reviews/approvals by admin"""
    
    application = models.OneToOneField(JobApplication, on_delete=models.CASCADE, related_name='review')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='application_reviews')
    
    rating = models.IntegerField(
        choices=[(i, str(i)) for i in range(1, 6)],
        help_text="Rating from 1 to 5"
    )
    feedback = models.TextField()
    
    reviewed_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Review: {self.application.full_name} - Rating: {self.rating}"


class Notification(models.Model):
    """Notifications for admin dashboard"""
    
    NOTIFICATION_TYPES = [
        ('CAREER_APPLICATION', 'Career Application'),
        ('CONTACT_MESSAGE', 'Contact Message'),
        ('OTHER', 'Other'),
    ]
    
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, default='OTHER')
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Link to related object (e.g., JobApplication)
    related_object_type = models.CharField(max_length=50, blank=True, null=True)  # e.g., 'JobApplication'
    related_object_id = models.PositiveIntegerField(blank=True, null=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_read', '-created_at']),
            models.Index(fields=['notification_type']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        from django.utils import timezone
        self.is_read = True
        self.read_at = timezone.now()
        self.save(update_fields=['is_read', 'read_at'])
