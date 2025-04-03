# TTH Project

Application web de gestion d'articles avec authentification.

## Structure du Projet

- `/frontend` : Application React
- `/backend` : API ASP.NET Core

## Technologies Utilisées

### Frontend
- React
- React Router
- Fetch API
- CSS Modules

### Backend
- ASP.NET Core
- Entity Framework Core
- PostgreSQL
- JWT Authentication

## Installation

### Prérequis
- Node.js
- .NET 8 SDK
- PostgreSQL

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
dotnet restore
dotnet run
```

## Configuration

1. Backend
   - Mettez à jour la chaîne de connexion dans `appsettings.json`
   - Exécutez les migrations: `dotnet ef database update`

2. Frontend
   - Le frontend est configuré pour se connecter à `http://localhost:5131`

## Fonctionnalités

- Authentification utilisateur
- Gestion des articles
- Upload d'images
- Interface responsive
