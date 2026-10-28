import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../src/app.js";
import { User, Leave } from "../src/models.js";
process.env.JWT_SECRET = "test-secret-only-with-at-least-32-characters";
const id = "507f1f77bcf86cd799439011";
const token = () =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
// These tests isolate authorization and input validation; no database is used.
test("health endpoint is public", async () => {
  assert.equal((await request(app).get("/api/health")).status, 200);
});
test("protected API rejects missing and invalid JWT", async () => {
  assert.equal((await request(app).get("/api/users")).status, 401);
  assert.equal(
    (
      await request(app)
        .get("/api/users")
        .set("Authorization", "Bearer invalid")
    ).status,
    401,
  );
});
test("role and validation guards", { concurrency: false }, async () => {
  const original = User.findOne;
  User.findOne = async () => ({ _id: id, role: "Employee", active: true });
  try {
    for (const [method, path, body] of [
      ["post", "/api/users", {}],
      ["post", "/api/announcements", {}],
      ["post", "/api/trainings", {}],
      ["patch", "/api/leaves/" + id, { status: "Approved" }],
    ]) {
      assert.equal(
        (
          await request(app)
            [method](path)
            .set("Authorization", "Bearer " + token())
            .send(body)
        ).status,
        403,
        path,
      );
    }
    assert.equal(
      (
        await request(app)
          .post("/api/leaves")
          .set("Authorization", "Bearer " + token())
          .send({
            from: "2026-02-30",
            to: "2026-03-02",
            reason: "Invalid date",
          })
      ).status,
      400,
    );
    assert.equal(
      (
        await request(app)
          .post("/api/leaves")
          .set("Authorization", "Bearer " + token())
          .send({ from: "2026-11-12", to: "2026-11-10", reason: "Reversed" })
      ).status,
      400,
    );
  } finally {
    User.findOne = original;
  }
});
test("inactive user rejected even with signed JWT", async () => {
  const original = User.findOne;
  User.findOne = async () => null;
  try {
    assert.equal(
      (
        await request(app)
          .get("/api/me")
          .set("Authorization", "Bearer " + token())
      ).status,
      401,
    );
  } finally {
    User.findOne = original;
  }
});
test("HR cannot approve own leave", async () => {
  const oldUser = User.findOne,
    oldLeave = Leave.findOne;
  User.findOne = async () => ({ _id: id, role: "HR", active: true });
  Leave.findOne = async () => ({ user: id });
  try {
    assert.equal(
      (
        await request(app)
          .patch("/api/leaves/" + id)
          .set("Authorization", "Bearer " + token())
          .send({ status: "Approved" })
      ).status,
      403,
    );
  } finally {
    User.findOne = oldUser;
    Leave.findOne = oldLeave;
  }
});

test("new role guards and request validation", async () => {
  const original = User.findOne;
  User.findOne = async () => ({ _id: id, role: "Employee", active: true });
  try {
    for (const [method, path] of [
      ["get", "/api/reports"],
      ["delete", "/api/users/" + id],
      ["post", "/api/trainings"],
      ["post", "/api/announcements"],
    ]) {
      assert.equal(
        (
          await request(app)
            [method](path)
            .set("Authorization", "Bearer " + token())
            .send({})
        ).status,
        403,
        path,
      );
    }
    assert.equal(
      (
        await request(app)
          .get("/api/employee-profile/507f1f77bcf86cd799439012/document")
          .set("Authorization", "Bearer " + token())
      ).status,
      403,
    );
    assert.equal(
      (
        await request(app)
          .post("/api/employee-profile/document")
          .set("Authorization", "Bearer " + token())
          .send({
            name: "bad.pdf",
            type: "application/pdf",
            data: Buffer.from("not a pdf").toString("base64"),
          })
      ).status,
      400,
    );
    assert.equal(
      (
        await request(app)
          .patch("/api/trainings/" + id + "/progress")
          .set("Authorization", "Bearer " + token())
          .send({ status: "Invalid" })
      ).status,
      400,
    );
  } finally {
    User.findOne = original;
  }
});
test("manager validates assignments before database access", async () => {
  const original = User.findOne;
  User.findOne = async () => ({ _id: id, role: "Manager", active: true });
  try {
    assert.equal(
      (
        await request(app)
          .post("/api/trainings")
          .set("Authorization", "Bearer " + token())
          .send({
            title: "Intro",
            date: "2026-11-10",
            description: "Basics",
            assignees: [],
          })
      ).status,
      400,
    );
  } finally {
    User.findOne = original;
  }
});
test("HR cannot remove self and reports reject invalid date ranges", async () => {
  const original = User.findOne;
  User.findOne = async () => ({ _id: id, role: "HR", active: true });
  try {
    assert.equal(
      (
        await request(app)
          .delete("/api/users/" + id)
          .set("Authorization", "Bearer " + token())
      ).status,
      400,
    );
    assert.equal(
      (
        await request(app)
          .get("/api/reports?from=2026-11-20&to=2026-11-10")
          .set("Authorization", "Bearer " + token())
      ).status,
      400,
    );
    assert.equal(
      (
        await request(app)
          .get("/api/reports?from=2026-02-30")
          .set("Authorization", "Bearer " + token())
      ).status,
      400,
    );
  } finally {
    User.findOne = original;
  }
});
