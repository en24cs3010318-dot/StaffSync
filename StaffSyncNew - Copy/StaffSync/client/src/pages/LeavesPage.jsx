import React from "react";
import { Input, Panel, Empty, dateLabel } from "../components/UI";
import { api } from "../api";
import { downloadDocument } from "../utils/files";
export default function LeavesPage({
  user,
  leaves,
  busy,
  perform,
  change,
  submit,
  field,
  leave,
  setLeave,
}) {
  return (
    <>
      <Panel title="Request leave">
        <form
          className="form-grid"
          onSubmit={(e) =>
            submit(
              e,
              async () => {
                await change("/leaves", "POST", leave);
                setLeave({ from: "", to: "", reason: "" });
              },
              "Leave request submitted.",
            )
          }
        >
          {["from", "to"].map((key) => field(leave, setLeave, key))}
          <label className="form-label">
            Reason
            <textarea
              className="form-control"
              required
              maxLength={500}
              value={leave.reason}
              onChange={(e) => setLeave({ ...leave, reason: e.target.value })}
            />
          </label>
          <button className="btn btn-primary" disabled={busy}>
            Submit request
          </button>
        </form>
      </Panel>
      <Panel title="Leave requests">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l._id}>
                  <td>{l.user?.name || "Unknown"}</td>
                  <td>
                    {l.from}
                    <br />
                    {l.to}
                  </td>
                  <td>{l.reason}</td>
                  <td>
                    <span className={"status " + l.status.toLowerCase()}>
                      {l.status}
                    </span>
                  </td>
                  <td>
                    {user.role !== "Employee" &&
                    l.user?._id !== user._id &&
                    l.status === "Pending" ? (
                      <div className="d-flex gap-2">
                        {["Approved", "Rejected"].map((status) => (
                          <button
                            disabled={busy}
                            key={status}
                            className={
                              "btn btn-sm " +
                              (status === "Approved"
                                ? "btn-outline-success"
                                : "btn-outline-danger")
                            }
                            onClick={() =>
                              perform(() =>
                                change("/leaves/" + l._id, "PATCH", { status }),
                              )
                            }
                          >
                            {status === "Approved" ? "Approve" : "Reject"}
                          </button>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!leaves.length && <Empty />}
      </Panel>
    </>
  );
}
