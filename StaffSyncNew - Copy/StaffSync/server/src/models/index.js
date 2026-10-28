import mongoose from "mongoose";
const { Schema, model } = mongoose;
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["HR", "Manager", "Employee"],
      default: "Employee",
    },
    department: { type: String, default: "" },
    phone: { type: String, default: "" },
    manager: { type: Schema.Types.ObjectId, ref: "User", default: null },
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);
export const User = model("User", userSchema);
const attendanceSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  checkIn: { type: Date, default: Date.now },
  checkOut: Date,
});
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });
export const Attendance = model("Attendance", attendanceSchema);
export const Leave = model(
  "Leave",
  new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      from: { type: String, required: true },
      to: { type: String, required: true },
      reason: { type: String, required: true, maxlength: 500 },
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
      reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true },
  ),
);
export const Announcement = model(
  "Announcement",
  new Schema(
    {
      title: { type: String, required: true, maxlength: 150 },
      body: { type: String, required: true, maxlength: 2000 },
      author: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true },
  ),
);
export const Training = model(
  "Training",
  new Schema(
    {
      title: { type: String, required: true },
      date: { type: String, required: true },
      description: String,
      assignments: [
        {
          user: { type: Schema.Types.ObjectId, ref: "User" },
          status: {
            type: String,
            enum: ["Assigned", "In Progress", "Completed"],
            default: "Assigned",
          },
        },
      ],
      manager: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true },
  ),
);

export const Employee = model(
  "Employee",
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true,
      },
      address: { type: String, default: "", maxlength: 500 },
      designation: { type: String, default: "", maxlength: 100 },
      documentName: String,
      documentType: String,
      documentData: { type: Buffer, select: false },
    },
    { timestamps: true },
  ),
);
export const Notification = model(
  "Notification",
  new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      message: { type: String, required: true },
      read: { type: Boolean, default: false },
    },
    { timestamps: true },
  ),
);
