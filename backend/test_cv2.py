import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from utils.video_helpers import generate_video_thumbnail
import logging

logging.basicConfig(level=logging.DEBUG)

class DummyField:
    def __init__(self, path):
        self.path = os.path.abspath(path)
        self.name = os.path.basename(path)

video_path = 'media/news/media/2026/03/V7.mp4'

if not os.path.exists(video_path):
    print("File not found")
else:
    field = DummyField(video_path)
    print("Generating thumbnail for", video_path)
    res = generate_video_thumbnail(field)
    if res:
        print("Success, bytes len:", len(res.read()))
    else:
        print("Failed to generate.")
