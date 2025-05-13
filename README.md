# Overview

This Node.js/Express backend serves the Artist Search frontend and provides RESTful API endpoints for:
- User authentication and management (registration, login, logout, delete account) using JWT and HTTP-only cookies
- Artist search and details
- Artworks and their categories
- User favorites management (add, remove, list)
- Gravatar URL generation for user profile images

## Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB Atlas account with a database
- Artsy API client credentials (Client ID and Client Secret)

## Installation
1. Clone the repository:
   ``` bash
   git clone <repo-url>
   cd artist-app-backend
   ```
2. Install dependencies:
   ``` bash
   npm install
   ```
## Configuration
Create a `.env` file in the project root with the following variables:
```bash
# MongoDB
MONGODB_URI=<MongoDB Atlas connection string>

# Artsy API
ARTSY_CLIENT_ID=<Artsy Client ID>
ARTSY_CLIENT_SECRET=<Artsy Client Secret>

# JWT
JWT_SECRET=<StrongRandomString>
JWT_EXPIRES_IN=1h

# Server
PORT=8080
```
## Scripts
- `npm start` – Launch server in production mode
- `npm run dev` – Launch server with nodemon for development

## API Endpoints
### Authentication
- `POST /api/auth/login` – Login user
- `POST /api/users` – Register a new user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/status` - Get current user login status (using cookies)
- `DELETE /api/users/me` - Delete user account



