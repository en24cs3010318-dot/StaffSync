import express from "express";
import cors from "cors";
import { router } from "./routes/index.js";
export const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));
app.use(router);
app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use((err, req, res, next) => {
  if (err.code === 11000)
    return res
      .status(409)
      .json({ message: "This email or today’s attendance already exists." });
  const status =
    err.status ||
    (["ValidationError", "CastError"].includes(err.name) ? 400 : 500);
  if (status === 500) console.error(err);
  res
    .status(status)
    .json({
      message: status === 500 ? "Server error. Please try again." : err.message,
    });
});
