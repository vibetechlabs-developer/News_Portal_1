# FCM native push devices (depends on PushSubscription index rename migration).

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("news", "0027_pushsubscription_index_rename"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="FCMDevice",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="fcm_devices",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                ("fcm_token", models.TextField(unique=True)),
                (
                    "platform",
                    models.CharField(
                        choices=[("ANDROID", "Android"), ("IOS", "iOS")],
                        max_length=16,
                    ),
                ),
                ("device_id", models.CharField(blank=True, max_length=255, null=True)),
                ("device_model", models.CharField(blank=True, default="", max_length=255)),
                ("app_version", models.CharField(blank=True, default="", max_length=64)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["-updated_at"],
            },
        ),
        migrations.AddIndex(
            model_name="fcmdevice",
            index=models.Index(fields=["user", "device_id"], name="news_fcmdev_user_id_2723bc_idx"),
        ),
        migrations.AddIndex(
            model_name="fcmdevice",
            index=models.Index(fields=["is_active", "-updated_at"], name="news_fcmdev_is_acti_b59b14_idx"),
        ),
    ]
