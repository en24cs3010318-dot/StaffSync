# Update your existing D:\staffsync project

1. Stop both running terminals with Ctrl+C. Keep your existing folder as a backup.
2. Extract this new ZIP into a separate folder, for example D:\staffsync-updated. Open its inner staffsync folder in VS Code (the one containing client, server and package.json).
3. Copy your old server/.env into the new server folder and your old client/.env into the new client folder. The ZIP deliberately excludes private .env files. If missing, copy the corresponding .env.example and edit it.
4. Keep the same MONGO_URI to retain your users, attendance, leave, announcements, and old training. **Do not delete or drop your MongoDB database.**
5. From the new root folder run `npm run install:all`.
6. MongoDB must be running. You do not need to seed again if the accounts already exist. Running `npm run seed` creates only missing demo accounts and does not reset passwords.
7. First terminal: `npm run server`. Second terminal, same root folder: `npm run client`.
8. Open http://localhost:5173 and refresh the browser. If an old session behaves unexpectedly, sign out and sign back in.
9. Log in as Manager and create a new training program with selected employees. Older training programs did not contain assignment records, so they remain visible to their manager and HR, but employees will not see them until you create a new assigned program. No automatic assignment is made.
10. New optional employee profile fields and notifications are created as users use those features. No destructive migration is required.

## Commands if you open subfolders directly

- Terminal in server: `npm run dev`
- Terminal in client: `npm run dev`
- Terminal in project root: `npm run server` and `npm run client` in separate terminals

Your current demo password remains Demo@123 unless the account was changed separately. Ports remain backend 5000 and frontend 5173.
