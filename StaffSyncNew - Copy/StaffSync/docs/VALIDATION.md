# Validation for this updated release

Passed in the development environment:

- React/Vite production build.
- Eight automated API guard/validation tests (Node test runner + Supertest).
- Twenty-four server-render checks covering eight React page components across three roles. This checks rendering without a live browser or network requests, and is not a visual or end-to-end browser test.

The tests cover missing/invalid JWT, active-account enforcement, employee restrictions, self-approval prevention, HR-only reports, self-removal prevention, invalid dates, document access/type validation and empty training assignments.

## Database-backed checks to run locally

A separate integration script is included for real MongoDB workflows. It creates a new uniquely named database, uses it for sample records, and removes only that database afterward. It does not use your staffsync database. The script was not executed successfully here because the temporary MongoDB service could not start in this environment (operation not permitted).

With MongoDB running locally, from the project root:

```powershell
npm run test:integration
```

For a custom test server, set MONGO_TEST_URI first. The test user needs permission to create and drop a temporary database. The script checks login, employee CRUD, team scope, attendance, leave reviews, manager announcements, training assignments/progress, document privacy, notifications and reports.

## Manual walkthrough

1. Use the seeded Employee to check in, check out and request leave.
2. Use Manager to approve leave, publish an announcement and assign a training to that employee.
3. Use Employee to review notification and announcement, update training progress and upload a PDF/PNG/JPEG profile document.
4. Use Manager to inspect progress.
5. Use HR to download the employee document, export a filtered report and add/edit/remove a temporary employee.
6. Verify another manager cannot approve unrelated leave or delete someone else's announcement.
7. Check that removed users cannot log in and historical attendance remains in HR reports.
8. Check desktop and narrow-screen layouts in your browser.
