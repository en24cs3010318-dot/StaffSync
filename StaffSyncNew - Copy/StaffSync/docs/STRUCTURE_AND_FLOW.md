# StaffSync structure, roles, and flow

## Mapping to the supplied diagrams

1. **Architecture:** users enter a React role dashboard; React calls REST endpoints; JWT and role middleware protect controllers; Mongoose models store documents in MongoDB. Authenticated file upload/download and persistent in-app notifications are included.
2. **ER reference:** Employee, Manager, LeaveRequest, Attendance, and Announcement are represented. The reference drawing has ambiguous attributes (Attendance appears under LeaveRequest). In the implementation, attendance is its own collection with a user reference, date, check-in and check-out. Leave has from/to/reason/status. This avoids combining unrelated records.
3. **Activity:** Login → verified role → HR/Manager/Employee Dashboard → permitted operations → refreshed result. The user signs out to end their session.
4. **MVC:** React is the view. Express routes call named controllers; controllers use MongoDB models. In MERN, React views live in the client, not in backend template files. “MODAL” in the reference is interpreted as “MODEL”.

Open **diagrams.html** in your browser to view the four implementation diagrams. Original images are retained in reference-diagrams.

## Backend organization

`routes/index.js` registers paths, authentication, and role guards. `controllers/*.controller.js` implements handlers such as createEmployee, reviewLeave, createTraining, and getReports. `models/index.js` defines schemas and references. `middleware/auth.js` verifies the token and active account. `utils/helpers.js` implements record scope, date validation and notification delivery.

Users store login credentials, name, role, department, phone, reporting manager, active and deleted flags. Employee profiles reference one User and store address, designation and a private document. This separates login/role data from additional personal data without making the college project too complicated. Names are a single display-name field instead of separate first/last fields; MongoDB ObjectIds provide employee and manager IDs. A manager is a User with role Manager, avoiding duplicated login tables.

Other collections: Attendance, Leave, Announcement, Training, Notification. Training embeds assignment subdocuments with user references and Assigned / In Progress / Completed status. Mongoose populate supplies names for display.

## Workflows

### Login and dashboard

The login form submits email/password. The server compares the bcrypt hash, signs an eight-hour JWT and returns public user details. Each protected request verifies the JWT and reloads the active, non-removed user. React shows a role-labelled dashboard, scoped counts, and role-specific quick actions. The common visual shell is reused across roles; Reports is visible only to HR and Employees only to HR/managers.

### Employee records

HR adds an account with role and reporting manager, views the directory, edits name/department/manager/status, and can remove a record. Removal is a soft delete: deactivate login, hide from directory, retain historical records and references. Self-removal is blocked. A manager with active direct reports must have those reports reassigned before removal. Email remains reserved after removal. Roles/email are fixed after creation in this simple project.

### Leave

Users apply with from/to dates and reason. Requests start Pending. HR receives a notification; the reporting manager also receives one if present. Managers review only direct reports, and HR reviews others across the organization. Self-approval is forbidden. Atomic status updates prevent two reviewers from overwriting a reviewed request. Applicant receives an Approved/Rejected notification. Overlapping non-rejected requests are prevented with a simple pre-insert check; this overlap check is not transactional under simultaneous submissions.

### Attendance and reports

Each user checks in once per India Standard Time day and checks out once. A MongoDB unique compound index enforces one record per user/day. Employees see self; managers see self/direct reports; HR sees everyone. HR Reports filters attendance dates, leave date overlaps, and displays employee information. CSV exports include worked hours for completed attendance. These are attendance/leave/employee reports for administrative review, not salary calculations, absence inference or automated performance evaluation. No holiday calendar is included.

### Training

A manager creates a title/date/description and selects active employee direct reports. The server validates each assignee belongs to that manager. Employees see only assigned programs from their current manager, and only their own progress. They can update Assigned/In Progress/Completed. Managers monitor all assignments in their own programs; HR can review all programs. Manager receives progress notifications. HR reassigning an employee to a new manager hides programs from their previous manager; historical assignments remain in that original manager's history. Programs are monitored through reported progress, not exams or certification.

### Announcements

HR and managers publish organization-wide updates; all active users receive notifications. HR can delete any announcement; managers can delete only their own. Users review the announcement list and dashboard summaries.

### Personal profile and documents

Users update name/phone, address/designation and upload one PDF/PNG/JPEG profile document up to 1 MB. The server checks type, size and signature. Only the owner and HR can download through an authenticated endpoint. HR uses the Document button in the directory. A replacement overwrites the previous file. Files are stored in MongoDB, with no public static URLs. Antivirus scanning and document history are not included.

### Notifications and updates

Persistent per-user notifications cover new leave requests, leave decisions, announcements, training assignment and training progress. Users can mark all read. React checks notifications and shared lists every 15 seconds while signed in. This is near-real-time polling, not WebSockets or email. Notification delivery is best effort and logs failures without rolling back the primary HR action. Latest 100 notifications and 500 attendance list entries are shown; reports query all matching records for this small college demo.

## Additional endpoints

All require Bearer JWT:

| Method | Endpoint | Permission |
| --- | --- | --- |
| DELETE | /api/users/:id | HR; soft remove |
| GET/PATCH | /api/employee-profile | Own optional profile |
| POST | /api/employee-profile/document | Own document: name, type, base64 data |
| GET | /api/employee-profile/:id/document | Owner or HR |
| PATCH | /api/trainings/:id/progress | Assigned employee: status |
| GET | /api/notifications | Own notifications |
| PATCH | /api/notifications/read | Mark own notifications read |
| GET | /api/reports?from=YYYY-MM-DD&to=YYYY-MM-DD | HR only |

POST /api/trainings now requires `assignees`, an array of employee user IDs. POST /api/announcements accepts HR and Manager. Previous core endpoints remain available.

## Suggested college presentation flow

1. Employee login → mark attendance → apply for leave → update profile.
2. Manager login → review leave → post announcement → create and assign training.
3. Employee login → see notification → update training progress.
4. Manager login → inspect completion status.
5. HR login → create/edit/remove employee → inspect document → filter and export reports.
6. Explain JWT, middleware, MVC folders, model references, polling, and soft delete.
