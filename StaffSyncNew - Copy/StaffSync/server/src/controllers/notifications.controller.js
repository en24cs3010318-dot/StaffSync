import { Notification } from "../models/index.js";
export const listNotifications = async (req, res) =>
  res.json(
    await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100),
  );
export const markNotificationsRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { $set: { read: true } },
  );
  res.json({ message: "Notifications marked as read." });
};
