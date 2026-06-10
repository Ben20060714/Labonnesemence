# Express REST API — TypeScript + SQLite

API REST complète avec authentification JWT, rôles, blog et gestion de fichiers.

## Stack

- **Runtime** : Node.js + TypeScript strict
- **Framework** : Express.js
- **Base de données** : SQLite via `better-sqlite3`
- **Auth** : JWT (access token 15 min + refresh token 7 jours)
- **Upload** : Multer (10 MB max)
- **Passwords** : bcryptjs (salt rounds 12)

---

## Installation

```bash
git clone <repo>
cd express-api

npm install

cp .env.example .env
# Éditer .env avec vos secrets

npm run dev        # développement
npm run build      # compile TypeScript
npm start          # production (après build)
```

---

## Structure du projet

```
src/
├── index.ts                    # Point d'entrée
├── types/
│   └── index.ts                # Interfaces TypeScript
├── models/
│   └── database.ts             # SQLite + initialisation schéma
├── utils/
│   ├── jwt.ts                  # Génération/vérification tokens
│   └── helpers.ts              # sendSuccess, sendError, slugify...
├── middlewares/
│   ├── auth.middleware.ts      # authenticate, requireRole, requireAdmin
│   ├── upload.middleware.ts    # Configuration Multer
│   └── error.middleware.ts     # Gestion erreurs globale
├── controllers/
│   ├── auth.controller.ts
│   ├── users.controller.ts
│   ├── posts.controller.ts
│   └── files.controller.ts
└── routes/
    ├── auth.routes.ts
    ├── users.routes.ts
    ├── posts.routes.ts
    └── files.routes.ts
```

---

## Authentification

### Flux JWT

```
1. POST /api/auth/register  →  accessToken (15min) + refreshToken (7j)
2. POST /api/auth/login     →  accessToken (15min) + refreshToken (7j)
3. POST /api/auth/refresh   →  rotation: nouveau accessToken + refreshToken
4. POST /api/auth/logout    →  révoque le refreshToken
```

Les refresh tokens sont stockés en base (révocation possible). La rotation automatique évite la réutilisation.

Envoyer le token dans chaque requête privée :
```
Authorization: Bearer <accessToken>
```

---

## Endpoints

### Auth — `/api/auth`

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/register` | Public | Créer un compte |
| POST | `/login` | Public | Se connecter |
| POST | `/refresh` | Public | Renouveler les tokens |
| POST | `/logout` | Privé | Déconnecter (révoque le refresh token) |
| POST | `/logout-all` | Privé | Déconnecter tous les appareils |
| GET | `/me` | Privé | Profil de l'utilisateur courant |
| PATCH | `/password` | Privé | Changer le mot de passe |

**POST /register**
```json
{
  "email": "gauthier@example.com",
  "username": "gauthier",
  "password": "motdepasse123"
}
```

**POST /login**
```json
{
  "email": "alice@example.com",
  "password": "motdepasse123"
}
```

**POST /refresh**
```json
{ "refreshToken": "eyJ..." }
```

**PATCH /password**
```json
{
  "currentPassword": "ancien",
  "newPassword": "nouveau123"
}
```

---

### Utilisateurs — `/api/users`

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/` | Admin | Lister tous les utilisateurs |
| POST | `/` | Admin | Créer un utilisateur |
| GET | `/:id` | Privé | Obtenir un utilisateur |
| PUT | `/:id` | Privé (self/admin) | Mettre à jour |
| DELETE | `/:id` | Privé (self/admin) | Supprimer |

