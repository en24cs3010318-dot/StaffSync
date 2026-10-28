import "dotenv/config";
import mongoose from "mongoose";
import { app } from "./app.js";
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
  throw new Error("Set JWT_SECRET to at least 32 characters in server/.env");
try {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/staffsync",
  );
  app.listen(process.env.PORT || 5000, () =>
    console.log(
      "StaffSync API: http://localhost:" + (process.env.PORT || 5000),
    ),
  );
} catch (error) {
  console.error("Could not start API:", error.message);
  process.exit(1);
}
