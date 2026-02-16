#!/usr/bin/env python
"""
Run Django management commands from project root.
Delegates to backend/manage.py so you can run from either News_Portal or News_Portal/backend.
"""
import os
import sys

# Run from backend directory so Django finds settings and apps
BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
os.chdir(BACKEND_DIR)
sys.path.insert(0, BACKEND_DIR)

# Replace our path with backend's manage.py so Django sees the right script name
sys.argv[0] = os.path.join(BACKEND_DIR, "manage.py")

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