**GET /** (admin) supporte la pagination : `?page=1&limit=10`

**PUT /:id**
```json
{
  "username": "alice2",
  "email": "alice2@example.com",
  "role": "admin"   // admin uniquement
}
```

---

### Blog — `/api/posts`

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/` | Public | Posts publiés (paginés) |
| GET | `/admin` | Privé | Tous les posts (drafts inclus) |
| GET | `/:slug` | Public | Un post par son slug |
| POST | `/` | Privé | Créer un post |
| PUT | `/:id` | Privé (auteur/admin) | Modifier |
| DELETE | `/:id` | Privé (auteur/admin) | Supprimer |
| PATCH | `/:id/publish` | Privé (auteur/admin) | Publier |
| PATCH | `/:id/unpublish` | Privé (auteur/admin) | Dépublier |

**GET /** — Paramètres de requête :
- `?page=1&limit=10` — Pagination
- `?search=mot` — Recherche dans titre et contenu
- `?author=alice` — Filtrer par auteur

**POST /**
```json
{
  "title": "Mon premier article",
  "content": "Contenu complet de l'article...",
  "excerpt": "Résumé court (optionnel)",
  "published": false
}
```
Le `slug` est généré automatiquement depuis le titre (unicité garantie).

---

### Enseignements — `/api/sermons`

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/` | Public | Lister tous les enseignements |
| POST | `/` | Admin | Ajouter un enseignement |
| PUT | `/:id` | Admin | Modifier un enseignement |
| DELETE | `/:id` | Admin | Supprimer un enseignement |

**POST /**
```json
{
  "titre": "La Foi",
  "verset": "Jean 3:16",
  "description": "...",
  "chemin": "/uploads/audio.mp3",
  "date": "2024-05-20",
  "auteur": "Pasteur Djoe",
  "categorie": "Dimanche"
}
```

---

### Activités — `/api/events`

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/` | Public | Lister toutes les activités |
| POST | `/` | Admin | Créer une activité |
| PUT | `/:id` | Admin | Modifier une activité |
| DELETE | `/:id` | Admin | Supprimer une activité |

---

### Fichiers — `/api/files`

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/upload` | Privé | Upload un fichier |
| POST | `/upload-multiple` | Privé | Upload jusqu'à 10 fichiers |
| GET | `/` | Privé | Lister ses fichiers (admin : tous) |
| GET | `/:id/info` | Privé* | Métadonnées du fichier |
| GET | `/:id/download` | Privé* | Télécharger (attachment) |
| GET | `/:id/stream` | Privé* | Voir en ligne (inline) |
| PATCH | `/:id/visibility` | Privé | Changer public/privé |
| DELETE | `/:id` | Privé (owner/admin) | Supprimer |

*Accessible sans auth si `is_public = true`

**POST /upload** — `multipart/form-data`
```
file: <fichier>
is_public: true   (optionnel, défaut: false)
```

**PATCH /:id/visibility**
```json
{ "is_public": true }
```

**Types de fichiers acceptés** :
Images (jpeg, png, gif, webp, svg), PDF, texte, CSV, JSON, ZIP, Word, Excel

**Taille maximum** : 10 MB par fichier

---

## Réponses API

Toutes les réponses suivent ce format :

```json
// Succès
{
  "success": true,
  "message": "Description optionnelle",
  "data": { ... }
}

// Erreur
{
  "success": false,
  "error": "Message d'erreur"
}

// Liste paginée
{
  "success": true,
  "data": {
    "items": [...],
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## Rôles

| Capacité | user | admin |
|----------|------|-------|
| S'inscrire / Se connecter | ✅ | ✅ |
| Voir les posts publiés | ✅ | ✅ |
| Créer/modifier/supprimer ses posts | ✅ | ✅ |
| Modifier/supprimer tous les posts | ❌ | ✅ |
| Upload de fichiers | ✅ | ✅ |
| Accéder à ses propres fichiers | ✅ | ✅ |
| Voir tous les fichiers | ❌ | ✅ |
| Lister tous les utilisateurs | ❌ | ✅ |
| Changer le rôle d'un utilisateur | ❌ | ✅ |
| Supprimer n'importe quel utilisateur | ❌ | ✅ |

---

## Variables d'environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| `PORT` | `3000` | Port du serveur |
| `JWT_SECRET` | *(requis)* | Secret pour les access tokens |
| `JWT_REFRESH_SECRET` | *(requis)* | Secret pour les refresh tokens |
| `CORS_ORIGIN` | `*` | Origines autorisées CORS |
| `NODE_ENV` | `development` | Environnement |

> ⚠️ En production, utiliser des secrets d'au moins 32 caractères aléatoires.

---

## Schéma de base de données

```sql
users (id, email, username, password, role, created_at, updated_at)
posts (id, title, slug, content, excerpt, author_id, published, created_at, updated_at)
files (id, filename, original_name, mimetype, size, uploader_id, is_public, created_at)
sermons (id, titre, verset, description, chemin, date, auteur, categorie, created_at, updated_at)
events (id, titre, lieu, description, categorie, heure, date, created_at, updated_at)
refresh_tokens (id, user_id, token, expires_at, created_at)
```

La DB SQLite est créée automatiquement dans `./data/database.sqlite` au démarrage.
Les fichiers uploadés sont stockés dans `./uploads/`.
