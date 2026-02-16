# Backfill: approve all existing records so they remain visible

from django.db import migrations


def approve_existing_records(apps, schema_editor):
    """Set is_approved=True for all existing records so they remain visible."""
    Section = apps.get_model("news", "Section")
    Category = apps.get_model("news", "Category")
    Tag = apps.get_model("news", "Tag")
    
    Section.objects.all().update(is_approved=True)
    Category.objects.all().update(is_approved=True)
    Tag.objects.all().update(is_approved=True)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("news", "0005_add_approval_fields"),
    ]

    operations = [
        migrations.RunPython(approve_existing_records, noop),
    ]
