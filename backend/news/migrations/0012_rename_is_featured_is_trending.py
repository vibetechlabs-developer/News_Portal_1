from django.db import migrations


def _has_column(schema_editor, table_name, column_name):
    connection = schema_editor.connection
    with connection.cursor() as cursor:
        try:
            columns = connection.introspection.get_table_description(cursor, table_name)
        except Exception:
            return False
    return any(getattr(col, "name", None) == column_name for col in columns)


def rename_or_add_field(apps, schema_editor):
    """
    Safely handle the migration from is_featured to is_trending.
    - If is_featured exists, rename it to is_trending
    - If is_featured doesn't exist but is_trending doesn't either, add is_trending
    - If is_trending already exists, do nothing
    """
    has_is_featured = _has_column(schema_editor, "news_newsarticle", "is_featured")
    has_is_trending = _has_column(schema_editor, "news_newsarticle", "is_trending")

    if has_is_featured and not has_is_trending:
        schema_editor.execute(
            "ALTER TABLE news_newsarticle RENAME COLUMN is_featured TO is_trending"
        )
    elif not has_is_featured and not has_is_trending:
        schema_editor.execute(
            "ALTER TABLE news_newsarticle ADD COLUMN is_trending BOOLEAN DEFAULT FALSE NOT NULL"
        )


def reverse_migration(apps, schema_editor):
    """
    Reverse migration: rename is_trending back to is_featured if it exists
    """
    has_is_trending = _has_column(schema_editor, "news_newsarticle", "is_trending")
    has_is_featured = _has_column(schema_editor, "news_newsarticle", "is_featured")

    if has_is_trending and not has_is_featured:
        schema_editor.execute(
            "ALTER TABLE news_newsarticle RENAME COLUMN is_trending TO is_featured"
        )


class Migration(migrations.Migration):

    dependencies = [
        ("news", "0011_add_district_to_newsarticle"),
    ]

    operations = [
        migrations.RunPython(rename_or_add_field, reverse_migration),
    ]

