**Updated workflows and diagram mapping: see STRUCTURE_AND_FLOW.md.**

# StaffSync — Project explanation

## Objective
Digitize basic HR work in a small organization. Keep the implementation understandable enough for a college student to explain and extend.

## Architecture and request flow
React form → fetch request with JWT → Express authentication → role/ownership validation → Mongoose model → MongoDB → JSON response → React state update.

1. Login checks a bcrypt password hash and returns an eight-hour JWT.
2. The browser stores the token in sessionStorage and adds it as `Authorization: Bearer <token>`.
3. The API verifies the signature and reads the current active user from MongoDB on each request.
4. API checks control access even if someone bypasses the frontend.
5. Mongoose stores and queries data. React reloads lists after successful changes.

## Database collections

| Collection | Main fields | Relationship |
| --- | --- | --- |
| users | name, email, password hash, role, department, phone, active | manager references another user |
| attendances | user, date, checkIn, checkOut | user references users; user/date unique |
| leaves | user, from, to, reason, status, reviewedBy | applicant and reviewer reference users |
| announcements | title, body, author | author references users |
| trainings | title, date, description, manager | manager references users |

Leave status starts Pending and changes once to Approved or Rejected. Overlapping Pending/Approved leave is rejected on submission. This simple check is not a transaction and is not designed for simultaneous high-volume submissions. HR has global visibility; managers have direct-report visibility; employees see their own records.

## REST API reference
All routes except login and health require a Bearer JWT. API base: `http://localhost:5000/api`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | /health | Health check |
| POST | /auth/login | Login: email, password |
| GET | /me | Current user |
| PATCH | /me | Update name, phone |
| GET | /users | HR all / manager direct reports |
| POST | /users | HR creates name, email, password, role, department, manager |
| PATCH | /users/:id | HR updates name, department, manager, active |
| GET | /attendance | Scoped attendance history |
| POST | /attendance/check-in | Mark today's check-in |
| POST | /attendance/check-out | Mark today's check-out |
| GET | /leaves | Scoped requests |
| POST | /leaves | Apply: from, to, reason |
| PATCH | /leaves/:id | Review: status Approved/Rejected |
| GET | /announcements | Company updates |
| POST | /announcements | HR/Manager posts title, body |
| DELETE | /announcements/:id | HR deletes any; Manager deletes own |
| GET | /trainings | Scoped training sessions |
| POST | /trainings | Manager schedules title, date, description, assignees |
| DELETE | /trainings/:id | Manager deletes own session |

Example login body:
```json
{"email":"employee@staffsync.com","password":"Demo@123"}
```
Example leave body (replace with your demo dates):
```json
{"from":"2026-11-10","to":"2026-11-11","reason":"Family function"}
```

## Six development stages

1. Setup: create client/server folders, dependencies, environment variables.
2. Database: define schemas, references, unique attendance index.
3. Authentication: seed accounts, hash passwords, verify JWT, check roles.
4. Backend: employee, attendance, leave, announcement, training APIs.
5. Frontend: login, dashboard, sidebar, forms, tables, feedback messages.
6. Execution: seed MongoDB, start both apps, test the three roles, build frontend.

## Manual acceptance checks (requires MongoDB)

- Each demo user can sign in; incorrect credentials fail.
- One attendance record per user per IST day; checkout before check-in fails.
- Employee can create leave but cannot approve it, create employees, or post announcements.
- Manager can review a direct report's leave but cannot review their own or another team's leave.
- HR can review another user's pending leave. Repeat review fails.
- HR can create an employee with an assigned manager; that manager sees the employee.
- Assigned manager training is visible to selected direct reports and HR, but not unassigned employees.
- Updating own profile cannot change email, role, or manager.
- Deactivating another user blocks that user's next API request, including existing sessions.
- UI shows an empty state, API failure message, and usable layout on a narrow screen.

## Viva questions

**Why MERN?** One main language, JavaScript, across the frontend and backend, with MongoDB storing documents.

**React state?** Values that change over time, such as form inputs, current page, and fetched records. Updating state rerenders the UI.

**Why JWT?** A signed login token lets the backend verify who is requesting protected data. It does not replace permission checks and does not encrypt its payload.

**Authentication vs authorization?** Authentication identifies the user; authorization decides which actions and records they can access.

**Why bcrypt?** Passwords are stored as salted hashes rather than plain text.

**Why unique index for attendance?** MongoDB prevents two records for the same user and date, including simultaneous requests.

**Why manager references?** A user stores a manager's ObjectId. Mongoose populate can fetch the manager's name for display.

**Why no public registration?** HR creates organization accounts and assigns roles, preventing users from registering themselves as HR.

**How to extend this later?** Add leave balances, payroll, password reset, tests using a real test database, pagination, and audit logs after understanding the existing flows.
