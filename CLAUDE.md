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
npm run dev            # Watch mode for development
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

# Interactive deployment script (prompts for environment selection)
./deploy.sh
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
- Context API for UI state (AppContext) and version management (TimetableVersionContext)
- Custom hooks for data fetching and business logic

### Backend Architecture

#### Service Architecture
- **Express.js** REST API with Firebase Functions
- **Modular design**: Each domain has Controller → Service → Route structure
- **Firestore** NoSQL database with transaction support
- **JWT authentication** with bcrypt password hashing

#### API Structure
```
/api/students              # Student management
/api/attendance            # Attendance tracking
/api/teachers              # Teacher management
/api/class-sections        # Class/section management
/api/student-timetables    # Student timetable operations
/api/timetable-versions    # Timetable version management
/api/courses               # Course management
/api/classrooms            # Classroom management
/api/seats                 # Seating arrangements
/api/seat-assignments      # Seat assignment operations
/api/student-summaries     # Student summary data
/api/parents               # Parent management
/api/colors                # Color palette management
/api/initialization        # Test data initialization (emulator only)
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
"@backend/*": ["functions/src/*"]
"@components/*": ["frontend/src/components/*"]
"@features/*": ["frontend/src/features/*"]
"@hooks/*": ["frontend/src/hooks/*"]
"@services/*": ["frontend/src/services/*"]
"@store/*": ["frontend/src/store/*"]
"@config/*": ["frontend/src/config/*"]
"@utils/*": ["frontend/src/utils/*"]
```

## Firebase Configuration

### Emulator Setup
- **Functions**: localhost:5001
- **Firestore**: localhost:8080
- **Emulator UI**: localhost:4001 or localhost:4002 (auto-fallback)
- **Frontend Dev Server**: localhost:5173

### Firebase Deployment Region
- **Functions Region**: asia-northeast3 (configured for data residency with Firestore)
- This region alignment is critical for performance and data compliance

### Environment Variables
- `JWT_SECRET`: Set in development via dev.sh script
- `NODE_ENV`: Automatically configured based on build mode

## Critical Architectural Patterns

### Backend Service Layer Patterns
1. **Transaction Pattern**: Use Firestore transactions for multi-step operations (e.g., `ClassSectionService.addStudentToClass:760-839`)
2. **Batch Operations**: Process large datasets in batches of 500 (see `TimetableVersionService`)
3. **Error Context**: Include version information in error messages for debugging
4. **Auto-fallback**: Services auto-query active version when `versionId` not provided

### Frontend-Backend Communication
1. **Query Parameters for Versions**: Pass `versionId` as query param, not in request body
2. **Optional Parameters**: Always make `versionId` optional with `?: string` for backward compatibility
3. **Error Handling**: Catch version mismatch errors and guide users to migration tools
4. **State Synchronization**: Load active version on component mount, re-load on version change events

### Data Consistency Rules
1. **Single Version Rule**: A student's timetable document should only reference classes from one version
2. **Array Cleanup**: When migrating versions, clean `classSectionIds` arrays to remove stale references
3. **Cascade Updates**: Version changes should trigger updates in dependent entities
4. **Validation**: Always validate `versionId` matches between related entities before operations

## Development Workflow

### Making Changes
1. Use `./dev.sh` to start the complete development environment
   - This script kills existing processes, builds all modules, starts emulators, initializes sample data, and starts the frontend dev server
   - Includes automatic health checks for all services
2. Frontend changes hot-reload automatically
3. Backend changes require restart (use `npm run build:watch` in functions/ for continuous compilation)
4. Shared module changes require rebuilding: `cd shared && npx tsc` (or use `npm run dev` for watch mode)
5. **Build Order Dependency**: Always build in this order when making type changes:
   - Shared module first (`cd shared && npx tsc`)
   - Backend second (`cd functions && npm run build`)
   - Frontend last (`cd frontend && npm run build`)

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

### Version-Based Data Isolation System
**Critical:** All data entities (ClassSection, Teacher, StudentTimetable) are isolated by `versionId`
- **Active Version Pattern**: When `versionId` is not provided, backend automatically queries active version via `TimetableVersionService.getActiveVersion()`
- **Version Filtering**: All queries must filter by `versionId` to prevent cross-version data contamination
- **Controller Pattern**: Controllers must read `req.query.versionId` and pass to Service layer
- **Frontend Pattern**: Always fetch active version first using `apiService.getActiveTimetableVersion()` before making data requests

