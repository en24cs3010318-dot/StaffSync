import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
import { fail, text, publicUser } from "../utils/helpers.js";
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!text(email) || !text(password, 100))
    fail("Enter your email and password.");
  const user = await User.findOne({
    email: email.trim().toLowerCase(),
    active: true,
  }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password)))
    fail("Invalid email or password.", 401);
  res.json({
    token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    }),
    user: publicUser(user),
  });
};
export const getMe = (req, res) => res.json(req.user);
export const updateMe = async (req, res) => {
  if (
    !text(req.body.name) ||
    typeof req.body.phone !== "string" ||
    req.body.phone.length > 20
  )
    fail("Provide a name and valid phone number.");
  req.user.name = req.body.name.trim();
  req.user.phone = req.body.phone.trim();
  await req.user.save();
  res.json(req.user);
};
