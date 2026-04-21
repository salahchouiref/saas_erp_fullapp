# SaaS IA Audit Assistant

Une implémentation locale complète de la plateforme SaaS d’audit intelligent.

## Structure

- `backend/`: API Node.js + Express + MongoDB
- `frontend/`: application React + Vite
- `docker-compose.yml`: MongoDB + backend

## Installation

### Backend

```powershell
cd backend
npm install
```

Créer `.env` à partir de `.env.example`.

### Frontend

```powershell
cd frontend
npm install
```

## Exécution locale

### Lancer le backend

```powershell
cd backend
npm run dev
```

### Lancer le frontend

```powershell
cd frontend
npm run dev
```

### Avec Docker Compose

```powershell
docker compose up --build
```

## Notes

- Le backend utilise maintenant Ollama local via `OLLAMA_API_URL` et `OLLAMA_MODEL`.
- API AI disponibles : `/api/ai/chat` pour le chatbot, `/api/ai/automate` pour les commandes automatisées.
- L'application inclut l'authentification JWT, gestion des employés, projets et clients, plus recherche et filtrage.