**Implementation Guidelines:**
1. **Creating Entities**: Backend auto-assigns active `versionId` if not provided (see `TeacherService.createTeacher:20-39`, `ClassSectionService.addStudentToClass:760-839`)
2. **Query Pattern**: Service layer checks for `versionId` parameter → fallback to active version → execute query
3. **Frontend Flow**: Load active version → Store in component state → Pass to all API calls
4. **Migration**: When switching versions, student timetables need migration (see `STUDENT_ENROLLMENT_VERSION_FIX.md`)

**Common Pitfall:**
- ❌ Calling API without `versionId` parameter and assuming backend handles it (Controller may not pass it to Service)
- ✅ Always explicitly pass `versionId` from frontend, even if backend has fallback logic

### Timetable System
- Advanced drag-and-drop interface using React DnD
- Bulk download functionality for multiple timetables
- Image generation using html2canvas
- PDF compilation using JSZip and file-saver
- Version-aware: Each timetable belongs to a specific version

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
- Version context propagation through component tree

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
5. **Version-aware endpoints**: Read `req.query.versionId` in controller and pass to service

### Working with Version System
**When adding version-aware features:**

1. **Backend Controller** - Always read `versionId` from query:
```typescript
async myMethod(req: Request, res: Response): Promise<void> {
  const versionId = req.query.versionId as string | undefined;
  // Pass to service
  await this.myService.myMethod(params, versionId);
}
```

2. **Backend Service** - Support optional `versionId` with fallback:
```typescript
async myMethod(params: any, versionId?: string): Promise<T> {
  let targetVersionId = versionId;
  if (!targetVersionId) {
    const activeVersion = await this.timetableVersionService.getActiveVersion();
    targetVersionId = activeVersion.id;
  }
  // Use targetVersionId in query
}
```

3. **Frontend API** - Add optional `versionId` parameter:
```typescript
async myMethod(params: any, versionId?: string): Promise<ApiResponse<T>> {
  const url = versionId ? `${endpoint}?versionId=${versionId}` : endpoint;
  return this.request(url, options);
}
```

4. **Frontend Component** - Load and pass active version:
```typescript
const [activeVersionId, setActiveVersionId] = useState<string | null>(null);

useEffect(() => {
  const loadVersion = async () => {
    const response = await apiService.getActiveTimetableVersion();
    if (response.success) setActiveVersionId(response.data.id);
  };
  loadVersion();
}, []);

// Use in API calls
await apiService.myMethod(params, activeVersionId);
```

### Data Migration Between Versions
- See `STUDENT_ENROLLMENT_VERSION_FIX.md` for student timetable migration patterns
- When activating new version, consider automatic migration of student enrollments
- `classSectionIds` arrays must be cleaned to contain only same-version class IDs

## Troubleshooting Common Issues

### "학생 시간표를 찾을 수 없습니다" (Student timetable not found)
**Cause**: Version mismatch - student has timetable in different version than active version
**Solution**:
1. Check active version ID
2. Verify student's timetable `versionId` in Firestore
3. Run version migration or manually update student timetable

### Students appear in class management but not in timetable
**Cause**: `getEnrolledStudents()` filters by both `classSectionIds` array-contains AND `versionId`
**Solution**: Ensure student timetable `versionId` matches active version

### Controller not passing versionId to Service
**Symptoms**: Backend has version support in Service but queries don't filter by version
**Fix**: Add to Controller:
```typescript
const versionId = req.query.versionId as string | undefined;
await this.service.method(params, versionId);
```

### Frontend errors after version system changes
**Common cause**: Redux slices fetching data without `versionId`
**Fix**: Update Redux thunks to fetch active version first, then query with `versionId`

### Mixed version IDs in classSectionIds array
**Cause**: Manual data manipulation or version migration not completed
**Solution**: Run cleanup script to filter `classSectionIds` by matching `ClassSection.versionId`

## Additional Documentation

The repository contains extensive planning and implementation documentation:

- **timetable-version-system-plan.md** - Comprehensive version system architecture and implementation details
- **STUDENT_ENROLLMENT_VERSION_FIX.md** - Student enrollment migration patterns and troubleshooting
- **VERSION_BASED_CLASS_TEACHER_PLAN.md** - Class and teacher versioning architecture
- **EDIT_MODAL_IMPLEMENTATION_PLAN.md** - Modal dialog implementation patterns
- **database_structure.md** - Firestore schema documentation
- **FIRESTORE_INDEXES.md** - Required Firestore indexes for queries
- **README.md** - Project overview with Korean documentation

Consult these documents when working on related features or troubleshooting issues.