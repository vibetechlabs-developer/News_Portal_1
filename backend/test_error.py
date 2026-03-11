import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.test import Client

c = Client(SERVER_NAME='127.0.0.1')
try:
    response = c.get('/api/v1/news/articles/', HTTP_HOST='127.0.0.1')
    print("STATUS:", response.status_code)
except Exception as e:
    with open('error_msg.txt', 'w', encoding='utf-8') as f:
        f.write(str(e))
