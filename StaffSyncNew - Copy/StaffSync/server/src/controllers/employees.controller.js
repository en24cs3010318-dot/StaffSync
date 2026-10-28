import bcrypt from "bcryptjs";
import { User, Employee } from "../models/index.js";
import { fail, text, publicUser } from "../utils/helpers.js";
export const listEmployees = async (req, res) => {
  res.json(
    await User.find(
      req.user.role === "HR"
        ? { deleted: { $ne: true } }
        : { manager: req.user._id, deleted: { $ne: true } },
    )
      .populate("manager", "name")
      .sort({ name: 1 }),
  );
};
export const createEmployee = async (req, res) => {
  const { name, email, password, role, department, manager } = req.body;
  if (
    !text(name) ||
    !text(email) ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    !text(password, 72) ||
    password.length < 8 ||
    !["HR", "Manager", "Employee"].includes(role) ||
    typeof department !== "string"
  )
    fail("Provide valid details and a password of 8–72 characters.");
  if (
    manager &&
    !(await User.exists({ _id: manager, role: "Manager", active: true }))
  )
    fail("Select an active manager.");
  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role,
    department,
    manager: manager || null,
  });
  res.status(201).json(publicUser(user));
};
export const updateEmployee = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.deleted) fail("Employee not found.", 404);
  const { name, department, active, manager } = req.body;
  if (
    !text(name) ||
    typeof department !== "string" ||
    typeof active !== "boolean"
  )
    fail("Invalid employee details.");
  if (String(user._id) === String(req.user._id) && !active)
    fail("You cannot deactivate your own account.");
  if (
    manager &&
    (manager === String(user._id) ||
      !(await User.exists({ _id: manager, role: "Manager", active: true })))
  )
    fail("Select a valid manager.");
  Object.assign(user, {
    name: name.trim(),
    department,
    active,
    manager: manager || null,
  });
  await user.save();
  res.json(user);
};
export const removeEmployee = async (req, res) => {
  if (req.params.id === String(req.user._id))
    fail("You cannot remove your own account.");
  const user = await User.findById(req.params.id);
  if (!user || user.deleted) fail("Employee not found.", 404);
  if (
    await User.exists({
      manager: user._id,
      active: true,
      deleted: { $ne: true },
    })
  )
    fail("Reassign active direct reports before removing this manager.");
  user.active = false;
  user.deleted = true;
  await user.save();
  res.json({ message: "Employee removed. Historical records are retained." });
};
export const getEmployeeProfile = async (req, res) => {
  res.json(
    (await Employee.findOne({ user: req.user._id }).select(
      "-documentData",
    )) || { address: "", designation: "" },
  );
};
export const updateEmployeeProfile = async (req, res) => {
  const { address, designation } = req.body;
  if (
    typeof address !== "string" ||
    address.length > 500 ||
    typeof designation !== "string" ||
    designation.length > 100
  )
    fail("Invalid profile details.");
  res.json(
    await Employee.findOneAndUpdate(
      { user: req.user._id },
      { $set: { address, designation } },
      { upsert: true, new: true, runValidators: true },
    ),
  );
};
export const uploadDocument = async (req, res) => {
  const { name, type, data } = req.body;
  if (
    !text(name, 100) ||
    !["application/pdf", "image/png", "image/jpeg"].includes(type) ||
    typeof data !== "string" ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(data)
  )
    fail("Select a PDF, PNG or JPEG file.");
  const buffer = Buffer.from(data, "base64");
  if (buffer.length === 0 || buffer.length > 1024 * 1024)
    fail("File must be between 1 byte and 1 MB.");
  const signature =
    type === "application/pdf"
      ? buffer.subarray(0, 5).toString() === "%PDF-"
      : type === "image/png"
        ? buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a"
        : buffer.subarray(0, 3).toString("hex") === "ffd8ff";
  if (!signature) fail("File contents do not match the selected type.");
  await Employee.findOneAndUpdate(
    { user: req.user._id },
    { $set: { documentName: name, documentType: type, documentData: buffer } },
    { upsert: true, runValidators: true },
  );
  res.json({ message: "Document uploaded." });
};
export const downloadDocument = async (req, res) => {
  if (req.user.role !== "HR" && req.params.id !== String(req.user._id))
    fail("Access denied.", 403);
  const profile = await Employee.findOne({ user: req.params.id }).select(
    "+documentData",
  );
  if (!profile?.documentData) fail("No uploaded document.", 404);
  res.json({
    name: profile.documentName,
    type: profile.documentType,
    data: profile.documentData.toString("base64"),
  });
};
