import { User, Leave } from "../models/index.js";
import { fail, text, dateOK, scope, notify } from "../utils/helpers.js";
export const listLeaves = async (req, res) =>
  res.json(
    await Leave.find(await scope(req.user))
      .populate("user", "name")
      .sort({ createdAt: -1 }),
  );
export const applyLeave = async (req, res) => {
  const { from, to, reason } = req.body;
  if (!dateOK(from) || !dateOK(to) || from > to || !text(reason, 500))
    fail("Enter valid dates and a reason (maximum 500 characters).");
  if (
    await Leave.exists({
      user: req.user._id,
      status: { $ne: "Rejected" },
      from: { $lte: to },
      to: { $gte: from },
    })
  )
    fail("These dates overlap an existing leave request.");
  const item = await Leave.create({
    user: req.user._id,
    from,
    to,
    reason: reason.trim(),
  });
  const hrs = await User.find({ role: "HR", active: true }).select("_id");
  await notify(
    [...hrs.map((u) => u._id), req.user.manager],
    req.user.name + " submitted a leave request.",
  );
  res.status(201).json(item);
};
export const reviewLeave = async (req, res) => {
  const { status } = req.body;
  if (!["Approved", "Rejected"].includes(status)) fail("Invalid status.");
  const filter = {
    ...(await scope(req.user)),
    _id: req.params.id,
    status: "Pending",
  };
  const leave = await Leave.findOne(filter);
  if (!leave) fail("Pending request not found.", 404);
  if (String(leave.user) === String(req.user._id))
    fail("You cannot review your own leave.", 403);
  const updated = await Leave.findOneAndUpdate(
    filter,
    { $set: { status, reviewedBy: req.user._id } },
    { new: true },
  );
  if (!updated) fail("Request already reviewed.", 409);
  await notify(
    [leave.user],
    "Your leave request was " + status.toLowerCase() + ".",
  );
  res.json(updated);
};
