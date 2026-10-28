import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Announcement } from "./models.js";
try {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/staffsync",
  );
  const password = await bcrypt.hash("Demo@123", 10);
  const accounts = [
    ["HR Admin", "hr@staffsync.com", "HR"],
    ["Team Manager", "manager@staffsync.com", "Manager"],
    ["Demo Employee", "employee@staffsync.com", "Employee"],
  ];
  for (const [name, email, role] of accounts) {
    if (!(await User.exists({ email })))
      await User.create({
        name,
        email,
        role,
        password,
        department: "Information Technology",
      });
  }
  const manager = await User.findOne({ email: "manager@staffsync.com" });
  const employee = await User.findOne({ email: "employee@staffsync.com" });
  if (!employee.manager) {
    employee.manager = manager._id;
    await employee.save();
  }
  if (!(await Announcement.exists({ title: "Welcome to StaffSync" })))
    await Announcement.create({
      title: "Welcome to StaffSync",
      body: "Mark your attendance, request leave, and stay connected with your team.",
      author: (await User.findOne({ email: "hr@staffsync.com" }))._id,
    });
  console.log(
    "Demo accounts ready. Password: Demo@123. Existing passwords were not changed.",
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
