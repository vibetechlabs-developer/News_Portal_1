from django import forms
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .models import Reel


class ReelForm(forms.ModelForm):
    """Form for creating and updating reels with proper validation"""
    
    class Meta:
        model = Reel
        fields = [
            'title_en', 'title_hi', 'title_gu',
            'description_en', 'description_hi', 'description_gu',
            'video', 'thumbnail', 'duration',
            'primary_language', 'is_featured', 'is_trending'
        ]
        widgets = {
            'title_en': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Title in English',
                'required': 'required'
            }),
            'title_hi': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'शीर्षक हिंदी में'
            }),
            'title_gu': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'શીર્ષક ગુજરાતીમાં'
            }),
            'description_en': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Description in English'
            }),
            'description_hi': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'विवरण हिंदी में'
            }),
            'description_gu': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'વર્ણન ગુજરાતીમાં'
            }),
            'video': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska,.mp4,.mov,.avi,.webm,.mkv',
                'required': 'required'
            }),
            'thumbnail': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*'
            }),
            'duration': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Duration in seconds (optional)',
                'min': '1'
            }),
            'primary_language': forms.Select(attrs={
                'class': 'form-control'
            }),
            'is_featured': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'is_trending': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            })
        }
    
    def clean_video(self):
        """Validate video file"""
        video = self.cleaned_data.get('video')
        
        if video:
            # Check file size (100 MB max)
            if video.size > 100 * 1024 * 1024:
                raise ValidationError(
                    _('Video file is too large. Maximum size is 100 MB. Your file is %(size).1f MB.'),
                    code='file_too_large',
                    params={'size': video.size / (1024 * 1024)}
                )
            
            # Check file extension
            allowed_extensions = ['mp4', 'mov', 'avi', 'webm', 'mkv']
            file_ext = video.name.split('.')[-1].lower()
            
            if file_ext not in allowed_extensions:
                raise ValidationError(
                    _('Invalid file format. Allowed formats: MP4, MOV, AVI, WebM, MKV'),
                    code='invalid_format'
                )
        
        return video
    
    def clean_thumbnail(self):
        """Validate thumbnail image"""
        thumbnail = self.cleaned_data.get('thumbnail')
        
        if thumbnail:
            # Check file size (5 MB max for thumbnail)
            if thumbnail.size > 5 * 1024 * 1024:
                raise ValidationError(
                    _('Thumbnail image is too large. Maximum size is 5 MB.'),
                    code='image_too_large'
                )
            
            # Check file extension
            allowed_extensions = ['jpg', 'jpeg', 'png', 'webp']
            file_ext = thumbnail.name.split('.')[-1].lower()
            
            if file_ext not in allowed_extensions:
                raise ValidationError(
                    _('Invalid image format. Allowed formats: JPG, PNG, WebP'),
                    code='invalid_image_format'
                )
        
        return thumbnail
    
    def clean_title_en(self):
        """Validate English title"""
        title_en = self.cleaned_data.get('title_en')
        
        if title_en and len(title_en.strip()) < 3:
            raise ValidationError(
                _('Title must be at least 3 characters long.'),
                code='title_too_short'
            )
        
        return title_en
    
    def clean_duration(self):
        """Validate duration"""
        duration = self.cleaned_data.get('duration')
        
        if duration and duration <= 0:
            raise ValidationError(
                _('Duration must be greater than 0 seconds.'),
                code='invalid_duration'
            )
        
        return duration


class ReelAdminForm(ReelForm):
    """Extended form for admin panel with additional fields"""
    
    class Meta(ReelForm.Meta):
        fields = ReelForm.Meta.fields + [
            'status', 'is_approved', 'approved_by', 'approved_at'
        ]
        widgets = {
            **ReelForm.Meta.widgets,
            'status': forms.Select(attrs={
                'class': 'form-control'
            }),
            'is_approved': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'approved_by': forms.Select(attrs={
                'class': 'form-control'
            }),
            'approved_at': forms.DateTimeInput(attrs={
                'type': 'datetime-local',
                'class': 'form-control'
            })
        }
