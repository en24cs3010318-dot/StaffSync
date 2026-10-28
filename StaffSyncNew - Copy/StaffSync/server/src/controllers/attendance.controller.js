import { Attendance } from "../models/index.js";
import { fail, today, scope } from "../utils/helpers.js";
export const listAttendance = async (req, res) =>
  res.json(
    await Attendance.find(await scope(req.user))
      .populate("user", "name")
      .sort({ date: -1, checkIn: -1 })
      .limit(500),
  );
export const checkIn = async (req, res) => {
  const record = await Attendance.create({ user: req.user._id, date: today() });
  res.status(201).json(record);
};
export const checkOut = async (req, res) => {
  const record = await Attendance.findOneAndUpdate(
    { user: req.user._id, date: today(), checkOut: { $exists: false } },
    { $set: { checkOut: new Date() } },
    { new: true },
  );
  if (!record) fail("Check in first, or you have already checked out.");
  res.json(record);
};
