# Sync PushSubscription index: DB may already use b2e592, while 0026 recorded 5912e5.
# - Database (PostgreSQL only): rename 5912e5 -> b2e592 only if the old index exists.
# - State: tell Django the canonical index name is b2e592 (no raw RenameIndex on DB).

from django.db import migrations


_PUSH_INDEX_SQL = """
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'news_pushsubscription'
      AND indexname = 'news_pushsu_is_acti_5912e5_idx'
  ) THEN
    ALTER INDEX news_pushsu_is_acti_5912e5_idx RENAME TO news_pushsu_is_acti_b2e592_idx;
  END IF;
END $$;
"""


def _push_index_forward(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    with schema_editor.connection.cursor() as cursor:
        cursor.execute(_PUSH_INDEX_SQL)


def _push_index_backward(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("news", "0027_fcmdevice"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(_push_index_forward, _push_index_backward),
            ],
            state_operations=[
                migrations.RenameIndex(
                    model_name="pushsubscription",
                    new_name="news_pushsu_is_acti_b2e592_idx",
                    old_name="news_pushsu_is_acti_5912e5_idx",
                ),
            ],
        ),
    ]
