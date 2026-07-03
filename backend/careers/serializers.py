from rest_framework import serializers
from .models import JobPosting, JobApplication, ApplicationReview, Notification
from users.serializers import UserSerializer


class JobPostingSerializer(serializers.ModelSerializer):
    posted_by = UserSerializer(read_only=True)
    is_open = serializers.SerializerMethodField()
    application_count = serializers.SerializerMethodField()

    class Meta:
        model = JobPosting
        fields = [
            "id",
            "title",
            "description",
            "requirements",
            "responsibilities",
            "salary_range_min",
            "salary_range_max",
            "location",
            "job_type",
            "category",
            "status",
            "posted_by",
            "created_at",
            "updated_at",
            "deadline",
            "is_open",
            "application_count",
        ]
        read_only_fields = ["id", "posted_by", "created_at", "updated_at"]

    def get_is_open(self, obj):
        return obj.is_open()

    def get_application_count(self, obj):
        return obj.applications.count()


class JobApplicationSerializer(serializers.ModelSerializer):
    job_posting_title = serializers.CharField(
        source="job_posting.title", read_only=True
    )
    user_name = serializers.SerializerMethodField()
    resume_url = serializers.SerializerMethodField()
    aadhar_card_url = serializers.SerializerMethodField()
    pan_card_url = serializers.SerializerMethodField()
    police_verification_url = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()

    def get_user_name(self, obj):
        """Return user name if user exists, otherwise return applicant's full name"""
        if obj.user:
            return obj.user.get_full_name() or obj.user.username
        return obj.full_name  # For public applications, use the applicant's name

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "job_posting",
            "job_posting_title",
            "user",
            "user_name",
            "email",
            "phone",
            "full_name",
            "father_name",
            "years_of_experience",
            "cover_letter",
            "skills",
            "resume",
            "resume_url",
            "aadhar_card",
            "pan_card",
            "police_verification",
            "photo",
            "aadhar_card_url",
            "pan_card_url",
            "police_verification_url",
            "photo_url",
            "portfolio_url",
            "linkedin_url",
            "status",
            "applied_at",
            "updated_at",
            "admin_notes",
            "joining_date",
            "employee_press_id",
        ]
        read_only_fields = ["id", "applied_at", "updated_at", "employee_press_id"]

    def get_resume_url(self, obj):
        if obj.resume:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.resume.url)
        return None

    def get_aadhar_card_url(self, obj):
        if obj.aadhar_card:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.aadhar_card.url)
        return None

    def get_pan_card_url(self, obj):
        if obj.pan_card:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.pan_card.url)
        return None

    def get_police_verification_url(self, obj):
        if obj.police_verification:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.police_verification.url)
        return None

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.photo.url)
        return None

    def get_resume_url(self, obj):
        if obj.resume:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.resume.url)
        return None

    def create(self, validated_data):
        # Validate that all 4 mandatory documents are provided
        required_files = ["aadhar_card", "pan_card", "police_verification", "photo"]
        missing_files = [f for f in required_files if not validated_data.get(f)]
        if missing_files:
            raise serializers.ValidationError(
                {
                    f: "This document is mandatory for job applications."
                    for f in missing_files
                }
            )

        # If user is authenticated, use it; otherwise allow None for public applications
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["user"] = request.user
        else:
            validated_data["user"] = None
        return super().create(validated_data)


class ApplicationReviewSerializer(serializers.ModelSerializer):
    reviewed_by = UserSerializer(read_only=True)
    application_details = JobApplicationSerializer(source="application", read_only=True)

    class Meta:
        model = ApplicationReview
        fields = [
            "id",
            "application",
            "application_details",
            "reviewed_by",
            "rating",
            "feedback",
            "reviewed_at",
            "updated_at",
        ]
        read_only_fields = ["id", "reviewed_by", "reviewed_at", "updated_at"]

    def create(self, validated_data):
        validated_data["reviewed_by"] = self.context["request"].user
        return super().create(validated_data)


class JobApplicationDetailSerializer(serializers.ModelSerializer):
    """Detailed view with review information"""

    job_posting = JobPostingSerializer(read_only=True)
    review = ApplicationReviewSerializer(read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "job_posting",
            "email",
            "phone",
            "full_name",
            "father_name",
            "years_of_experience",
            "cover_letter",
            "skills",
            "resume",
            "aadhar_card",
            "pan_card",
            "police_verification",
            "photo",
            "portfolio_url",
            "linkedin_url",
            "status",
            "applied_at",
            "updated_at",
            "admin_notes",
            "joining_date",
            "employee_press_id",
            "review",
        ]
        read_only_fields = ["id", "applied_at", "updated_at", "employee_press_id"]


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""

    class Meta:
        model = Notification
        fields = [
            "id",
            "notification_type",
            "title",
            "message",
            "related_object_type",
            "related_object_id",
            "is_read",
            "created_at",
            "read_at",
        ]
        read_only_fields = ["id", "created_at", "read_at"]
