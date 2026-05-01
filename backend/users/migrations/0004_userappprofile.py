from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0003_alter_user_profile_picture"),
    ]

    operations = [
        migrations.CreateModel(
            name="UserAppProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("location_permission_granted", models.BooleanField(default=False)),
                ("latitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("longitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("city", models.CharField(blank=True, max_length=120)),
                ("state", models.CharField(blank=True, max_length=120)),
                ("country", models.CharField(blank=True, max_length=120)),
                ("pincode", models.CharField(blank=True, max_length=20)),
                ("device_id", models.CharField(blank=True, max_length=255)),
                ("device_model", models.CharField(blank=True, max_length=255)),
                ("device_platform", models.CharField(blank=True, max_length=50)),
                ("app_version", models.CharField(blank=True, max_length=50)),
                ("app_build_number", models.CharField(blank=True, max_length=50)),
                ("marketing_opt_in", models.BooleanField(default=False)),
                ("personalized_news_opt_in", models.BooleanField(default=False)),
                ("last_seen_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.OneToOneField(on_delete=models.CASCADE, related_name="app_profile", to="users.user"),
                ),
            ],
        ),
        migrations.AddIndex(
            model_name="userappprofile",
            index=models.Index(fields=["location_permission_granted"], name="users_usera_locatio_03f612_idx"),
        ),
        migrations.AddIndex(
            model_name="userappprofile",
            index=models.Index(fields=["device_platform"], name="users_usera_device__0ec695_idx"),
        ),
        migrations.AddIndex(
            model_name="userappprofile",
            index=models.Index(fields=["last_seen_at"], name="users_usera_last_se_996dbf_idx"),
        ),
    ]
