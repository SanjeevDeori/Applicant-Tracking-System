# ATS Downtown University — Complete System

A comprehensive Applicant Tracking System (ATS) designed for educational institutions, featuring a modern Next.js frontend and robust Node.js/Express backend with real-time chat capabilities.

## 🎯 Project Overview

This full-stack application provides a complete solution for managing job applications, student-alumni mentoring, task management, and real-time communication within an educational ecosystem.

### System Components

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS (`atsdu/`)
- **Backend**: Node.js/Express API with MongoDB (`backend/`)
- **Real-time**: Socket.io for live chat functionality
- **Authentication**: JWT-based with role management

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Architecture Overview](#-architecture-overview)
- [Backend Setup](#-backend-setup)
- [Frontend Setup](#-frontend-setup)
- [Database Configuration](#-database-configuration)
- [API Documentation](#-api-documentation)
- [Real-time Features](#-real-time-features)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **MongoDB** (local or Atlas)
- **npm/yarn/pnpm/bun** (package manager)

### 1. Clone Repository

```bash
git clone <repository-url>
cd Applicant-Tracking-System
```

### 2. Backend Setup

```bash
cd backend
npm install
cp env.txt .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Frontend Setup

```bash
cd ../atsdu
npm install
cp env.txt .env.local
# Edit .env.local with your API URL
npm run dev
```

### 4. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────┐    HTTP/WebSocket    ┌─────────────────┐
│   Next.js       │ ◄──────────────────► │   Express.js    │
│   Frontend      │                      │   Backend       │
│   (Port 3000)   │                      │   (Port 5000)   │
└─────────────────┘                      └─────────────────┘
         │                                        │
         │                                        │
         ▼                                        ▼
┌─────────────────┐                      ┌─────────────────┐
│   Browser       │                      │   MongoDB       │
│   Storage       │                      │   Database      │
└─────────────────┘                      └─────────────────┘
```

### Request Flow

1. **Authentication**: Client authenticates via `POST /auth/login` or `POST /auth/register`
2. **JWT Token**: Server returns JWT, client stores in localStorage
3. **Protected Routes**: Client sends `Authorization: Bearer <token>` header
4. **Middleware**: `middleware/auth.js` verifies token, attaches `req.user`
5. **Controllers**: Business logic in `controllers/` directory
6. **Database**: Mongoose models interact with MongoDB
7. **Response**: JSON responses with proper error handling

### Real-time Communication

- **WebSocket**: Socket.io for live chat functionality
- **Event-driven**: Real-time message delivery and status updates
- **Room Management**: Conversation-based chat rooms

## 🔧 Backend Setup

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **MongoDB** (local instance or MongoDB Atlas)
- **npm/yarn/pnpm** (package manager)

### 1. Environment Configuration

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp env.txt .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/atsdb?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 2. Database Setup

#### Option A: MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster
3. Create database user with read/write permissions
4. Whitelist your IP address
5. Get connection string and update `MONGO_URI`

#### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/atsdb`

### 3. Installation & Running

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Development mode (with auto-restart)
npm run dev

# Production mode
npm start

# Run with PM2 (production)
npm install -g pm2
pm2 start app.js --name ats-backend
```

### 4. Database Seeding (Optional)

Create initial data for development:

```bash
# Run database seeding script
node scripts/create-admin.js

# List users
node scripts/list-users.js
```

### 5. Verify Backend

Test the API endpoints:

```bash
# Health check
curl http://localhost:5000/api/health

# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"student"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📁 Project Structure

### Backend Structure

```
backend/
├── app.js                    # Application entry point
├── package.json              # Dependencies and scripts
├── config/
│   └── db.js                 # MongoDB connection configuration
├── controllers/              # Business logic controllers
│   ├── authController.js     # Authentication logic
│   ├── adminController.js    # Admin operations
│   ├── chatController.js     # Chat and messaging
│   ├── jobController.js      # Job management
│   ├── taskController.js     # Task management
│   └── recommendationController.js
├── middleware/               # Custom middleware
│   ├── auth.js              # JWT authentication
│   ├── error.js             # Error handling
│   └── upload.js            # File upload handling
├── models/                   # Mongoose schemas
│   ├── User.js              # User model
│   ├── Task.js              # Task model
│   ├── Job.js               # Job model
│   ├── Conversation.js      # Chat conversations
│   └── Message.js           # Chat messages
├── routes/                   # API route definitions
│   ├── auth.js              # Authentication routes
│   ├── admin.js             # Admin routes
│   ├── chat.js              # Chat routes
│   ├── jobs.js              # Job routes
│   ├── tasks.js             # Task routes
│   ├── recommendations.js   # Recommendation routes
│   └── upload.js            # File upload routes
├── socket/                   # WebSocket handling
│   └── socketHandler.js     # Socket.io configuration
├── scripts/                  # Utility scripts
│   ├── create-admin.js      # Create admin user
│   └── list-users.js        # List all users
└── uploads/                  # File upload directory
```

### Frontend Structure

```
atsdu/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── admin/           # Admin pages
│   │   ├── applications/    # Job applications
│   │   ├── chat/           # Real-time chat
│   │   ├── dashboard/      # Main dashboard
│   │   ├── jobs/           # Job listings
│   │   ├── login/          # Authentication
│   │   ├── signup/         # User registration
│   │   └── tasks/          # Task management
│   ├── components/          # Reusable components
│   │   ├── ui/             # Base UI components
│   │   ├── chat-window.tsx # Chat interface
│   │   ├── sidebar.tsx     # Navigation
│   │   └── task-card.tsx   # Task display
│   ├── context/            # React Context
│   │   ├── auth-context.tsx
│   │   └── chat-context.tsx
│   ├── hooks/              # Custom hooks
│   │   └── useSocket.ts    # WebSocket hook
│   └── lib/                # Utilities
│       ├── api-client.ts   # HTTP client
│       ├── types.ts        # TypeScript types
│       └── utils.ts        # Helper functions
└── public/                 # Static assets
```

## 📚 API Documentation

### Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication Endpoints

#### POST `/auth/register`

Register a new user with two-stage signup process.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "mobileNumber": "1234567890",
    "grade10": 85,
    "grade12": 90,
    "courseName": "Bachelor of Technology",
    "courseStartDate": "2023-09-01"
  }
}
```

**Response:**

```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

#### POST `/auth/login`

Authenticate user and return JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Job Management Endpoints

#### GET `/jobs`

Get all available job listings with pagination and filtering.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term
- `location` (optional): Filter by location
- `type` (optional): Filter by job type

**Response:**

```json
{
  "success": true,
  "jobs": [
    {
      "id": "job-id",
      "title": "Software Developer",
      "company": "Tech Corp",
      "location": "New York",
      "type": "Full-time",
      "description": "Job description...",
      "requirements": ["React", "Node.js"],
      "salary": "$80,000 - $100,000",
      "postedDate": "2024-01-15",
      "deadline": "2024-02-15"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalJobs": 50
  }
}
```

#### POST `/jobs` (Admin Only)

Create a new job listing.

**Request Body:**

```json
{
  "title": "Software Developer",
  "company": "Tech Corp",
  "location": "New York",
  "type": "Full-time",
  "description": "We are looking for...",
  "requirements": ["React", "Node.js", "MongoDB"],
  "salary": "$80,000 - $100,000",
  "deadline": "2024-02-15"
}
```

### Task Management Endpoints

#### GET `/tasks`

Get user's tasks with filtering options.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**

- `status` (optional): Filter by status (todo, in-progress, completed)
- `priority` (optional): Filter by priority (low, medium, high)
- `assignedTo` (optional): Filter by assignee

**Response:**

```json
{
  "success": true,
  "tasks": [
    {
      "id": "task-id",
      "title": "Update documentation",
      "description": "Update API documentation",
      "status": "in-progress",
      "priority": "high",
      "assignedTo": "user-id",
      "dueDate": "2024-01-30",
      "createdAt": "2024-01-15"
    }
  ]
}
```

#### POST `/tasks`

Create a new task.

**Request Body:**

```json
{
  "title": "New Task",
  "description": "Task description",
  "priority": "medium",
  "assignedTo": "user-id",
  "dueDate": "2024-01-30"
}
```

### Chat Endpoints

#### GET `/chat/conversations`

Get user's conversations.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "success": true,
  "conversations": [
    {
      "id": "conv-id",
      "participants": [
        {
          "id": "user-1",
          "name": "John Doe",
          "email": "john@example.com"
        },
        {
          "id": "user-2",
          "name": "Jane Smith",
          "email": "jane@example.com"
        }
      ],
      "lastMessage": {
        "content": "Hello!",
        "timestamp": "2024-01-15T10:30:00Z",
        "sender": "user-1"
      },
      "unreadCount": 2
    }
  ]
}
```

#### POST `/chat/conversations`

Start a new conversation.

**Request Body:**

```json
{
  "participants": ["user-id-1", "user-id-2"]
}
```

#### POST `/chat/:conversationId/messages`

Send a message in a conversation.

**Request Body:**

```json
{
  "content": "Hello, how are you?",
  "type": "text"
}
```

### Admin Endpoints

#### GET `/admin/users`

Get all users (Admin only).

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Response:**

```json
{
  "success": true,
  "users": [
    {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "status": "active",
      "createdAt": "2024-01-15"
    }
  ]
}
```

#### GET `/admin/stats`

Get system statistics (Admin only).

**Response:**

```json
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalJobs": 25,
    "totalApplications": 300,
    "activeConversations": 45
  }
}
```

## 🔄 Real-time Features

### WebSocket Integration

The application uses Socket.io for real-time communication:

#### Connection Setup

```javascript
// Frontend (useSocket hook)
const socket = useSocket();

// Backend (socketHandler.js)
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});
```

#### Chat Events

- `join_conversation`: Join a chat room
- `send_message`: Send a message
- `message_received`: Message delivery confirmation
- `typing_start`: User starts typing
- `typing_stop`: User stops typing

#### Example Usage

```javascript
// Join conversation
socket.emit("join_conversation", { conversationId: "conv-123" });

