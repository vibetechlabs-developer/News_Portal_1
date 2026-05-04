# Align PushSubscription index name with Django's auto-generated name (avoids duplicate 0027 leaf migrations).

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("news", "0026_pushsubscription"),
    ]

    operations = [
        migrations.RenameIndex(
            model_name="pushsubscription",
            new_name="news_pushsu_is_acti_b2e592_idx",
            old_name="news_pushsu_is_acti_5912e5_idx",
        ),
    ]
