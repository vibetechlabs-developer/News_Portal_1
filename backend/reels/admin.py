from django.contrib import admin
from django.urls import path
from django.shortcuts import render, redirect
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from .models import Reel, ReelCategory, ReelTag, ReelStatus
from .forms import ReelForm, ReelAdminForm


@admin.register(Reel)
class ReelAdmin(admin.ModelAdmin):
    form = ReelAdminForm
    
    list_display = (
        'title_display',
        'author',
        'status_badge',
        'approval_status',
        'featured_trending',
        'view_count',
        'created_at',
        'published_at',
        'download_link'
    )
    
    list_filter = (
        'status',
        'is_approved',
        'is_featured',
        'is_trending',
        'primary_language',
        'created_at',
        'published_at',
        'author'
    )
    
    search_fields = (
        'title_en',
        'title_hi',
        'title_gu',
        'description_en',
        'author__username',
        'author__email'
    )
    
    prepopulated_fields = {'slug': ('title_en',)}
    
    readonly_fields = (
        'slug',
        'created_at',
        'updated_at',
        'published_at',
        'view_count',
        'like_count',
        'share_count',
        'approved_at',
        'video_preview',
        'thumbnail_preview',
        'file_size_info'
    )
    
    fieldsets = (
        (_('Multilingual Content'), {
            'fields': (
                ('title_en', 'title_hi', 'title_gu'),
                ('description_en', 'description_hi', 'description_gu'),
            )
        }),
        (_('Media Attachments'), {
            'fields': (
                'video',
                'video_preview',
                'file_size_info',
                'thumbnail',
                'thumbnail_preview',
                'duration'
            ),
            'description': 'Upload video file and optional thumbnail image. Supported formats: MP4, MOV, AVI, WebM, MKV'
        }),
        (_('Publishing'), {
            'fields': (
                'author',
                'status',
                'published_at',
                'primary_language'
            )
        }),
        (_('Approval Workflow'), {
            'fields': (
                'is_approved',
                'approved_by',
                'approved_at'
            ),
            'classes': ('collapse',)
        }),
        (_('Visibility'), {
            'fields': (
                'is_featured',
                'is_trending'
            )
        }),
        (_('Slug & Metadata'), {
            'fields': ('slug',),
            'classes': ('collapse',)
        }),
        (_('Metrics'), {
            'fields': (
                'view_count',
                'like_count',
                'share_count'
            ),
            'classes': ('collapse',)
        }),
        (_('Timestamps'), {
            'fields': (
                'created_at',
                'updated_at'
            ),
            'classes': ('collapse',)
        })
    )
    
    actions = [
        'make_published',
        'make_draft',
        'make_featured',
        'remove_featured',
        'approve_reels'
    ]
    
    change_list_template = "admin/reels/reel_change_list.html"
    
    def get_urls(self):
        """Add custom upload URL"""
        urls = super().get_urls()
        custom_urls = [
            path('upload/', self.admin_site.admin_view(self.upload_reel_view), 
                 name='reels_reel_upload'),
        ]
        return custom_urls + urls
    
    def upload_reel_view(self, request):
        """Custom view for uploading reels"""
        if request.method == 'POST':
            form = ReelForm(request.POST, request.FILES)
            if form.is_valid():
                reel = form.save(commit=False)
                reel.author = request.user
                reel.save()
                
                message = f'✓ Reel "{reel.title_en}" uploaded successfully!'
                self.message_user(request, message)
                return redirect('#/admin/reels/reel/')
            else:
                context = {
                    'form': form,
                    'title': 'Upload Reel',
                    'errors': form.errors,
                    'opts': self.model._meta,
                    'has_change_permission': True,
                }
                return render(request, 'admin/reels/upload_reel.html', context)
        else:
            form = ReelForm()
        
        context = {
            'form': form,
            'title': 'Upload Reel',
            'opts': self.model._meta,
            'has_change_permission': True,
        }
        return render(request, 'admin/reels/upload_reel.html', context)
    
    def title_display(self, obj):
        """Display title with language indicator"""
        return f"{obj.title_en} ({obj.get_primary_language_display()})"
    title_display.short_description = _('Title')
    
    def status_badge(self, obj):
        """Color-coded status badge"""
        colors = {
            'draft': '#FFA500',      # Orange
            'published': '#28a745',  # Green
            'archived': '#6c757d'    # Gray
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-weight: bold;">{}</span>',
            colors.get(obj.status, '#000'),
            obj.get_status_display()
        )
    status_badge.short_description = _('Status')
    
    def approval_status(self, obj):
        """Display approval status"""
        if obj.is_approved:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Approved</span>'
            )
        else:
            return format_html(
                '<span style="color: orange; font-weight: bold;">⊘ Pending</span>'
            )
    approval_status.short_description = _('Approval')
    
    def featured_trending(self, obj):
        """Display featured and trending status"""
        badges = []
        if obj.is_featured:
            badges.append('⭐ Featured')
        if obj.is_trending:
            badges.append('🔥 Trending')
        return ' '.join(badges) if badges else '-'
    featured_trending.short_description = _('Visibility')
    
    def download_link(self, obj):
        """Display download link for video"""
        if obj.video:
            return format_html(
                '<a href="{}" target="_blank" class="btn">📥 Download</a>',
                obj.video.url
            )
        return '-'
    download_link.short_description = _('Download')
    
    def video_preview(self, obj):
        """Display video preview/link"""
        if obj.video:
            return format_html(
                '<a href="{}" target="_blank">▶ View Video</a> <br/> <small>File: {}</small>',
                obj.video.url,
                obj.video.name
            )
        return format_html('<span style="color: red;">No video uploaded</span>')
    video_preview.short_description = _('Video Preview')
    
    def file_size_info(self, obj):
        """Display file size information"""
        if obj.video:
            try:
                size = obj.video.size
                for unit in ['B', 'KB', 'MB', 'GB']:
                    if size < 1024:
                        return f"{size:.2f} {unit}"
                    size /= 1024
                return 'Large file'
            except:
                return 'Unable to determine size'
        return '-'
    file_size_info.short_description = _('File Size')
    
    def thumbnail_preview(self, obj):
        """Display thumbnail image preview"""
        if obj.thumbnail:
            return format_html(
                '<img src="{}" width="100" height="100" style="object-fit: cover; border-radius: 5px;" />',
                obj.thumbnail.url
            )
        return format_html('<span style="color: gray;">No thumbnail</span>')
    thumbnail_preview.short_description = _('Thumbnail Preview')
    
    @admin.action(description=_('Mark selected as published'))
    def make_published(self, request, queryset):
        updated = 0
        for reel in queryset:
            if reel.is_approved:
                try:
                    reel.publish()
                    updated += 1
                except ValueError:
                    pass
        self.message_user(request, f'✓ {updated} reels published.')
    
    @admin.action(description=_('Mark selected as draft'))
    def make_draft(self, request, queryset):
        updated = queryset.update(status=ReelStatus.DRAFT)
        self.message_user(request, f'✓ {updated} reels marked as draft.')
    
    @admin.action(description=_('Mark as featured'))
    def make_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'✓ {updated} reels marked as featured.')
    
    @admin.action(description=_('Remove from featured'))
    def remove_featured(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(request, f'✓ {updated} reels removed from featured.')
    
    @admin.action(description=_('Approve reels'))
    def approve_reels(self, request, queryset):
        updated = queryset.update(
            is_approved=True,
            approved_by=request.user,
            approved_at=timezone.now()
        )
        self.message_user(request, f'✓ {updated} reels approved.')
    
    def save_model(self, request, obj, form, change):
        """Set author when creating new reel"""
        if not change:  # Creating new reel
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(ReelCategory)
class ReelCategoryAdmin(admin.ModelAdmin):
    list_display = (
        'name_en',
        'slug',
        'order',
        'is_active',
        'created_at'
    )
    
    list_filter = ('is_active', 'created_at')
    
    search_fields = (
        'name_en',
        'name_hi',
        'name_gu',
        'slug'
    )
    
    prepopulated_fields = {'slug': ('name_en',)}
    
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (_('Names'), {
            'fields': (
                ('name_en', 'name_hi', 'name_gu'),
                'slug'
            )
        }),
        (_('Description'), {
            'fields': (
                'description_en',
                'description_hi',
                'description_gu'
            ),
            'classes': ('collapse',)
        }),
        (_('Settings'), {
            'fields': (
                'icon',
                'order',
                'is_active'
            )
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(ReelTag)
class ReelTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'created_at')
    
    list_filter = ('is_active', 'created_at')
    
    search_fields = ('name', 'slug')
    
    prepopulated_fields = {'slug': ('name',)}
    
    readonly_fields = ('created_at',)
    
    fieldsets = (
        (_('Tag Information'), {
            'fields': (
                'name',
                'slug',
                'is_active'
            )
        }),
        (_('Timestamps'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )
