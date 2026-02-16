#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

# Ensure we use the project's virtual environment when run from backend with system Python
def _ensure_venv():
    # If decouple is importable, we're likely in the right env
    try:
        import decouple  # noqa: F401
        return
    except ImportError:
        pass
    # Find project root (parent of backend) and venv python
    this_file = os.path.abspath(__file__)
    backend_dir = os.path.dirname(this_file)
    project_root = os.path.dirname(backend_dir)
    venv_python = os.path.join(project_root, "venv", "Scripts", "python.exe")
    if os.name != "nt":
        venv_python = os.path.join(project_root, "venv", "bin", "python")
    if os.path.isfile(venv_python):
        # Re-run this script with the venv's Python
        os.chdir(backend_dir)
        os.execv(venv_python, [venv_python] + sys.argv)
    # Else continue and let Django report the missing packages

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    _ensure_venv()
    main()
