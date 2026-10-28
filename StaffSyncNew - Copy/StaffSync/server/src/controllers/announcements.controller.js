import { Announcement } from "../models/index.js";
import { fail, text, notify, staffIds } from "../utils/helpers.js";
export const listAnnouncements = async (req, res) =>
  res.json(
    await Announcement.find()
      .populate("author", "name")
      .sort({ createdAt: -1 }),
  );
export const createAnnouncement = async (req, res) => {
  if (!text(req.body.title) || !text(req.body.body, 2000))
    fail("Enter a title and announcement (maximum 2000 characters).");
  const item = await Announcement.create({
    title: req.body.title.trim(),
    body: req.body.body.trim(),
    author: req.user._id,
  });
  await notify(await staffIds(), "Announcement: " + item.title);
  res.status(201).json(item);
};
export const deleteAnnouncement = async (req, res) => {
  const item = await Announcement.findOneAndDelete({
    _id: req.params.id,
    ...(req.user.role === "HR" ? {} : { author: req.user._id }),
  });
  if (!item) fail("Announcement not found.", 404);
  res.json({ message: "Announcement deleted." });
};
