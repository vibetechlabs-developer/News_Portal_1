# Generated migration for approval workflow

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("news", "0004_backfill_likes_count"),
    ]

    operations = [
        # Add approval fields to Section
        migrations.AddField(
            model_name="section",
            name="is_approved",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="section",
            name="approved_by",
            field=models.ForeignKey(
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="approved_sections",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="section",
            name="approved_at",
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddIndex(
            model_name="section",
            index=models.Index(fields=["is_approved", "is_active"], name="news_sectio_is_appr_idx"),
        ),
        # Add approval fields to Category
        migrations.AddField(
            model_name="category",
            name="is_approved",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="category",
            name="approved_by",
            field=models.ForeignKey(
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="approved_categories",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="category",
            name="approved_at",
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddIndex(
            model_name="category",
            index=models.Index(fields=["is_approved", "is_active"], name="news_catego_is_appr_idx"),
        ),
        # Add approval fields to Tag
        migrations.AddField(
            model_name="tag",
            name="is_approved",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="tag",
            name="approved_by",
            field=models.ForeignKey(
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="approved_tags",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="tag",
            name="approved_at",
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddIndex(
            model_name="tag",
            index=models.Index(fields=["is_approved"], name="news_tag_is_appr_idx"),
        ),
    ]
