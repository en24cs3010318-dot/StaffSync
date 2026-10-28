import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
export async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ");
    if (token?.[0] !== "Bearer" || !token[1])
      return res.status(401).json({ message: "Please log in." });
    const data = jwt.verify(token[1], process.env.JWT_SECRET);
    req.user = await User.findOne({
      _id: data.id,
      active: true,
      deleted: { $ne: true },
    });
    if (!req.user)
      return res.status(401).json({ message: "Account unavailable." });
    next();
  } catch {
    res.status(401).json({ message: "Session expired. Please log in again." });
  }
}
export const allow =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user.role)
      ? next()
      : res.status(403).json({ message: "You do not have permission." });
