# Lustre Lane — Mobile App

React Native (Expo) app that shares the same Firebase backend and Next.js API as the website.

## Setup

1. Copy the env file and fill in your values:
   ```
   cp .env.example .env
   ```
   - `EXPO_PUBLIC_API_URL` — your deployed Vercel URL (e.g. `https://lustre-lane.vercel.app`)
   - Firebase config — same values as the website's `NEXT_PUBLIC_FIREBASE_*` vars

2. Install dependencies:
   ```
   cd mobile
   npm install
   ```

3. Start the dev server:
   ```
   npm start
   ```
   Then press `i` for iOS simulator or `a` for Android emulator.

## Structure

```
mobile/
├── app/                  # Expo Router screens
│   ├── (tabs)/           # Bottom tab screens (Home, Services, Gallery, Chat)
│   └── chat/[threadId]   # Individual conversation screen
├── components/           # Shared UI components
├── constants/            # Colors, API endpoints
├── context/              # Auth context
├── lib/                  # Firebase init, auth helpers
└── types/                # Shared TypeScript types
```

## How it connects to the website

All data comes from the same Next.js API routes. The mobile app calls:
- `GET /api/services` — services list
- `GET /api/gallery` — gallery images  
- `GET /api/messages/:threadId` — conversation thread
- `POST /api/messages` — start new conversation
- `GET /api/auth/my-thread` — fetch signed-in user's threads

No backend changes needed.
