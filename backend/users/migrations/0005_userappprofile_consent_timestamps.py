from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0004_userappprofile"),
    ]

    operations = [
        migrations.AddField(
            model_name="userappprofile",
            name="location_permission_updated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="userappprofile",
            name="marketing_opt_in_updated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="userappprofile",
            name="personalized_news_opt_in_updated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
