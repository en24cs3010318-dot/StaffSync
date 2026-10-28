import { Router } from "express";
import { authenticate, allow } from "../middleware/auth.js";
import { route } from "../utils/helpers.js";
import * as auth from "../controllers/auth.controller.js";
import * as employees from "../controllers/employees.controller.js";
import * as attendance from "../controllers/attendance.controller.js";
import * as leaves from "../controllers/leaves.controller.js";
import * as announcements from "../controllers/announcements.controller.js";
import * as trainings from "../controllers/trainings.controller.js";
import * as notifications from "../controllers/notifications.controller.js";
import * as reports from "../controllers/reports.controller.js";
export const router = Router();
router.get("/api/health", (req, res) =>
  res.json({ message: "StaffSync API running" }),
);
router.post("/api/auth/login", route(auth.login));
router.use("/api", authenticate);
router.get("/api/me", route(auth.getMe));
router.patch("/api/me", route(auth.updateMe));
router.get(
  "/api/users",
  allow("HR", "Manager"),
  route(employees.listEmployees),
);
router.post("/api/users", allow("HR"), route(employees.createEmployee));
router.patch("/api/users/:id", allow("HR"), route(employees.updateEmployee));
router.get("/api/attendance", route(attendance.listAttendance));
router.post("/api/attendance/check-in", route(attendance.checkIn));
router.post("/api/attendance/check-out", route(attendance.checkOut));
router.get("/api/leaves", route(leaves.listLeaves));
router.post("/api/leaves", route(leaves.applyLeave));
router.patch(
  "/api/leaves/:id",
  allow("HR", "Manager"),
  route(leaves.reviewLeave),
);
router.get("/api/announcements", route(announcements.listAnnouncements));
router.post(
  "/api/announcements",
  allow("HR", "Manager"),
  route(announcements.createAnnouncement),
);
router.delete(
  "/api/announcements/:id",
  allow("HR", "Manager"),
  route(announcements.deleteAnnouncement),
);
router.get("/api/trainings", route(trainings.listTrainings));
router.post(
  "/api/trainings",
  allow("Manager"),
  route(trainings.createTraining),
);
router.patch(
  "/api/trainings/:id/progress",
  allow("Employee"),
  route(trainings.updateProgress),
);
router.delete(
  "/api/trainings/:id",
  allow("Manager"),
  route(trainings.deleteTraining),
);
router.delete("/api/users/:id", allow("HR"), route(employees.removeEmployee));
router.get("/api/employee-profile", route(employees.getEmployeeProfile));
router.patch("/api/employee-profile", route(employees.updateEmployeeProfile));
router.post("/api/employee-profile/document", route(employees.uploadDocument));
router.get(
  "/api/employee-profile/:id/document",
  route(employees.downloadDocument),
);
router.get("/api/notifications", route(notifications.listNotifications));
router.patch(
  "/api/notifications/read",
  route(notifications.markNotificationsRead),
);
router.get("/api/reports", allow("HR"), route(reports.getReports));