// Send message
socket.emit("send_message", {
  conversationId: "conv-123",
  content: "Hello!",
  type: "text",
});

// Listen for messages
socket.on("new_message", (message) => {
  console.log("New message:", message);
});
```

## 🚀 Deployment

### Backend Deployment

#### Option 1: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create ats-backend

# Set environment variables
heroku config:set MONGO_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

#### Option 2: DigitalOcean App Platform

1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy automatically on push

#### Option 3: AWS EC2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start app.js --name ats-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

### Frontend Deployment

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_SOCKET_URL
```

#### Netlify

```bash
# Build the application
npm run build

# Deploy to Netlify
npx netlify deploy --prod --dir=out
```

### Environment Variables for Production

#### Backend (.env)

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/atsdb
JWT_SECRET=your-production-secret
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-frontend-domain.com
```

## 🛠️ Troubleshooting

### Common Backend Issues

#### 1. MongoDB Connection Error

```bash
# Check MongoDB URI
echo $MONGO_URI

# Test connection
mongosh "your-mongodb-uri"

# Check network connectivity
ping cluster0.mongodb.net
```

#### 2. JWT Token Issues

```bash
# Verify JWT_SECRET is set
echo $JWT_SECRET

# Check token expiration
# Tokens expire after 7 days by default
```

#### 3. CORS Errors

```javascript
// Check CORS configuration in app.js
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
```

#### 4. Port Already in Use

```bash
# Kill process on port 5000
npx kill-port 5000

