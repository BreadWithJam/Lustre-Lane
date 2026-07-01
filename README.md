# Lustre Lane

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Expo](https://img.shields.io/badge/Expo-51-000?logo=expo)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-green?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Private-red)](LICENSE)

A premium salon platform built as two separate clients — a Next.js website and a React Native mobile app — both backed by the same API and database.

---

## Overview

Lustre Lane lets clients browse services, explore the style gallery, and message the salon team directly. The admin panel provides tools for managing content, responding to messages, and viewing analytics.

The project is split into two apps:

- `/ (root)` — Next.js website, deployed on Vercel
- `mobile/` — Expo (React Native) app for iOS and Android

Both share the same Next.js API routes and Supabase/Firebase backend.

---

## Tech Stack

### Website (Next.js)
- **Framework**: Next.js with App Router and TypeScript
- **Styling**: Tailwind CSS v4 with custom salon theme
- **State**: React Query for server state, Zustand for UI state
- **Auth**: Firebase Authentication
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend
- **Deployment**: Vercel

### Mobile (Expo / React Native)
- **Framework**: Expo with Expo Router (file-based navigation)
- **Language**: TypeScript
- **Auth**: Firebase Authentication (shared with website)
- **API**: Calls the deployed Next.js API routes

---

## Project Structure

```
/
├── src/
│   ├── app/             # Next.js App Router pages and API routes
│   ├── components/      # Reusable React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Config, auth, database utilities
│   ├── stores/          # Zustand state stores
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── mobile/
│   ├── app/             # Expo Router screens
│   │   ├── (tabs)/      # Bottom tab screens (Home, Services, Gallery, Chat)
│   │   └── chat/        # Individual conversation screen
│   ├── components/      # Shared mobile UI components
│   ├── constants/       # Colors, API endpoints
│   ├── context/         # Auth context
│   ├── lib/             # Firebase init, auth helpers
│   └── types/           # Shared TypeScript types
├── supabase/            # Database migrations and config
└── public/              # Static assets
```

---

## Getting Started

### Website

**Prerequisites**: Node.js 18+, Supabase account, Firebase project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Supabase, Firebase, and Resend credentials.

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

### Mobile App

1. Install dependencies:
   ```bash
   cd mobile
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp mobile/.env.example mobile/.env
   ```
   Set `EXPO_PUBLIC_API_URL` to your deployed Vercel URL and add the Firebase config values.

3. Start the Expo dev server:
   ```bash
   npm start
   ```
   Press `i` for iOS simulator or `a` for Android emulator.

---

## Environment Variables

### Website (`.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Email
RESEND_API_KEY=your_resend_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Mobile (`mobile/.env`)

```env
EXPO_PUBLIC_API_URL=https://your-deployment.vercel.app
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

---

## Available Scripts

### Website

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run tests |
| `npm run type-check` | TypeScript type check |

### Mobile

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Open on Android emulator |
| `npm run ios` | Open on iOS simulator |

---

## Features

### Client-facing
- Service browser with category filtering and favorites
- Style gallery with lightbox and infinite scroll
- Real-time messaging with file attachment support
- Push and email notifications

### Admin
- Service and gallery content management
- Message inbox with reply support
- Analytics dashboard

---

## Deployment

### Website — Vercel

```bash
npm i -g vercel
vercel --prod
```

Add all environment variables in the Vercel project dashboard.

### Mobile — Expo EAS

```bash
npm install -g eas-cli
eas build
eas submit
```

---

## License

Private and proprietary.
