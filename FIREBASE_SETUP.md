# Firebase setup for Forum Feature

Environment variables (.env.local and deployment):

Client (public):
- NEXT_PUBLIC_FIREBASE_API_KEY=
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
- NEXT_PUBLIC_FIREBASE_PROJECT_ID=
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
- NEXT_PUBLIC_FIREBASE_APP_ID=
- NEXT_PUBLIC_BASE_URL= http://localhost:3000 (dev) or your site URL

Server (admin):
- FIREBASE_PROJECT_ID=
- FIREBASE_CLIENT_EMAIL=
- FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

Firestore Collections:
- threads: { heading, description, tags[], mediaUrl?, authorId, authorName, createdAt }
- replies: { threadId, content, mediaUrl?, authorId, authorName, createdAt, parentId? }

See `firebase.firestore.rules` and `firebase.storage.rules` for recommended security rules.





