# Generated migration for Reels app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import reels.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ReelCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name_en', models.CharField(max_length=100, verbose_name='Name (English)')),
                ('name_hi', models.CharField(blank=True, max_length=100, verbose_name='Name (Hindi)')),
                ('name_gu', models.CharField(blank=True, max_length=100, verbose_name='Name (Gujarati)')),
                ('slug', models.SlugField(unique=True)),
                ('description_en', models.TextField(blank=True, verbose_name='Description (English)')),
                ('description_hi', models.TextField(blank=True, verbose_name='Description (Hindi)')),
                ('description_gu', models.TextField(blank=True, verbose_name='Description (Gujarati)')),
                ('icon', models.ImageField(blank=True, null=True, upload_to='reel_categories/', verbose_name='Category Icon')),
                ('order', models.PositiveIntegerField(default=0, verbose_name='Display Order')),
                ('is_active', models.BooleanField(default=True, verbose_name='Active')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Reel Category',
                'verbose_name_plural': 'Reel Categories',
                'ordering': ['order', 'name_en'],
            },
        ),
        migrations.CreateModel(
            name='ReelTag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True, verbose_name='Tag Name')),
                ('slug', models.SlugField(unique=True)),
                ('is_active', models.BooleanField(default=True, verbose_name='Active')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Reel Tag',
                'verbose_name_plural': 'Reel Tags',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Reel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title_en', models.CharField(max_length=255, verbose_name='Title (English)')),
                ('title_hi', models.CharField(blank=True, max_length=255, verbose_name='Title (Hindi)')),
                ('title_gu', models.CharField(blank=True, max_length=255, verbose_name='Title (Gujarati)')),
                ('description_en', models.TextField(blank=True, verbose_name='Description (English)')),
                ('description_hi', models.TextField(blank=True, verbose_name='Description (Hindi)')),
                ('description_gu', models.TextField(blank=True, verbose_name='Description (Gujarati)')),
                ('slug', models.SlugField(help_text='Auto-generated from English title', unique=True, verbose_name='Slug')),
                ('video', models.FileField(help_text='Supported formats: MP4, MOV, AVI, WebM, MKV', upload_to=reels.models.reel_video_upload, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['mp4', 'mov', 'avi', 'webm', 'mkv'])], verbose_name='Video File')),
                ('thumbnail', models.ImageField(blank=True, help_text='Optional custom thumbnail (recommended 16:9 aspect ratio)', null=True, upload_to=reels.models.reel_thumbnail_upload, verbose_name='Thumbnail')),
                ('duration', models.PositiveIntegerField(blank=True, help_text='Auto-calculated after upload', null=True, verbose_name='Duration (seconds)')),
                ('status', models.CharField(choices=[('draft', 'Draft'), ('published', 'Published'), ('archived', 'Archived')], default='draft', max_length=20, verbose_name='Status')),
                ('is_featured', models.BooleanField(default=False, help_text='Show on homepage', verbose_name='Featured')),
                ('is_trending', models.BooleanField(default=False, help_text='Mark as trending content', verbose_name='Trending')),
                ('is_approved', models.BooleanField(default=False, verbose_name='Approved')),
                ('approved_at', models.DateTimeField(blank=True, null=True, verbose_name='Approved At')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('published_at', models.DateTimeField(blank=True, null=True, verbose_name='Published At')),
                ('view_count', models.PositiveIntegerField(default=0, verbose_name='View Count')),
                ('like_count', models.PositiveIntegerField(default=0, verbose_name='Like Count')),
                ('share_count', models.PositiveIntegerField(default=0, verbose_name='Share Count')),
                ('primary_language', models.CharField(choices=[('en', 'English'), ('hi', 'Hindi'), ('gu', 'Gujarati')], default='en', max_length=5, verbose_name='Primary Language')),
                ('approved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='approved_reels', to=settings.AUTH_USER_MODEL, verbose_name='Approved By')),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reels', to=settings.AUTH_USER_MODEL, verbose_name='Author')),
            ],
            options={
                'verbose_name': 'Reel',
                'verbose_name_plural': 'Reels',
                'ordering': ['-published_at', '-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='reelcategory',
            index=models.Index(fields=['is_active', 'order'], name='reels_reelca_is_acti_idx'),
        ),
        migrations.AddIndex(
            model_name='reel',
            index=models.Index(fields=['status', 'published_at'], name='reels_reel_status_published_idx'),
        ),
        migrations.AddIndex(
            model_name='reel',
            index=models.Index(fields=['is_approved', 'status'], name='reels_reel_approved_status_idx'),
        ),
        migrations.AddIndex(
            model_name='reel',
            index=models.Index(fields=['is_featured', 'is_trending'], name='reels_reel_featured_trending_idx'),
        ),
        migrations.AddIndex(
            model_name='reel',
            index=models.Index(fields=['created_at'], name='reels_reel_created_at_idx'),
        ),
        migrations.AddIndex(
            model_name='reel',
            index=models.Index(fields=['author', 'status'], name='reels_reel_author_status_idx'),
        ),
    ]
