import React from "react";
import { Input, Panel, Empty, dateLabel } from "../components/UI";
import { api } from "../api";
import { downloadDocument } from "../utils/files";
export default function DashboardPage({
  user,
  users,
  attendance,
  leaves,
  announcements,
  trainings,
  setPage,
  leave,
  profile,
}) {
  return (
    <>
      <div className="welcome">
        <div>
          <p className="eyebrow">A LITTLE MORE ORGANIZED, EVERY DAY</p>
          <h2>Hello, {user.name.split(" ")[0]} 👋</h2>
          <p>Welcome back. Here’s what’s happening in your workspace.</p>
        </div>
        <span className="welcome-art">✳</span>
      </div>
      <div className="stats">
        {[
          [
            user.role === "Employee"
              ? "My attendance records"
              : "Visible team members",
            user.role === "Employee"
              ? attendance.length
              : users.filter((u) => u.active).length,
          ],
          [
            "Pending leave requests",
            leaves.filter((l) => l.status === "Pending").length,
          ],
          ["Announcements", announcements.length],
          ["Training sessions", trainings.length],
        ].map(([label, value]) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="two-column">
        <Panel title="Latest announcements">
          {announcements.length ? (
            announcements.slice(0, 3).map((a) => (
              <article key={a._id}>
                <small>
                  {new Date(a.createdAt).toLocaleDateString("en-IN")}
                </small>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
              </article>
            ))
          ) : (
            <Empty />
          )}
        </Panel>
        <Panel title={user.role + " quick actions"}>
          <p className="text-secondary">Keep your workday on track.</p>
          {user.role === "HR" && (
            <button className="action-link" onClick={() => setPage("Reports")}>
              Generate HR reports <span>→</span>
            </button>
          )}
          {user.role === "Manager" && (
            <button className="action-link" onClick={() => setPage("Training")}>
              Assign and monitor training <span>→</span>
            </button>
          )}
          <button className="action-link" onClick={() => setPage("Attendance")}>
            Mark today’s attendance <span>→</span>
          </button>
          <button className="action-link" onClick={() => setPage("Leaves")}>
            Request time off <span>→</span>
          </button>
          <button className="action-link" onClick={() => setPage("My Profile")}>
            Update your profile <span>→</span>
          </button>
        </Panel>
      </div>
    </>
  );
}
