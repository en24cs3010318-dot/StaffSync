# Updated StaffSync project

This version follows your role-based requirements and supplied architecture/MVC/activity/ER references. **Existing users: read docs/UPGRADE.md first.**

# StaffSync — Simple MERN HR Management

A beginner-friendly college project using MongoDB, Express, React, Node.js, Bootstrap, and JWT. The frontend is a real React client connected to the Express API; all application records are stored in MongoDB.

## Features and permissions

| Feature | HR | Manager | Employee |
| --- | --- | --- | --- |
| View dashboard and announcements | Yes | Yes | Yes |
| Create, edit, deactivate, remove employees | Yes | No | No |
| View employee list | Everyone | Direct reports | No |
| Mark own attendance | Yes | Yes | Yes |
| View attendance and leave | Everyone | Self and direct reports | Self |
| Apply for leave | Yes | Yes | Yes |
| Approve/reject pending leave | Other users | Direct reports | No |
| Publish announcements | Yes | Yes | No |
| Delete announcements | Any | Own posts | No |
| Create, assign, monitor training | Review all | Own team | Update own progress |
| View training | All teams | Own team | Assigned programs in current team |
| Edit own profile and upload document | Yes | Yes | Yes |
| HR reports with CSV export | Yes | No | No |
| Notifications inbox | Yes | Yes | Yes |

A user cannot approve their own leave. HR reviews managers' leave; another HR user can review an HR user's leave. The HR account creation form lets you add another HR if needed. Deactivation preserves historical records and blocks further access. Roles and email cannot be changed after account creation in this simple version.

## Requirements

- Node.js 22 or newer LTS with npm
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- VS Code and a browser

## Setup on Windows (PowerShell)

Extract the ZIP. Open the `staffsync` folder in VS Code and open its terminal. Your terminal must be inside the folder containing this README and the root package.json.

```powershell
npm run install:all
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Edit `server/.env`. Set `JWT_SECRET` to a long random string with at least 32 characters. Ensure MongoDB is running. The default database is `mongodb://127.0.0.1:27017/staffsync`. For Atlas, replace MONGO_URI with your own connection string and configure database credentials and network access.

```powershell
npm run seed
npm run server
```

Keep this terminal running. Open a **second terminal** in the same `staffsync` folder:

```powershell
npm run client
```

Open **http://localhost:5173**. API: **http://localhost:5000/api**. On macOS/Linux, use `cp server/.env.example server/.env` and `cp client/.env.example client/.env` instead of Copy-Item.

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| HR | hr@staffsync.com | Demo@123 |
| Manager | manager@staffsync.com | Demo@123 |
| Employee | employee@staffsync.com | Demo@123 |

Seed only creates missing accounts and a welcome announcement; it does not wipe your database or reset existing passwords. The demo employee reports to the demo manager. Do not use demo credentials for a public deployment.

## Project structure

- `client/src/App.jsx`: login, shared state, sidebar, role-based navigation, 15-second refresh
- `client/src/pages/`: Dashboard, Employees, Attendance, Leaves, Announcements, Training, Reports, MyProfile, EmployeeProfile
- `client/src/components/UI.jsx`: reusable inputs and panels
- `client/src/utils/files.js`: authenticated downloads and safe CSV export
- `server/src/models/index.js`: MongoDB schemas
- `server/src/controllers/`: named request handlers grouped by feature
- `server/src/routes/index.js`: endpoint and permission registration
- `server/src/middleware/auth.js`: JWT verification and role guard
- `server/src/utils/helpers.js`: scope, dates, notifications, validation helpers
- `server/src/app.js`: Express configuration and errors
- `server/src/index.js`: MongoDB connection and API startup
- `server/src/seed.js`: non-destructive demo accounts
- `server/scripts/integration.mjs`: database-backed workflow checks
- `docs/STRUCTURE_AND_FLOW.md`: detailed flow, permission matrix, diagram mapping
- `docs/diagrams.html`: browser-viewable implementation diagrams
- `docs/reference-diagrams/`: the four diagrams you supplied
- `docs/UPGRADE.md`: update your existing local project without deleting data

## Build and checks

```powershell
npm run build
npm test --prefix server
npm run test:render
```

The frontend production bundle is created in `client/dist`. `npm run preview --prefix client` previews it locally; the API must still be running. The API tests mock database access and do not need MongoDB. For database-backed checks with MongoDB running, use `npm run test:integration --prefix server`. This uses a uniquely named validation database and removes only that temporary database afterward; it does not modify staffsync. Set MONGO_TEST_URI if using a remote test MongoDB server.

## College demo

1. Log in as Employee and mark attendance.
2. Apply for leave and update your profile.
3. Sign out, log in as Manager, approve the employee's pending request.
4. Schedule training, selecting the demo employee as an assignee. Sign in as Employee to update its progress and see the updated leave status.
5. Sign in as HR. Add an employee, choose their reporting manager, and post an announcement.
6. Edit or remove an employee. Removal is a soft delete: login is blocked and the employee disappears from the directory while historical records are retained.
7. Open HR Reports, apply dates, and export CSV.
8. Upload a profile document and view the Notifications inbox.

## Troubleshooting

- **Cannot connect to API:** start `npm run server`; check the API URL and port.
- **MongoDB connection refused:** start the local MongoDB service or correct the Atlas URI.
- **Invalid email or password:** run the seed from the root, ensure it uses the same database as the server, and use the accounts above.
- **CORS error:** the client origin must match CLIENT_URL in server/.env. If Vite uses another port, stop the old server or update CLIENT_URL.
- **JWT secret error:** replace JWT_SECRET in server/.env with at least 32 characters.
- **Already exists:** email addresses and each user's daily attendance are unique.
- **No employee training:** HR must assign that employee a reporting manager; the manager must select that employee when creating training.
- Restart the API after changing server/.env. Restart Vite after changing client/.env.

## Scope

This is an educational project, without payroll calculation, leave balances, email/SMS notifications, password reset, advanced analytics, or multi-company support. CSV reports support administrative review. Profile documents are stored in MongoDB, limited to PDF/PNG/JPEG up to 1 MB, with authenticated downloads. File signatures are checked; antivirus scanning is outside this college demo. Attendance follows the Asia/Kolkata day; displayed timestamps follow the browser's timezone. Attendance lists show the latest 500 records. Notifications and shared lists refresh by polling every 15 seconds, rather than WebSockets. Report data refreshes when you apply the filter or reopen Reports. JWT sessions last eight hours and are held in sessionStorage. A public production version needs HTTPS, login rate limits, password management, auditing, pagination, and deployment-specific security configuration.

Demo and GitHub URLs are intentionally not fabricated. Run the app, create your own GitHub repository, and deploy it before entering real links in your college portal. Never commit .env files or node_modules.
