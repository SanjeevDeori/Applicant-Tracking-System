# ATS Downtown University — Backend

Comprehensive README for the backend service powering the ATS Downtown University project.

## Table of contents

- Project overview
- Architecture & request flow
- Prerequisites
- Environment variables
- Install and run (Windows PowerShell)
- Project structure and important files
- Routes & API endpoints (summary + examples)
- Models & controllers (overview)
- Middleware and error handling
- Database
- Testing and seeding notes
- Deployment notes
- Troubleshooting
- Contributing
- License

## Project overview

This Node.js/Express backend provides REST APIs for authentication, chat/conversations, job listings, tasks, recommendations, and admin functionality for the ATS Downtown University application.

It uses MongoDB (see `config/db.js`) for persistence and JSON Web Tokens (JWT) for authentication.

Success criteria for the README:

- A developer can clone the repo, configure environment variables, run the server locally, and call the main endpoints.
- The documentation explains the request flow and where to look in code for specific functionality.

## Architecture & request flow (high level)

1. Client authenticates via `POST /auth/login` or `POST /auth/register`.
2. Server returns a JWT. Client stores token.
3. For protected endpoints, client sends `Authorization: Bearer <token>` header.
4. `middleware/auth.js` verifies the token, attaches `req.user`, and forwards request to controllers.
5. Controllers in `controllers/` implement business logic, access models in `models/`, and return JSON responses.
6. `middleware/error.js` formats and returns errors.

ASCII flow (Auth + protected endpoints):

Client -> POST /auth/login -> authController -> verify -> return JWT
Client -> GET /tasks (with header) -> auth middleware -> taskController -> DB -> response

## Prerequisites

- Node.js (v14+ recommended)
- npm (comes with Node.js)
- MongoDB instance (local or Atlas)

## Environment variables

Create a `.env` file in the project root or configure environment variables in your environment. Common variables used by this project:

- MONGO_URI - MongoDB connection string (required)
- JWT_SECRET - secret used to sign JWTs (required)
- PORT - port to run the server (default 3000)

Example `.env` (DO NOT commit to git):

MONGO_URI=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/atsdb?retryWrites=true&w=majority
JWT_SECRET=replace_this_with_a_strong_secret
PORT=3000

## Install and run (PowerShell)

Open PowerShell in `d:/atsdowntownuniveristy/backend` and run:

```powershell
# install dependencies
npm install

# start in production
npm start

# start in development (if the project uses nodemon or similar dev script)
npm run dev
```

If you need to run a MongoDB locally, ensure the `MONGO_URI` points to your local MongoDB instance (for example `mongodb://localhost:27017/atsdb`).

## Project structure and important files

- `app.js` — Application entry point; configures Express, middleware, and routes.
- `package.json` — NPM manifest and scripts.
- `config/db.js` — MongoDB connection logic.
- `routes/` — Express routers. Files: `auth.js`, `admin.js`, `chat.js`, `jobs.js`, `recommendations.js`, `tasks.js`.
- `controllers/` — Controller functions implementing route behavior: `authController.js`, `adminController.js`, `chatController.js`, `jobController.js`, `recommendationController.js`, `taskController.js`.
- `models/` — Mongoose models: `User.js`, `Task.js`, `Job.js`, `Conversation.js`, `Message.js`.
- `middleware/` — Middleware: `auth.js` (JWT validation), `error.js` (error handling).

## Routes & API endpoints (summary)

Note: The project uses separate router files for each domain. Below is a summary of commonly expected routes based on the provided file names — if you need exact parameter details, open the matching file in `routes/` and `controllers/`.

- Auth (`routes/auth.js`):
  - POST `/auth/register` — Register a new user. Body: { name, email, password, ... }
  - POST `/auth/login` — Login. Body: { email, password } -> returns { token, user }

- Admin (`routes/admin.js`):
  - Admin-only endpoints (manage users, stats). Requires admin role.

- Chat (`routes/chat.js`):
  - GET `/chat/conversations` — Get user conversations (protected)
  - POST `/chat/conversations` — Start a conversation
  - POST `/chat/:conversationId/messages` — Send message

- Jobs (`routes/jobs.js`):
  - GET `/jobs` — List jobs
  - POST `/jobs` — Create job (protected / admin)
  - GET `/jobs/:id` — Get job details

- Recommendations (`routes/recommendations.js`):
  - GET `/recommendations` — Get recommended items for a user

- Tasks (`routes/tasks.js`):
  - GET `/tasks` — List tasks (protected)
  - POST `/tasks` — Create task
  - PATCH `/tasks/:id` — Update task
  - DELETE `/tasks/:id` — Delete task

### Example requests (PowerShell - Invoke-RestMethod)

Register:

```powershell
$body = @{ name = 'Alice'; email = 'alice@example.com'; password = 'StrongPass1!' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/auth/register' -Body $body -Headers @{ 'Content-Type' = 'application/json' }
```

Login (capture token):

```powershell
$body = @{ email = 'alice@example.com'; password = 'StrongPass1!' } | ConvertTo-Json
$res = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/auth/login' -Body $body -Headers @{ 'Content-Type' = 'application/json' }
$token = $res.token

# example protected request
Invoke-RestMethod -Method Get -Uri 'http://localhost:3000/tasks' -Headers @{ 'Authorization' = "Bearer $token" }
```

If you prefer curl (Linux/macOS or Windows with curl available):

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"StrongPass1!"}'
```

## Models & controllers (overview)

- `models/User.js` — user schema: fields like name, email, passwordHash, role, etc. Passwords should be hashed before save (check `authController` for hashing logic).
- `models/Task.js` — task schema: title, description, assignedTo (User ref), status, dueDate.
- `models/Job.js` — job postings and related fields.
- `models/Conversation.js` / `models/Message.js` — chat models.

Controllers in `controllers/` implement CRUD logic and business rules. For details, open the matching controller file; the naming convention helps map routes to controllers.

## Middleware and error handling

- `middleware/auth.js` — checks `Authorization` header, verifies JWT using `JWT_SECRET`, fetches user info and attaches to `req.user`.
- `middleware/error.js` — central error handler; ensures consistent JSON error responses and logging.

Make sure any middleware that expects `req.user` runs after the auth middleware in `app.js`.

## Database

Database connection is configured in `config/db.js`. Typical usage in `app.js`:

- Connect to MongoDB using `MONGO_URI` from env.
- Handle connection errors and reconnects.

If you use MongoDB Atlas, ensure your IP whitelist and user credentials are correctly set.

## Testing and seeding

This repo does not include tests by default. Recommended next steps:

- Add a `test/` folder and use Jest or Mocha + Supertest for API tests.
- Add a `scripts/seed.js` to create example users, tasks, and jobs for local development.

Quick manual seed (example): create a local script that uses your models to insert sample documents. Run with `node scripts/seed.js` after environment is configured.

## Deployment notes

- Provide `MONGO_URI` and `JWT_SECRET` as environment variables on your host (Heroku, AWS, Azure, DigitalOcean).
- Use a process manager like PM2 for production (or platform-managed service). Example PM2 usage:

```powershell
# install pm2 globally
npm install -g pm2
# start
pm2 start app.js --name ats-backend
```

Security checklist for production:

- Use a strong `JWT_SECRET` and rotate keys when necessary.
- Serve the app behind HTTPS.
- Limit MongoDB user privileges to the minimum required.

## Troubleshooting

- MongoDB connection error: verify `MONGO_URI`, internet connectivity, and Atlas IP whitelist.
- Authentication errors: check `JWT_SECRET` matches what was used to sign tokens.
- Missing env vars: verify `.env` is loaded or variables set in your environment.




