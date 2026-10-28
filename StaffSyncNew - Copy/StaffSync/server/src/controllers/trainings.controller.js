import { User, Training, Employee } from "../models/index.js";
import { fail, text, dateOK, notify } from "../utils/helpers.js";
export const listTrainings = async (req, res) => {
  const filter =
    req.user.role === "HR"
      ? {}
      : req.user.role === "Manager"
        ? { manager: req.user._id }
        : { manager: req.user.manager, "assignments.user": req.user._id };
  const sessions = await Training.find(filter)
    .populate("manager", "name")
    .populate("assignments.user", "name manager active")
    .sort({ date: 1 });
  // Employees receive only their own progress, not colleagues' personal records.
  res.json(
    sessions.map((t) => {
      const data = t.toObject();
      if (req.user.role === "Employee")
        data.assignments = data.assignments.filter(
          (a) => String(a.user?._id) === String(req.user._id),
        );
      return data;
    }),
  );
};
export const createTraining = async (req, res) => {
  const { title, date, description, assignees } = req.body;
  if (
    !text(title) ||
    !dateOK(date) ||
    typeof description !== "string" ||
    description.length > 1000 ||
    !Array.isArray(assignees) ||
    !assignees.length
  )
    fail("Enter training details and select at least one team member.");
  const ids = [...new Set(assignees)];
  const team = await User.find({
    _id: { $in: ids },
    manager: req.user._id,
    role: "Employee",
    active: true,
    deleted: { $ne: true },
  }).select("_id");
  if (team.length !== ids.length)
    fail("Assign only active employees in your team.");
  const item = await Training.create({
    title,
    date,
    description,
    manager: req.user._id,
    assignments: ids.map((user) => ({ user, status: "Assigned" })),
  });
  await notify(ids, "New training assigned: " + title);
  res.status(201).json(item);
};
export const updateProgress = async (req, res) => {
  const { status } = req.body;
  if (!["Assigned", "In Progress", "Completed"].includes(status))
    fail("Invalid training status.");
  const item = await Training.findOneAndUpdate(
    {
      _id: req.params.id,
      manager: req.user.manager,
      "assignments.user": req.user._id,
    },
    { $set: { "assignments.$.status": status } },
    { new: true },
  );
  if (!item) fail("Assigned training not found.", 404);
  await notify(
    [item.manager],
    req.user.name + " updated training progress: " + status,
  );
  res.json({ message: "Training progress updated." });
};
export const deleteTraining = async (req, res) => {
  const item = await Training.findOneAndDelete({
    _id: req.params.id,
    manager: req.user._id,
  });
  if (!item) fail("Training not found.", 404);
  res.json({ message: "Training deleted." });
};
