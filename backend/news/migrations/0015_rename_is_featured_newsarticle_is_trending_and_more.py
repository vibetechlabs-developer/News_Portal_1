from django.db import migrations


class Migration(migrations.Migration):
    """
    Compatibility / no-op migration.

    The original 0015 migration attempted to rename the `is_featured` field on
    `NewsArticle` to `is_trending` using schema-level operations, which fails
    on databases where the `is_featured` column no longer exists.

    Migrations 0012 and 0013 now handle this rename safely using custom SQL
    that checks for the presence of both columns. 0014 handles the e-paper
    cleanup. By making 0015 an empty migration, we allow existing databases
    that still expect a 0015 step to migrate cleanly without further schema
    changes.
    """

    dependencies = [
        ("news", "0014_remove_epaper_edition"),
    ]

    # Intentionally left empty – all required schema work is done in 0012–0014.
    operations = []

