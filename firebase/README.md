# Firebase Setup Guide

## 1. Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** and follow the prompts
3. Disable Google Analytics if you don't need it (optional)

## 2. Enable Firestore

1. In the Firebase console, go to **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** for development (you'll add security rules later)
4. Select a region close to your users

## 3. Enable Firebase Storage

1. Go to **Build → Storage**
2. Click **Get started**
3. Accept the default security rules for now

## 4. Enable Authentication

1. Go to **Build → Authentication**
2. Click **Get started**
3. Enable **Email/Password** provider (for admin login)

## 5. Get Client Config (for .env.local)

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll to **Your apps** → click the web icon (`</>`)
3. Register the app and copy the `firebaseConfig` object values into `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## 6. Get Admin SDK Credentials (for .env.local)

1. Go to **Project Settings → Service accounts**
2. Click **Generate new private key**
3. Download the JSON file — copy the values into `.env.local`:

```
FIREBASE_PROJECT_ID=          # same as project_id in the JSON
FIREBASE_CLIENT_EMAIL=        # client_email in the JSON
FIREBASE_PRIVATE_KEY=         # private_key in the JSON (keep the quotes and \n characters)
```

## 7. Firestore Data Structure

Collections used by this app:

```
services/                    ← service documents
  {serviceId}/
    name, category, price, duration, stylist_name, image_url, is_active, created_at, updated_at

gallery_images/              ← gallery image documents
  {imageId}/
    title, description, image_url, thumbnail_url, tags[], category, is_featured, created_at

message_threads/             ← conversation threads
  {threadId}/
    client_email, client_name, client_phone, status, last_message_at, created_at
    messages/                ← subcollection
      {messageId}/
        thread_id, sender_type, sender_name, content, attachments[], read_at, created_at
```

## 8. Firestore Security Rules (production)

Deploy these rules from the Firebase console under **Firestore → Rules**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Services - public read, admin write
    match /services/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Gallery - public read, admin write
    match /gallery_images/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Message threads - authenticated or anonymous with email
    match /message_threads/{threadId} {
      allow read, write: if request.auth != null
        || request.resource.data.client_email is string;

      match /messages/{messageId} {
        allow read, write: if request.auth != null
          || get(/databases/$(database)/documents/message_threads/$(threadId)).data.client_email is string;
      }
    }
  }
}
```

## 9. Storage Security Rules (production)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /gallery/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /messages/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
