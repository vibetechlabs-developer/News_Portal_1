import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

with connection.cursor() as cursor:
    try:
        cursor.execute("ALTER TABLE news_newsarticle ADD COLUMN is_top boolean DEFAULT false;")
        print("Added is_top column")
    except Exception as e:
        print("Error adding is_top:", e)

    try:
        cursor.execute("ALTER TABLE news_newsarticle ADD COLUMN is_trending boolean DEFAULT false;")
        print("Added is_trending column")
    except Exception as e:
        print("Error adding is_trending:", e)
