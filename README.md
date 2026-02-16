# Kanam Express – News Portal

This repository contains the full **News Portal** stack:

- **Backend:** Django 5, Django REST Framework, PostgreSQL
- **Frontend:** React (Vite) app in `kanam_express/`
- **Auth:** JWT via `djangorestframework-simplejwt`
- **Features:** multi-language articles, sections/categories/tags, comments & likes, ads (slots + inventory + requests), contact form, basic analytics

For detailed backend usage, see `API_AND_BACKEND_GUIDE.md`. For structure and implementation details, see `PROJECT_STRUCTURE.md` and `IMPLEMENTATION_CHECKLIST.md`.

---

## 1. Getting started (backend)

From project root:

```bash
venv\Scripts\activate        # Windows (if venv exists in project root)
cd backend
pip install -r ..\requirements.txt
```

Set up your `.env` by copying `backend/env.sample` and updating values (database, `SECRET_KEY`, etc.). Then:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend runs at `http://localhost:8000`, API at `http://localhost:8000/api/v1/`, Swagger UI at `http://localhost:8000/api/v1/docs/`.

---

## 2. Getting started (frontend)

From project root:

```bash
cd kanam_express
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` (or the port Vite chooses). Configure the backend API base URL via the frontend `.env` (see the frontend README for details).

---

## 3. Running tests

Run the Django test suite from the `backend` directory:

```bash
cd backend
python manage.py test
```

This will run:

- Auth and permissions smoke tests under `users/tests.py`
- Basic API behavior tests you add to apps like `news`, `advertisements`, `contact`, and `analytics`

You can optionally use `pytest` (if installed via `requirements-dev.txt`):

```bash
cd backend
pytest
```

---

## 4. Useful docs

- `API_AND_BACKEND_GUIDE.md` – how to log in, main endpoints, how to add data
- `PROJECT_STRUCTURE.md` – overview of backend apps and important files
- `DATABASE_SCHEMA.md` – models and relationships
- `IMPLEMENTATION_CHECKLIST.md` – step-by-step implementation + deployment checklist
- `DATA_ENTRY_GUIDE.md` – how editors/reporters should enter content

