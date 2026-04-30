from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("careers", "0004_jobapplication_aadhar_card_jobapplication_pan_card_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="notification",
            name="notification_type",
            field=models.CharField(
                choices=[
                    ("CAREER_APPLICATION", "Career Application"),
                    ("CONTACT_MESSAGE", "Contact Message"),
                    ("NEWS_ARTICLE", "News Article"),
                    ("OTHER", "Other"),
                ],
                default="OTHER",
                max_length=50,
            ),
        ),
    ]
