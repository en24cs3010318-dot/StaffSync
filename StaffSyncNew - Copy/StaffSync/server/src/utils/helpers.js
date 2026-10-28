import { User, Notification } from "../models/index.js";
export const route = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
export const fail = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  throw error;
};
export const text = (value, max = 150) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.trim().length <= max;
export const dateOK = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !isNaN(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
// Attendance days use India Standard Time, matching this college demo.
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const publicUser = (user) => {
  const data = user.toObject();
  delete data.password;
  return data;
};
export async function scope(user) {
  if (user.role === "HR") return {};
  if (user.role === "Manager") {
    const team = await User.find({ manager: user._id }).select("_id");
    return { user: { $in: [user._id, ...team.map((member) => member._id)] } };
  }
  return { user: user._id };
}

export async function notify(ids, message) {
  const recipients = [...new Set(ids.filter(Boolean).map(String))];
  if (!recipients.length) return;
  try {
    await Notification.insertMany(
      recipients.map((user) => ({ user, message })),
    );
  } catch (error) {
    console.error("Notification delivery failed:", error.message);
  }
}
export async function staffIds() {
  return (
    await User.find({ active: true, deleted: { $ne: true } }).select("_id")
  ).map((u) => u._id);
}
export function reportDates(query) {
  const filter = {};
  if (query.from && !dateOK(query.from)) fail("Invalid start date.");
  if (query.to && !dateOK(query.to)) fail("Invalid end date.");
  if (query.from && query.to && query.from > query.to)
    fail("Start date must be before end date.");
  if (query.from) filter.$gte = query.from;
  if (query.to) filter.$lte = query.to;
  return Object.keys(filter).length ? filter : null;
}
