import React from "react";
import { Input, Panel, Empty, dateLabel } from "../components/UI";
import { api } from "../api";
import { downloadDocument } from "../utils/files";
export default function AttendancePage({
  user,
  attendance,
  busy,
  perform,
  change,
}) {
  return (
    <Panel title="Daily attendance">
      <p className="text-secondary">
        One check-in and check-out per day. Attendance dates follow India
        Standard Time.
      </p>
      <div className="d-flex gap-2 mb-4">
        <button
          disabled={busy}
          className="btn btn-primary"
          onClick={() =>
            perform(() => change("/attendance/check-in", "POST"), "Checked in.")
          }
        >
          Check in
        </button>
        <button
          disabled={busy}
          className="btn btn-outline-primary"
          onClick={() =>
            perform(
              () => change("/attendance/check-out", "POST"),
              "Checked out.",
            )
          }
        >
          Check out
        </button>
      </div>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Check in</th>
              <th>Check out</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a) => (
              <tr key={a._id}>
                <td>{a.user?.name || "Unknown"}</td>
                <td>{a.date}</td>
                <td>{dateLabel(a.checkIn)}</td>
                <td>{a.checkOut ? dateLabel(a.checkOut) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!attendance.length && <Empty />}
    </Panel>
  );
}
