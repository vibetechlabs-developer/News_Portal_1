from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('careers', '0006_add_video_reel_notification_types'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobapplication',
            name='father_name',
            field=models.CharField(
                blank=True,
                help_text="Candidate's father name (for Nimnuk Patra)",
                max_length=255,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='jobapplication',
            name='joining_date',
            field=models.DateField(
                blank=True,
                help_text='Joining date set by admin at approval time',
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='jobapplication',
            name='employee_press_id',
            field=models.CharField(
                blank=True,
                help_text='Auto-generated unique Press ID (e.g. KE-2025-0048)',
                max_length=30,
                null=True,
                unique=True,
            ),
        ),
    ]
