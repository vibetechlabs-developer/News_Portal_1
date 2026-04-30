from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("news", "0025_remove_newsarticle_is_featured"),
    ]

    operations = [
        migrations.CreateModel(
            name="PushSubscription",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("endpoint", models.URLField(unique=True)),
                ("p256dh", models.TextField()),
                ("auth", models.TextField()),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["-created_at"],
                "indexes": [models.Index(fields=["is_active", "-created_at"], name="news_pushsu_is_acti_5912e5_idx")],
            },
        ),
    ]
