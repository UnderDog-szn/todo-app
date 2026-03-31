# 📝 Todo App — Full Stack

Aplicación de gestión de tareas full-stack con React, FastAPI y SQLite.

## 🚀 Demo

> Próximamente

## ✨ Features

- ✅ Crear, editar y eliminar tareas
- 🎨 Prioridad por colores (Alta, Media, Baja)
- 📅 Fecha límite con alerta de vencimiento
- 🔍 Filtros (Todas, Pendientes, Completadas)
- ✏️ Edición inline con doble click
- 💾 Persistencia en base de datos

## 🛠️ Tecnologías

| Frontend | Backend | Base de datos |
|---|---|---|
| React 18 | Python 3.12 | SQLite |
| TypeScript | FastAPI | SQLAlchemy |
| Vite | Uvicorn | |

## ⚙️ Cómo correrlo localmente

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Abre **http://localhost:5173** en tu navegador.

## 📁 Estructura del proyecto
```
todo-app/
├── backend/
│   └── main.py        # API con FastAPI
└── frontend/
    └── src/
        └── App.tsx    # Interfaz en React
```

## 👨‍💻 Autor

**Felipe Dias** — [github.com/UnderDog-szn](https://github.com/UnderDog-szn)