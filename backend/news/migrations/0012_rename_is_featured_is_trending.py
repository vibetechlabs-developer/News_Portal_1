from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("news", "0011_add_district_to_newsarticle"),
    ]

    operations = [
        migrations.RenameField(
            model_name="newsarticle",
            old_name="is_featured",
            new_name="is_trending",
        ),
    ]

