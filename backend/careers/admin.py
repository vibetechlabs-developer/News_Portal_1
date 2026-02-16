from django.contrib import admin
from .models import JobPosting, JobApplication, ApplicationReview, Notification


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ['title', 'location', 'job_type', 'status', 'created_at', 'application_count']
    list_filter = ['status', 'job_type', 'category', 'created_at']
    search_fields = ['title', 'description', 'location']
    readonly_fields = ['created_at', 'updated_at', 'posted_by']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'status', 'posted_by')
        }),
        ('Job Details', {
            'fields': ('requirements', 'responsibilities', 'job_type', 'category', 'location')
        }),
        ('Compensation', {
            'fields': ('salary_range_min', 'salary_range_max')
        }),
        ('Timeline', {
            'fields': ('deadline', 'created_at', 'updated_at')
        }),
    )
    
    def application_count(self, obj):
        return obj.applications.count()
    application_count.short_description = 'Applications'
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating new object
            obj.posted_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'job_posting', 'status', 'applied_at', 'review_status']
    list_filter = ['status', 'job_posting', 'applied_at']
    search_fields = ['full_name', 'email', 'phone']
    readonly_fields = ['applied_at', 'updated_at', 'user']
    
    fieldsets = (
        ('Applicant Information', {
            'fields': ('user', 'full_name', 'email', 'phone', 'years_of_experience')
        }),
        ('Application', {
            'fields': ('job_posting', 'cover_letter', 'skills', 'resume', 'portfolio_url', 'linkedin_url')
        }),
        ('Status & Notes', {
            'fields': ('status', 'admin_notes')
        }),
        ('Timeline', {
            'fields': ('applied_at', 'updated_at')
        }),
    )
    
    def review_status(self, obj):
        if hasattr(obj, 'review'):
            return f"⭐ {obj.review.rating}/5"
        return "Not Reviewed"
    review_status.short_description = 'Review'


@admin.register(ApplicationReview)
class ApplicationReviewAdmin(admin.ModelAdmin):
    list_display = ['application', 'rating', 'reviewed_by', 'reviewed_at']
    list_filter = ['rating', 'reviewed_at']
    search_fields = ['application__full_name', 'feedback']
    readonly_fields = ['reviewed_at', 'updated_at', 'reviewed_by']
    
    fieldsets = (
        ('Review Information', {
            'fields': ('application', 'reviewed_by', 'rating')
        }),
        ('Feedback', {
            'fields': ('feedback',)
        }),
        ('Timeline', {
            'fields': ('reviewed_at', 'updated_at')
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating new object
            obj.reviewed_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['title', 'message']
    readonly_fields = ['created_at', 'read_at']
    
    fieldsets = (
        ('Notification Information', {
            'fields': ('notification_type', 'title', 'message')
        }),
        ('Related Object', {
            'fields': ('related_object_type', 'related_object_id')
        }),
        ('Status', {
            'fields': ('is_read', 'created_at', 'read_at')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()
