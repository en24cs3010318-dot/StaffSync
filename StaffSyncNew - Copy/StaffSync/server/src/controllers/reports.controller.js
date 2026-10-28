import { User, Attendance, Leave } from "../models/index.js";
import { reportDates } from "../utils/helpers.js";
export const getReports = async (req, res) => {
  const range = reportDates(req.query);
  const [employees, attendance, leaves] = await Promise.all([
    User.find({ deleted: { $ne: true } })
      .populate("manager", "name")
      .sort({ name: 1 }),
    Attendance.find(range ? { date: range } : {})
      .populate("user", "name email department")
      .sort({ date: -1 }),
    Leave.find(
      range
        ? {
            ...(req.query.to ? { from: { $lte: req.query.to } } : {}),
            ...(req.query.from ? { to: { $gte: req.query.from } } : {}),
          }
        : {},
    )
      .populate("user", "name email department")
      .sort({ from: -1 }),
  ]);
  res.json({ employees, attendance, leaves });
};
