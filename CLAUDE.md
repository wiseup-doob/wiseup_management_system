# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WiseUp Management System is a full-stack educational management application for online academies. It features a React + TypeScript frontend with Vite, and a Firebase Functions + Firestore backend. The system manages students, teachers, classes, attendance, and timetables with advanced features like drag-and-drop timetable editing and bulk PDF/image generation.

## Development Commands

### Starting the Development Environment
```bash
# Start complete development environment (recommended)
./dev.sh
# This script:
# 1. Kills existing processes
# 2. Builds frontend, shared modules, and backend
# 3. Starts Firebase emulators (functions, firestore, ui)
# 4. Initializes sample data
# 5. Starts frontend dev server

# Alternative manual approach:
# Frontend only
cd frontend && npm run dev

# Backend only  
cd functions && npm run serve

# Build shared modules
cd shared && npx tsc
```

### Build Commands
```bash
# Frontend
cd frontend
npm run build          # Production build
npm run build:local    # Local environment build
npm run build:test     # Test environment build

# Backend
cd functions
npm run build          # TypeScript compilation
npm run build:watch    # Watch mode

# Shared modules
cd shared
npx tsc                # Build shared types/utilities
```

### Linting and Quality
```bash
# Frontend
cd frontend && npm run lint

# Backend  
cd functions && npm run lint
```

### Testing and Deployment
```bash
# Backend deployment
cd functions && npm run deploy

# View logs
cd functions && npm run logs

# Complete Firebase deployment
firebase deploy
```

## Architecture Overview

### Project Structure
```
wiseUp_management_system/
├── frontend/           # React + TypeScript + Vite
├── functions/          # Firebase Functions (Express.js)
├── shared/            # Shared types and utilities
├── firebase.json      # Firebase configuration
├── dev.sh            # Development startup script
└── tsconfig.json     # Root TypeScript config with path mappings
```

### Frontend Architecture

#### Component Hierarchy
- **Widget System**: Base component with 25+ event handlers (mouse, keyboard, touch, drag)
- **Business Components**: Domain-specific components in `src/components/business/`
  - `timetable/` - Advanced timetable management with drag-and-drop
  - `attendance/` - Student attendance tracking with seating
  - `studentInfo/` - Student information panels
- **Feature-based Structure**: `src/features/` organized by domain (attendance, auth, class, grades, schedule, students)

#### Key Frontend Technologies
- React 19 with TypeScript
- Redux Toolkit for state management
- Ant Design for UI components
- React DnD for drag-and-drop functionality
- html2canvas + JSZip for PDF/image generation
- Vite for build tooling

#### State Management
- Redux store with feature-based slices
- Context API for UI state (AppContext)
- Custom hooks for data fetching and business logic

### Backend Architecture

#### Service Architecture
- **Express.js** REST API with Firebase Functions
- **Modular design**: Each domain has Controller → Service → Route structure
- **Firestore** NoSQL database with transaction support
- **JWT authentication** with bcrypt password hashing

#### API Structure
```
/api/students          # Student management
/api/attendance        # Attendance tracking  
/api/teachers          # Teacher management
/api/class-section     # Class/section management
/api/student-timetable # Timetable operations
/api/courses           # Course management
/api/classrooms        # Classroom management
/api/seats             # Seating arrangements
```

#### Shared Module
- Common types and utilities in `shared/`
- Centralized constants and API types
- Database utilities and error handling
- Built separately and imported by both frontend and backend

### Database Design
- **Firestore collections**: students, teachers, classes, attendance, timetables, etc.
- **Relational patterns**: Using document references and subcollections
- **Transaction support**: For data consistency in complex operations

## Path Mappings
The root `tsconfig.json` provides path mappings:
```typescript
"@shared/*": ["shared/*"]
"@frontend/*": ["frontend/src/*"]  
"@functions/*": ["functions/src/*"]
"@components/*": ["frontend/src/components/*"]
"@features/*": ["frontend/src/features/*"]
```

## Firebase Configuration

### Emulator Setup
- **Functions**: localhost:5001
- **Firestore**: localhost:8080  
- **UI**: localhost:4001
- **Frontend**: localhost:5173

### Environment Variables
- `JWT_SECRET`: Set in development via dev.sh script
- `NODE_ENV`: Automatically configured based on build mode

## Development Workflow

### Making Changes
1. Use `./dev.sh` to start the complete development environment
2. Frontend changes hot-reload automatically
3. Backend changes require restart (npm run build:watch helps)
4. Shared module changes require rebuilding: `cd shared && npx tsc`

### Code Style
- ESLint configured for both frontend and backend
- TypeScript strict mode enabled
- React hooks rules enforced
- Consistent naming conventions across modules

### Testing
- Backend has Firebase Functions testing setup
- Frontend uses Vite's built-in testing capabilities
- Always run linting before committing

## Important Implementation Details

### Timetable System
- Advanced drag-and-drop interface using React DnD
- Bulk download functionality for multiple timetables
- Image generation using html2canvas
- PDF compilation using JSZip and file-saver

### Widget Component System  
- Base Widget class handles 25+ events (mouse, keyboard, touch, drag)
- Inheritance pattern: Widget → Button → SidebarButton/IconButton
- Accessibility features built-in (ARIA, keyboard navigation)

### Authentication Flow
- JWT-based authentication with Firebase Functions
- Bcrypt password hashing
- Protected routes using React Router

### Data Flow
- Redux for complex state management
- Custom hooks abstract API calls
- Consistent error handling across components

## Common Tasks

### Adding a New Feature
1. Create feature directory in `frontend/src/features/`
2. Add Redux slice for state management  
3. Create custom hooks for data operations
4. Add corresponding backend API endpoints
5. Update shared types if needed

### Modifying Database Schema
1. Update Firestore types in `shared/types/`
2. Modify backend services and controllers
3. Update frontend types and interfaces
4. Test with emulator data

### Adding New API Endpoints
1. Create/update controller in `functions/src/controllers/`
2. Add service methods in `functions/src/services/`
3. Define routes in `functions/src/routes/`
4. Update frontend API service calls