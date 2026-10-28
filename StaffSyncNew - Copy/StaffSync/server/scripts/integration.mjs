// Uses a newly named temporary database and removes only that database afterward.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/app.js";
import { User, Attendance } from "../src/models/index.js";
process.env.JWT_SECRET = "integration-only-secret-at-least-32-characters";
let checks = 0;
const equal = (actual, expected) => {
  assert.equal(actual, expected);
  checks++;
};
const dbName = "staffsync_validation_" + Date.now();
try {
  await mongoose.connect(
    process.env.MONGO_TEST_URI || "mongodb://127.0.0.1:27017",
    { dbName },
  );
  await Attendance.init();
  const password = await bcrypt.hash("Demo@123", 10);
  const hr = await User.create({
    name: "HR",
    email: "hr@test.com",
    password,
    role: "HR",
  });
  const manager = await User.create({
    name: "Manager",
    email: "manager@test.com",
    password,
    role: "Manager",
  });
  const other = await User.create({
    name: "Other manager",
    email: "other@test.com",
    password,
    role: "Manager",
  });
  const employee = await User.create({
    name: "Employee",
    email: "employee@test.com",
    password,
    role: "Employee",
    manager: manager._id,
  });
  const outsider = await User.create({
    name: "Outsider",
    email: "outsider@test.com",
    password,
    role: "Employee",
    manager: other._id,
  });
  const tokens = {};
  for (const u of [hr, manager, other, employee, outsider]) {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: u.email, password: "Demo@123" });
    equal(res.status, 200);
    assert(!res.body.user.password);
    tokens[u.email] = res.body.token;
  }
  const call = (user, method, path, body) =>
    request(app)
      [method]("/api" + path)
      .set("Authorization", "Bearer " + tokens[user.email])
      .send(body);
  equal(
    (
      await request(app)
        .post("/api/auth/login")
        .send({ email: hr.email, password: "wrong" })
    ).status,
    401,
  );
  equal((await call(employee, "post", "/users", {})).status, 403);
  const created = await call(hr, "post", "/users", {
    name: "New employee",
    email: "new@test.com",
    password: "Demo@123",
    role: "Employee",
    department: "IT",
    manager: String(manager._id),
  });
  equal(created.status, 201);
  equal(
    (
      await call(hr, "patch", "/users/" + created.body._id, {
        name: "Updated employee",
        department: "HR",
        active: true,
        manager: String(manager._id),
      })
    ).status,
    200,
  );
  equal((await call(manager, "get", "/users")).body.length, 2);
  equal((await call(employee, "post", "/attendance/check-out")).status, 400);
  equal((await call(employee, "post", "/attendance/check-in")).status, 201);
  equal((await call(employee, "post", "/attendance/check-in")).status, 409);
  equal((await call(employee, "post", "/attendance/check-out")).status, 200);
  equal((await call(employee, "post", "/attendance/check-out")).status, 400);
  equal((await call(other, "get", "/attendance")).body.length, 0);
  const leave = await call(employee, "post", "/leaves", {
    from: "2026-11-10",
    to: "2026-11-11",
    reason: "Family event",
  });
  equal(leave.status, 201);
  equal(
    (
      await call(employee, "post", "/leaves", {
        from: "2026-11-11",
        to: "2026-11-12",
        reason: "Overlap",
      })
    ).status,
    400,
  );
  equal(
    (
      await call(other, "patch", "/leaves/" + leave.body._id, {
        status: "Approved",
      })
    ).status,
    404,
  );
  equal(
    (
      await call(manager, "patch", "/leaves/" + leave.body._id, {
        status: "Approved",
      })
    ).status,
    200,
  );
  equal(
    (
      await call(hr, "patch", "/leaves/" + leave.body._id, {
        status: "Rejected",
      })
    ).status,
    404,
  );
  equal((await call(employee, "get", "/leaves")).body[0].status, "Approved");
  const announcement = await call(manager, "post", "/announcements", {
    title: "Team update",
    body: "Meeting at 10.",
  });
  equal(announcement.status, 201);
  equal(
    (await call(other, "delete", "/announcements/" + announcement.body._id))
      .status,
    404,
  );
  equal((await call(employee, "get", "/announcements")).body.length, 1);
  equal(
    (await call(hr, "delete", "/announcements/" + announcement.body._id))
      .status,
    200,
  );
  equal(
    (
      await call(manager, "post", "/trainings", {
        title: "Invalid assignment",
        date: "2026-11-12",
        description: "Test",
        assignees: [String(outsider._id)],
      })
    ).status,
    400,
  );
  const training = await call(manager, "post", "/trainings", {
    title: "React basics",
    date: "2026-11-12",
    description: "Hooks",
    assignees: [String(employee._id)],
  });
  equal(training.status, 201);
  equal((await call(outsider, "get", "/trainings")).body.length, 0);
  equal((await call(employee, "get", "/trainings")).body.length, 1);
  equal(
    (
      await call(
        outsider,
        "patch",
        "/trainings/" + training.body._id + "/progress",
        { status: "Completed" },
      )
    ).status,
    404,
  );
  equal(
    (
      await call(
        employee,
        "patch",
        "/trainings/" + training.body._id + "/progress",
        { status: "Completed" },
      )
    ).status,
    200,
  );
  equal(
    (await call(manager, "get", "/trainings")).body[0].assignments[0].status,
    "Completed",
  );
  equal(
    (
      await call(employee, "patch", "/employee-profile", {
        address: "Indore",
        designation: "Developer",
      })
    ).status,
    200,
  );
  equal(
    (
      await call(employee, "post", "/employee-profile/document", {
        name: "profile.pdf",
        type: "application/pdf",
        data: Buffer.from("%PDF-1.4\nExample").toString("base64"),
      })
    ).status,
    200,
  );
  equal(
    (
      await call(
        other,
        "get",
        "/employee-profile/" + employee._id + "/document",
      )
    ).status,
    403,
  );
  equal(
    (await call(hr, "get", "/employee-profile/" + employee._id + "/document"))
      .body.name,
    "profile.pdf",
  );
  equal(
    (
      await call(employee, "post", "/employee-profile/document", {
        name: "fake.pdf",
        type: "application/pdf",
        data: Buffer.from("not a pdf").toString("base64"),
      })
    ).status,
    400,
  );
  equal((await call(manager, "get", "/reports")).status, 403);
  const reports = await call(
    hr,
    "get",
    "/reports?from=2026-11-10&to=2026-11-11",
  );
  equal(reports.status, 200);
  equal(reports.body.leaves.length, 1);
  equal((await call(hr, "get", "/reports?from=invalid")).status, 400);
  assert((await call(employee, "get", "/notifications")).body.length >= 2);
  checks++;
  equal((await call(employee, "patch", "/notifications/read")).status, 200);
  assert(
    (await call(employee, "get", "/notifications")).body.every((n) => n.read),
  );
  checks++;
  equal((await call(hr, "delete", "/users/" + hr._id)).status, 400);
  equal((await call(hr, "delete", "/users/" + manager._id)).status, 400);
  equal((await call(hr, "delete", "/users/" + employee._id)).status, 200);
  equal((await call(employee, "get", "/me")).status, 401);
  equal((await call(hr, "get", "/reports")).body.attendance.length, 1);
  console.log(
    `PASS: ${checks} database-backed checks (auth, roles, employee CRUD, attendance, leave, announcements, training, uploads, notifications, reports).`,
  );
} finally {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
}
