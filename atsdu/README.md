# Applicant Tracking System (ATS) - Frontend

A modern, responsive web application built with Next.js 15, TypeScript, and Tailwind CSS for managing job applications, tasks, and user interactions in an educational environment.

## 🚀 Features

### Core Functionality

- **User Authentication**: Secure login/signup with role-based access (Student, Alumni, Admin)
- **Two-Stage Registration**: Streamlined signup process with personal and academic information
- **Job Management**: Browse, search, and apply for job opportunities
- **Application Tracking**: Monitor application status and progress
- **Task Management**: Create, assign, and track tasks with priority levels
- **Real-time Chat**: Instant messaging between users with message status indicators
- **Mentoring System**: Connect students with alumni mentors
- **Admin Dashboard**: Comprehensive system overview and user management

### Technical Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode Support**: Automatic theme switching with custom color palette
- **Real-time Updates**: WebSocket integration for live chat
- **Form Validation**: Client-side and server-side validation
- **File Upload**: Resume and document management
- **Progress Tracking**: Visual progress indicators and status updates

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Context API
- **Real-time**: Socket.io
- **HTTP Client**: Axios
- **Package Manager**: npm/yarn/pnpm/bun

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn** (v1.22.0 or higher) or **pnpm** (v8.0.0 or higher) or **bun** (v1.0.0 or higher)
- **Git** (for version control)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Applicant-Tracking-System/atsdu
```

### 2. Install Dependencies

Choose one of the following package managers:

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install

# Using bun
bun install
```

### 3. Environment Setup

Create a `.env.local` or `.env` file in the root directory:

```bash
cp env.txt .env.local
```

Edit `.env.local` with your configuration:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: Analytics and Monitoring
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### 4. Start the Development Server

```bash
# Using npm
npm run dev

# Using yarn
yarn run dev

# Using pnpm
pnpm run dev

# Using bun
bun run dev
```

### 5. Open Your Browser

Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
atsdu/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin-only pages
│   │   │   ├── dashboard/     # Admin dashboard
│   │   │   ├── settings/      # System settings
│   │   │   └── users/         # User management
│   │   ├── alumni/            # Alumni-specific pages
│   │   │   └── dashboard/     # Alumni dashboard
│   │   ├── applications/      # Job application pages
│   │   │   └── [id]/         # Individual application details
│   │   ├── chat/              # Real-time chat interface
│   │   ├── dashboard/         # Main dashboard
│   │   ├── jobs/              # Job listing pages
│   │   │   └── [id]/         # Individual job details
│   │   ├── login/             # Authentication pages
│   │   ├── mentoring/         # Mentoring system
│   │   ├── opportunities/     # Job opportunities
│   │   ├── signup/            # User registration
│   │   ├── tasks/             # Task management
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components (shadcn/ui)
│   │   ├── chat-sidebar.tsx  # Chat navigation
│   │   ├── chat-window.tsx   # Chat interface
│   │   ├── dashboard-header.tsx
│   │   ├── job-card.tsx      # Job listing cards
│   │   ├── sidebar.tsx       # Main navigation
│   │   ├── task-card.tsx     # Task display cards
│   │   └── user-selector.tsx # User selection component
│   ├── context/              # React Context providers
│   │   ├── auth-context.tsx  # Authentication state
│   │   └── chat-context.tsx  # Chat state management
│   ├── hooks/                # Custom React hooks
│   │   └── useSocket.ts      # WebSocket hook
│   └── lib/                  # Utility functions
│       ├── api-client.ts     # API communication
│       ├── types.ts          # TypeScript type definitions
│       └── utils.ts          # Helper functions
├── public/                   # Static assets
├── components.json           # shadcn/ui configuration
├── next.config.ts           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## 🎨 Design System

### Color Palette

The application uses a carefully crafted color system:

```css
/* Primary Brand Colors */
--primary: #2563eb; /* Blue-600 */
--primary-foreground: #ffffff;
--primary-dark: #1d4ed8; /* Blue-700 */
--primary-light: #3b82f6; /* Blue-500 */

/* Status Colors */
--success: #10b981; /* Emerald-500 */
--warning: #f59e0b; /* Amber-500 */
--destructive: #ef4444; /* Red-500 */
--info: #06b6d4; /* Cyan-500 */

/* Neutral Colors */
--background: #ffffff;
--foreground: #111827; /* Gray-900 */
--muted: #f3f4f6; /* Gray-100 */
--muted-foreground: #6b7280; /* Gray-500 */
```

### Dark Mode

The application supports automatic dark mode with custom dark theme colors:

```css
/* Dark Mode Colors */
--dark-background: #0f172a; /* Slate-900 */
--dark-foreground: #f8fafc; /* Slate-50 */
--dark-card: #1e293b; /* Slate-800 */
--dark-border: #334155; /* Slate-700 */
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors

# Type checking
npm run type-check   # Run TypeScript compiler

# Database (if applicable)
npm run db:generate  # Generate database schema
npm run db:push      # Push schema changes
npm run db:studio    # Open database studio
```

## 🌐 API Integration

The frontend communicates with the backend API through:

### API Client (`src/lib/api-client.ts`)

- Centralized HTTP client using Axios
- Request/response interceptors
- Error handling and retry logic
- Authentication token management

### Endpoints

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Jobs**: `/api/jobs/*`
- **Applications**: `/api/applications/*`
- **Tasks**: `/api/tasks/*`
- **Chat**: `/api/chat/*`

## 🔐 Authentication

The application uses a custom authentication system with:

- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Student, Alumni, Admin roles
- **Protected Routes**: Automatic redirect for unauthorized access
- **Context Management**: Global authentication state

### User Roles

1. **Student**: Can apply for jobs, manage tasks, use chat
2. **Alumni**: Can mentor students, view applications, manage tasks
3. **Admin**: Full system access, user management, analytics

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on every push

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Environment Variables for Production

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_SOCKET_URL=https://your-api-domain.com
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-frontend-domain.com
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📦 Dependencies

### Core Dependencies

- `next`: ^15.0.0 - React framework
- `react`: ^18.0.0 - UI library
- `typescript`: ^5.0.0 - Type safety
- `tailwindcss`: ^3.4.0 - CSS framework

### UI Dependencies

- `@radix-ui/*`: ^1.0.0 - Accessible UI primitives
- `lucide-react`: ^0.400.0 - Icon library
- `class-variance-authority`: ^0.7.0 - Component variants

### Utility Dependencies

- `axios`: ^1.6.0 - HTTP client
- `socket.io-client`: ^4.7.0 - Real-time communication
- `clsx`: ^2.0.0 - Conditional class names
- `tailwind-merge`: ^2.0.0 - Tailwind class merging

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   # Or use a different port
   npm run dev -- -p 3001
   ```

2. **Module Not Found**

   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript Errors**

   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit
   ```

4. **Build Failures**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

### Performance Optimization

1. **Image Optimization**: Use Next.js Image component
2. **Code Splitting**: Automatic with Next.js
3. **Bundle Analysis**: `npm run analyze`
4. **Lighthouse**: Run performance audits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
