
<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white" alt="Ollama">
</p>

<h1 align="center">🚀 SaaS AI Enterprise Assistant</h1>

<p align="center">
  <strong>Plateforme SaaS multi-tenant d'audit intelligent et de gestion d'entreprise assistée par IA</strong>
  <br>
  <em>Audit automatique • RH • Projets • Clients • Chatbot IA • Multi-tenant</em>
</p>

---

## 📋 Table des matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Architecture](#-architecture)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Lancement](#-lancement)
- [Docker](#-docker)
- [Usage](#-usage)
- [Structure du projet](#-structure-du-projet)
- [API](#-api)
- [Licence](#-licence)

---

## 🎯 Aperçu

**SaaS AI Enterprise Assistant** est une plateforme SaaS complète qui combine :

- **🧠 Audit intelligent** — Analyse automatique des données, détection d'anomalies et génération de rapports via IA (Ollama)
- **👔 Gestion d'entreprise** — RH, projets, clients, tâches, livraisons, stocks, commandes, services, paie
- **🔒 Multi-tenant** — Chaque entreprise (tenant) possède ses propres données isolées
- **💬 Chatbot IA** — Assistant conversationnel pour la gestion quotidienne

---

## ✨ Fonctionnalités

### 📊 Audit & IA
- Analyse automatique des données avec des LLMs locaux (Ollama)
- Détection d'anomalies et de fraudes
- Génération de rapports d'audit intelligents
- Chatbot IA pour assister les utilisateurs

### 👨‍💼 Gestion RH
- Gestion des employés (CRUD complet)
- Suivi des congés et absences
- Génération de bulletins de paie
- Organisation par départements

### 📁 Projets & Tâches
- Gestion de projets avec équipes
- Tableau Kanban pour les tâches
- Suivi de progression et budget
- Hiérarchie Manager → Team

### 🤝 Clients & CRM
- Gestion de clients et prospects
- Historique des projets par client
- Suivi des opportunités

### 🏭 Modules métier
- **Livraisons** — Gestion des expéditions
- **Commandes** — Suivi des commandes
- **Stock** — Gestion des inventaires
- **Services** — Catalogue et facturation
- **Paiement** — Bulletins de paie automatisés

### 🔐 Sécurité & Multi-tenant
- Authentification JWT
- Isolation des données par tenant
- Contrôle d'accès basé sur les rôles (Admin, Manager, Employee)
- Middleware tenant automatique

---

## 🛠 Stack technique

### Backend
| Technologie | Version |
|-------------|---------|
| Node.js | 20+ |
| Express | 4.18+ |
| MongoDB / Mongoose | 7.x |
| JWT (jsonwebtoken) | 9.x |
| Socket.io | 4.x |
| bcryptjs | 2.x |
| Docker | 24+ |

### Frontend
| Technologie | Version |
|-------------|---------|
| React | 18.x |
| Vite | 5.x |
| Tailwind CSS | 3.4 |
| React Router | 7.x |
| Socket.io Client | 4.x |

### IA
| Technologie | Description |
|-------------|-------------|
| Ollama | LLM local |
| Codellama / LLaMA / Mistral | Modèles supportés |

---

## 🏗 Architecture

```
Client (React + Vite)
       │
       │ HTTP / WebSocket
       ▼
Backend (Express + Socket.io)
       │
       ├── Middleware (Auth, Tenant, CORS, Cookie)
       ├── Modules (RH, Projets, Clients, Stock, etc.)
       ├── Platform (Feature Registry, Permission Engine)
       └── Services (IA, Audit, Notifications)
       │
       ▼
MongoDB (Multi-tenant avec isolation)
       │
       ▼
Ollama (LLM local)
```

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) ≥ 20
- [npm](https://www.npmjs.com/) ≥ 9
- [MongoDB](https://www.mongodb.com/) ≥ 6.0 (local ou Docker)
- [Ollama](https://ollama.com/) (optionnel, pour les fonctionnalités IA)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (optionnel)

---

## 🔧 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/salahchouiref/saas_erp_fullapp.git
cd saas_erp_fullapp
```

### 2. Installer les dépendances

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Retour à la racine
cd ..
```

### 3. Configurer les variables d'environnement

**Backend** — Créez `backend/.env` :

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/saas_ai
JWT_SECRET=votre_secret_jwt
OLLAMA_API_URL=http://127.0.0.1:11434/v1/completions
OLLAMA_MODEL=codellama:latest
```

**Frontend** — Créez `frontend/.env` :

```env
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Démarrer MongoDB

**Option A — Local**
```bash
mongod
```

**Option B — Docker**
```bash
docker run -d -p 27017:27017 --name mongo -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=example mongo:6.0
```

### 5. Initialiser la base de données

```bash
cd backend
node seed.js
```

> **Compte administrateur par défaut :**
> - Email : `admin@example.com`
> - Mot de passe : `admin123`

### 6. Lancer l'application

```bash
# Depuis la racine
npm run dev

# Ou séparément :
# Backend
cd backend && npm run dev

# Frontend (dans un autre terminal)
cd frontend && npm run dev
```

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:5000/api

---

## 🐳 Docker

### Avec Docker Compose (recommandé)

```bash
docker-compose up -d
```

Cela démarre :
- **MongoDB** sur le port `27017`
- **Backend** sur le port `5000`

### Arrêter les services

```bash
docker-compose down
```

---

## 🚀 Usage

### Connexion

1. Ouvrez http://localhost:5173
2. Connectez-vous avec les identifiants par défaut :
   - **Email** : `admin@example.com`
   - **Mot de passe** : `admin123`

### Navigation

- **Dashboard** — Vue d'ensemble des indicateurs clés
- **Employés** — Gestion des ressources humaines
- **Projets** — Suivi des projets avec Kanban
- **Clients** — CRM et gestion des prospects
- **Audit** — Analyse IA et rapports d'audit
- **Stock / Commandes / Livraisons / Services** — Modules métier

### IA & Chatbot

Pour utiliser les fonctionnalités IA, démarrez Ollama :

```bash
ollama pull codellama  # ou llama3, mistral
ollama serve
```

Le chatbot et l'analyse d'audit utiliseront automatiquement le modèle configuré.

---

## 📁 Structure du projet

```
saas_erp_fullapp/
├── backend/
│   ├── config/          # Configuration (DB, etc.)
│   ├── controllers/     # Contrôleurs Express
│   ├── core/            # Core (auth, tenant, server)
│   ├── middleware/       # Middleware (auth, validation)
│   ├── models/          # Modèles Mongoose
│   ├── modules/         # Modules métier
│   │   ├── ai/          # Intelligence artificielle
│   │   ├── audit/       # Audit & reporting
│   │   ├── crm/         # Clients & CRM
│   │   ├── delivery/    # Livraisons
│   │   ├── hr/          # RH & paie
│   │   ├── notifications/# Notifications temps réel
│   │   ├── orders/      # Commandes
│   │   ├── payslips/    # Bulletins de paie
│   │   ├── projects/    # Projets & tâches
│   │   ├── services/    # Services
│   │   └── stock/       # Gestion de stock
│   ├── platform/        # Platform (feature registry, permissions)
│   ├── routes/          # Routes API
│   ├── services/        # Services métier
│   ├── tests/           # Tests
│   ├── app.js           # Point d'entrée
│   ├── seed.js          # Script d'initialisation DB
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/         # Appels API
│   │   ├── components/  # Composants React
│   │   ├── features/    # Pages par module
│   │   ├── layout/      # Layout global
│   │   └── pages/       # Pages principales
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
├── docker-compose.yml   # Orchestration Docker
└── package.json         # Scripts racine
```

---

## 📡 API

### Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/register` | Inscription |
| GET | `/api/auth/me` | Profil utilisateur |

### Entreprises (Multi-tenant)
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/companies` | Créer une entreprise |
| GET | `/api/companies` | Liste des entreprises |
| GET | `/api/companies/:id` | Détails entreprise |
| PUT | `/api/companies/:id` | Modifier entreprise |

### Autres routes
Les routes des modules (employés, projets, clients, stock, etc.) suivent le pattern REST standard : `GET/POST/PUT/DELETE /api/{module}`.

### WebSocket (Socket.io)
- Connexion temps réel pour les notifications
- Utilisez l'événement `join` avec votre `userId` pour rejoindre votre salon de notifications

---

## 🧪 Tests

```bash
cd backend
npm test
```

Les tests utilisent **Jest** et **Supertest**.

---

## 📄 Licence

Ce projet est développé dans le cadre d'un projet pédagogique (Projet Fin de mdoule).

---

<p align="center">
  <strong>SaaS AI Enterprise Assistant</strong> — <em>Audit intelligent, gestion simplifiée.</em>
  <br>
  <a href="https://github.com/salahchouiref/saas_erp_fullapp">GitHub</a>
</p>
