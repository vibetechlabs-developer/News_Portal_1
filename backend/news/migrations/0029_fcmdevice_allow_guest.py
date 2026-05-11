from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("news", "0028_pushsubscription_index_state_sync"),
    ]

    operations = [
        migrations.AlterField(
            model_name="fcmdevice",
            name="user",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=models.SET_NULL,
                related_name="fcm_devices",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
