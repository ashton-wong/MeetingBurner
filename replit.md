# The Money Burner 3000

## Overview

The Money Burner 3000 is a gamified meeting cost tracking application designed to combat "meeting bloat" in organizations. The application makes the financial and time costs of meetings visceral and impossible to ignore through real-time tracking, efficiency scoring, and humorous feedback. Built as a full-stack web application, it enables users to set up meetings with attendee salary information, track costs during live meetings, and review historical meeting efficiency through a dashboard interface.

**Primary Goal**: Reduce total time and money spent on low-value, inefficient meetings by making costs tangible and visible.

**Key Features**:
- Real-time meeting cost tracking with animated visualizations
- Meeting efficiency scoring system (A-F grades with humorous descriptions)
- Dashboard for historical meeting analysis
- Salary band-based cost calculations
- Pre-meeting cost estimation

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool

**UI Component System**: 
- shadcn/ui component library (New York style variant) with Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Component structure emphasizes reusability and composition

**Routing**: 
- Wouter for lightweight client-side routing
- Main routes: Dashboard (`/`), Setup Meeting (`/setup`), Active Meeting (`/active`)

**State Management**:
- TanStack Query (React Query) for server state management and caching
- Local state with React hooks
- LocalStorage for meeting session persistence (active meeting ID, attendee data)

**Design System**:
- Typography: Inter (UI text) and Space Grotesk (display/numbers)
- Custom HSL-based color system supporting light/dark modes
- Spacing system using Tailwind's standardized units (2, 4, 6, 8, 12, 16, 24)
- Focus on immediate visual impact with large cost displays and minimal supporting text

**Key UI Components**:
- `LiveMeetingTimer`: Real-time cost counter with burning money animation
- `EfficiencyScoreCard`: Post-meeting grade visualization with detailed breakdown
- `MeetingSetupForm`: Pre-meeting configuration with live cost estimation
- `WeeklyStatsOverview`: Dashboard statistics cards

### Backend Architecture

**Runtime**: Node.js with Express.js server

**API Pattern**: RESTful API design with JSON request/response format

**API Endpoints**:
- `POST /api/meetings` - Create new meeting record
- `GET /api/meetings` - Retrieve all meetings
- `GET /api/meetings/:id` - Retrieve specific meeting
- `PATCH /api/meetings/:id` - Update meeting (for end-of-meeting data)

**Data Storage Strategy**:
- Currently using in-memory storage (`MemStorage` class) for development
- Architecture supports easy swap to database implementation via `IStorage` interface
- Storage layer abstraction allows for future PostgreSQL integration

**Business Logic**:
- Meeting efficiency scoring algorithm (`client/src/lib/scoring.ts`)
- Scoring criteria: agenda presence, overtime, attendee count, meeting duration
- Grade calculation with letter grades (A-F) and humorous descriptions

**Session Management**:
- Stateless API design
- Client-side session tracking via LocalStorage for active meetings
- No authentication system currently implemented

### Data Model

**Attendee Schema**:
- ID (UUID), name, role (Junior/Mid/Senior/Manager)
- Salary bands defined in shared schema: Junior ($45/hr), Mid ($65/hr), Senior ($85/hr), Manager ($110/hr)

**Meeting Schema**:
- Core fields: ID, title, scheduled/actual duration, total cost, attendee count
- Tracking fields: start time, end time, has agenda flag
- Metrics: efficiency score (0-100), efficiency grade (letter + description)

**Cost Calculation**:
- Per-second cost rate based on attendee roles and salary bands
- Real-time accumulation during meeting
- Final cost calculation on meeting end

### Build & Development

**Development Server**: Vite dev server with HMR (Hot Module Replacement)

**Production Build**:
- Frontend: Vite build output to `dist/public`
- Backend: esbuild bundling of Express server to `dist/index.js`
- ESM module format throughout

**TypeScript Configuration**:
- Strict mode enabled
- Path aliases: `@/` for client source, `@shared/` for shared types
- Shared schema types between client and server using Zod

**Database Management** (prepared but not active):
- Drizzle ORM configured for PostgreSQL
- Schema defined in `shared/schema.ts`
- Migration system ready via `drizzle-kit`

## External Dependencies

### UI Component Library
- **Radix UI**: Comprehensive set of headless UI primitives (dialogs, dropdowns, tooltips, etc.)
- **shadcn/ui**: Pre-styled component patterns built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **class-variance-authority**: Type-safe component variants
- **lucide-react**: Icon library

### Data & Forms
- **TanStack Query**: Server state management, caching, and synchronization
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation and schema definition
- **date-fns**: Date formatting and manipulation

### Database (Configured)
- **Drizzle ORM**: TypeScript ORM with PostgreSQL dialect
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **drizzle-zod**: Zod schema generation from Drizzle schemas

### Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety across the stack
- **PostCSS**: CSS processing with Autoprefixer
- **tsx**: TypeScript execution for development

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay for development
- **@replit/vite-plugin-cartographer**: Code navigation plugin
- **@replit/vite-plugin-dev-banner**: Development environment banner

### Assets & Media
- Custom pixel art assets (burning money animation)
- Google Fonts integration for typography
- Audio playback capability for humorous "overtime" notifications

### Future Integration Points
- Calendar integration (Google Calendar, Outlook) for pre-meeting cost estimation
- Video conferencing platform overlays (Zoom, Google Meet, Teams)
- Async communication tool integration (Slack, Teams)