# AstraMind - Your Personal AI Life OS

## Project Overview
AstraMind is an AI-powered personal operating system that helps users manage life, learning, and creativity through natural conversation. It functions as a digital twin that grows smarter every day.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + Shadcn UI
- **Backend**: Express.js + TypeScript
- **AI**: Google Gemini AI (gemini-2.5-flash)
- **Storage**: In-memory storage (MemStorage)
- **State Management**: TanStack Query (React Query)

## Key Features (MVP)
✅ **Implemented**:
1. Chat interface with AI conversation
2. Dashboard with stats and activity overview
3. Goals management (create, update, progress tracking, complete)
4. Notes management (create, edit, delete with tags)
5. Activity timeline tracking
6. Dark/Light theme toggle
7. Sidebar navigation
8. Responsive design
9. All API endpoints for CRUD operations
10. Activity logging for user actions

🚧 **Needs Enhancement**:
1. **Chat Streaming**: Currently uses simple POST/JSON. Should implement Server-Sent Events (SSE) or streaming for real-time AI responses
2. **data-testid Coverage**: Some interactive elements missing data-testid attributes for testing
3. **Daily Summary UI**: Backend endpoint exists (`/api/summary/daily`) but not wired to dashboard UI

## Technical Stack

### Frontend Structure
```
client/src/
├── components/
│   ├── ui/                 # Shadcn UI components
│   ├── app-sidebar.tsx     # Main navigation sidebar
│   ├── theme-provider.tsx  # Theme context provider
│   └── theme-toggle.tsx    # Dark/light mode toggle
├── pages/
│   ├── dashboard.tsx       # Main dashboard with stats
│   ├── chat.tsx           # AI chat interface
│   ├── goals.tsx          # Goals management
│   ├── notes.tsx          # Notes management
│   └── activity.tsx       # Activity timeline
├── App.tsx                # Main app with routing
└── index.css              # Tailwind + custom styles
```

###Backend Structure
```
server/
├── routes.ts              # All API endpoints
├── storage.ts             # In-memory storage interface
├── gemini.ts             # Gemini AI integration
└── index.ts              # Server entry point
```

### Shared
```
shared/
└── schema.ts             # TypeScript types + Zod schemas
```

## API Endpoints

### Conversations
- `GET /api/conversations` - List all conversations
- `GET /api/conversations/:id` - Get single conversation
- `POST /api/conversations` - Create new conversation
- `PATCH /api/conversations/:id` - Update conversation
- `DELETE /api/conversations/:id` - Delete conversation

### Messages
- `GET /api/conversations/:conversationId/messages` - Get messages for conversation
- `POST /api/chat` - Send message and get AI response

### Goals
- `GET /api/goals` - List all goals
- `GET /api/goals/:id` - Get single goal
- `POST /api/goals` - Create new goal
- `PATCH /api/goals/:id` - Update goal (progress, completion, etc.)
- `DELETE /api/goals/:id` - Delete goal

### Notes
- `GET /api/notes` - List all notes
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create new note
- `PATCH /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Activities
- `GET /api/activities` - List all activities
- `POST /api/activities` - Create activity log
- `GET /api/summary/daily` - Get AI-generated daily summary

## Environment Variables
- `GEMINI_API_KEY` - Google AI API key for Gemini
- `SESSION_SECRET` - Session secret (configured but not used yet)

## Design System
- **Primary Color**: Vibrant purple/blue (`250 85% 60%`)
- **Typography**: Inter (sans), JetBrains Mono (mono)
- **Spacing**: Consistent 4, 6, 8 spacing scale
- **Components**: Shadcn UI with custom theming
- **Dark Mode**: Full support with automatic theme switching

## User Experience Highlights
- **Futuristic Minimalism**: Clean, spacious interface with subtle sci-fi aesthetics
- **Conversational AI**: Natural chat interface as primary interaction
- **Progress Tracking**: Visual progress bars and completion stats
- **Activity Logging**: Automatic tracking of all user actions
- **Responsive**: Mobile-first design with adaptive layouts

## Development Notes
- All forms use React Hook Form + Zod validation
- Query caching via TanStack Query
- Auto-invalidation of caches on mutations
- Proper TypeScript typing throughout
- Design follows guidelines in `design_guidelines.md`

## Future Enhancements (Post-MVP)
- Voice mode with speech-to-text
- Daily summary emails
- Telegram bot integration
- Advanced habit tracking
- Long-term memory patterns and insights
- Data export/import
- Multi-user support with authentication
- PostgreSQL database persistence
- Real-time collaboration features

## Recent Changes
- November 4, 2025: Initial MVP implementation
  - Complete frontend with all core pages
  - Backend API with Gemini integration
  - In-memory storage for all entities
  - Activity tracking system
  - Theme support (dark/light)
  
## Known Issues / TODO
1. Implement streaming chat responses (SSE or web streams)
2. Add data-testid to all interactive elements for testing
3. Wire up daily summary UI to dashboard
4. Add unit tests for critical paths
5. Implement proper error boundaries
6. Add loading skeleton states for all async operations
7. Optimize bundle size

## Running the Project
```bash
npm run dev
```
- Frontend: Vite dev server with HMR
- Backend: Express server with tsx
- Both run on port 5000

## Testing Access
The application is functional and can be tested locally. All core features work but the enhancements listed above will improve the user experience significantly.