# Or use different port
PORT=5001 npm start
```

### Common Frontend Issues

#### 1. API Connection Failed

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Verify API URL in .env.local
echo $NEXT_PUBLIC_API_URL
```

#### 2. WebSocket Connection Failed

```javascript
// Check socket connection
console.log("Socket connected:", socket.connected);

// Verify socket URL
console.log("Socket URL:", process.env.NEXT_PUBLIC_SOCKET_URL);
```

#### 3. Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npx tsc --noEmit
```

### Performance Issues

#### 1. Slow API Responses

- Check MongoDB query performance
- Add database indexes
- Implement caching with Redis

#### 2. Frontend Performance

- Use Next.js Image component
- Implement code splitting
- Optimize bundle size

## 📊 Monitoring & Logging

### Backend Logging

```javascript
// Winston logger setup
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});
```

### Health Checks

```bash
# Backend health check
curl http://localhost:5000/api/health

# Frontend health check
curl http://localhost:3000/api/health
```

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- Use TypeScript for all new code
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] No console errors

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review existing issues and discussions
- Contact: [your-email@example.com]

## 🔄 Updates & Roadmap

### Recent Updates

- ✅ Two-stage signup form with improved UX
- ✅ Enhanced color palette and dark mode support
- ✅ Real-time chat with message status indicators
- ✅ Comprehensive API documentation
- ✅ Better error handling and validation

### Upcoming Features

- [ ] Advanced search and filtering
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with external job boards
- [ ] File upload and management
- [ ] Video call integration
- [ ] Advanced reporting features

---

**Happy Coding! 🚀**

_Built with ❤️ for educational institutions_
