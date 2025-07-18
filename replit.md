# Gaming Platform for Kids

## Overview

This is a full-stack gaming platform designed for kids to develop keyboard and mouse skills through engaging mini-games. The application features 7 different games with varying difficulty levels, user progress tracking, and customizable settings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React hooks with custom state management for game logic
- **Styling**: Tailwind CSS with shadcn/ui components
- **UI Components**: Radix UI primitives for accessibility and consistency

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Style**: RESTful JSON APIs
- **Server Structure**: Modular route handlers with separate storage abstraction
- **Development Setup**: Integrated with Vite for hot module replacement

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Local Storage**: Browser localStorage for client-side settings persistence
- **In-Memory Storage**: Fallback storage implementation for development

## Key Components

### Game System
- **Game Types**: 7 different games targeting keyboard and mouse skills
  - Letter Rain (keyboard typing)
  - Letter Memory (keyboard memory)
  - Keyboard Maze (keyboard navigation)
  - Key Barrier (keyboard timing)
  - Mouse Maze (mouse navigation)
  - Drag & Drop (mouse interaction)
  - Drawing (creative mouse control)

### Game State Management
- **Score Tracking**: Real-time score updates with persistent storage
- **Level Progression**: Automatic level advancement based on performance
- **Health System**: Lives-based gameplay for certain games
- **Settings**: Customizable volume, difficulty, and accessibility options

### UI/UX Design
- **Child-Friendly**: Colorful, engaging interface with custom fonts (Fredoka One, Nunito)
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Animations**: Smooth transitions and engaging visual feedback

## Data Flow

### Client-Server Communication
1. **Game Scores**: POST `/api/scores` to save game results
2. **High Scores**: GET `/api/highscores/:gameType` for leaderboards
3. **User Settings**: GET/POST `/api/settings/:userId` for preferences
4. **User Management**: User creation and authentication endpoints

### State Management Flow
1. **Game State**: Local React state for immediate game interactions
2. **Persistent Data**: localStorage for user preferences and total scores
3. **Server Sync**: Periodic synchronization with backend for score persistence
4. **Settings Management**: Real-time updates with immediate local storage

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React, React DOM, React Query for server state
- **UI Framework**: Radix UI components, Tailwind CSS for styling
- **Database**: Drizzle ORM, PostgreSQL driver (@neondatabase/serverless)
- **Development**: Vite, TypeScript, ESBuild for production builds

### Game-Specific Libraries
- **Icons**: Lucide React for consistent iconography
- **Animations**: CSS transitions and transforms for game animations
- **Canvas API**: Native HTML5 Canvas for drawing game
- **Form Handling**: React Hook Form with Zod validation

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express API integration
- **Hot Reload**: Automatic browser refresh for rapid development
- **Database**: Local PostgreSQL or cloud database connection
- **Environment Variables**: DATABASE_URL for database connection

### Production Build
- **Frontend**: Vite build outputs static files to `dist/public`
- **Backend**: ESBuild bundles Express server to `dist/index.js`
- **Static Serving**: Express serves built frontend files in production
- **Database**: Production PostgreSQL database with connection pooling

### Architectural Decisions

#### Why Drizzle ORM?
- **Problem**: Need type-safe database queries with good TypeScript integration
- **Solution**: Drizzle provides excellent TypeScript support and is lightweight
- **Alternatives**: Prisma (heavier), raw SQL (less type safety)
- **Pros**: Fast, type-safe, minimal runtime overhead
- **Cons**: Smaller ecosystem compared to Prisma

#### Why Express + Vite Integration?
- **Problem**: Need both API server and frontend development server
- **Solution**: Express integration with Vite middleware in development
- **Alternatives**: Separate servers (more complex), Next.js (different paradigm)
- **Pros**: Simple setup, shared TypeScript config, unified development
- **Cons**: Slightly more complex than purely client-side applications

#### Why localStorage for Settings?
- **Problem**: Need immediate settings persistence without server round-trips
- **Solution**: Browser localStorage with server backup
- **Alternatives**: Server-only storage (slower), no persistence (poor UX)
- **Pros**: Instant settings application, works offline
- **Cons**: Device-specific, limited storage space

#### Why Wouter for Routing?
- **Problem**: Need client-side routing without React Router complexity
- **Solution**: Wouter provides minimal, hook-based routing
- **Alternatives**: React Router (heavier), reach/router (deprecated)
- **Pros**: Lightweight, simple API, good TypeScript support
- **Cons**: Less ecosystem support than React Router

## Recent Changes

### January 18, 2025 - Game Enhancements
- **Letter Rain Game**: Added progressive difficulty system starting slowly and increasing speed every 5 correct inputs after reaching 20 correct inputs. Game now lasts 1 minute or until 100 letters fall. Added real-time stats display showing timer, correct inputs, fallen letters, and current speed.
- **Letter Memory Game**: Implemented 20-level progression system with difficulty increasing every 5 correct sequences. Sequence length starts at 3 characters and increases with levels. Added completion screen with options to return to main menu or restart.
- **Key Barrier Game**: Enhanced with letter and number blocks displayed with labels. Added ball accumulation system when balls can't pass through closed barriers. Improved visual feedback with different colors for letters vs numbers.
- **Drag & Drop Game**: Expanded from 6 to 15 items (5 per color category) with diverse icons. Added time-based bonus system: +100 points for completion under 30 seconds, +50 points for under 60 seconds. Added real-time timer during gameplay.
- **Technical Fixes**: Resolved TypeScript errors in storage layer and fixed CSS import order issues.