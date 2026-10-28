import React, { useState } from "react";
import { api } from "../api";
export default function TrainingPage({
  user,
  users,
  trainings,
  perform,
  change,
  busy,
}) {
  const [form, setForm] = useState({
    title: "",
    date: "",
    description: "",
    assignees: [],
  });
  const field = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <>
      <section className="panel">
        <h2>Training and development</h2>
        <p className="text-secondary">
          {user.role === "Manager"
            ? "Assign learning to your team and monitor completion."
            : user.role === "HR"
              ? "Review training and progress across all teams."
              : "Review your assigned training and update your progress."}
        </p>
        {user.role === "Manager" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              perform(async () => {
                await change("/trainings", "POST", form);
                setForm({
                  title: "",
                  date: "",
                  description: "",
                  assignees: [],
                });
              });
            }}
          >
            <div className="form-grid">
              <label className="form-label">
                Title
                <input
                  className="form-control"
                  name="title"
                  required
                  maxLength={150}
                  value={form.title}
                  onChange={field}
                />
              </label>
              <label className="form-label">
                Date
                <input
                  className="form-control"
                  type="date"
                  name="date"
                  required
                  value={form.date}
                  onChange={field}
                />
              </label>
            </div>
            <label className="form-label">
              Description
              <textarea
                className="form-control"
                name="description"
                maxLength={1000}
                value={form.description}
                onChange={field}
              />
            </label>
            <fieldset>
              <legend className="fs-6">Assign team employees</legend>
              {users
                .filter((u) => u.active && u.role === "Employee")
                .map((u) => (
                  <label key={u._id} className="d-block mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      checked={form.assignees.includes(u._id)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          assignees: e.target.checked
                            ? [...form.assignees, u._id]
                            : form.assignees.filter((id) => id !== u._id),
                        })
                      }
                    />
                    {u.name}
                  </label>
                ))}
              {!users.some((u) => u.active && u.role === "Employee") && (
                <p>Ask HR to assign employees to your team.</p>
              )}
            </fieldset>
            <button
              disabled={busy || !form.assignees.length}
              className="btn btn-primary mt-3"
            >
              Create and assign training
            </button>
          </form>
        )}
      </section>
      <section className="panel">
        <h2>Training programs</h2>
        {!trainings.length && (
          <p className="empty">No training assigned yet.</p>
        )}
        {trainings.map((t) => (
          <article key={t._id}>
            <small>
              {t.date} · {t.manager?.name}
            </small>
            <h3>{t.title}</h3>
            <p>{t.description}</p>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {(t.assignments || []).map((a) => (
                    <tr key={a._id || a.user?._id}>
                      <td>{a.user?.name || "Former employee"}</td>
                      <td>
                        {user.role === "Employee" ? (
                          <select
                            aria-label="Training progress"
                            disabled={busy}
                            className="form-select"
                            value={a.status}
                            onChange={(e) =>
                              perform(() =>
                                change(
                                  "/trainings/" + t._id + "/progress",
                                  "PATCH",
                                  { status: e.target.value },
                                ),
                              )
                            }
                          >
                            {["Assigned", "In Progress", "Completed"].map(
                              (s) => (
                                <option key={s}>{s}</option>
                              ),
                            )}
                          </select>
                        ) : (
                          a.status
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!t.assignments?.length && (
              <p>
                Older program without assignments. Create a new assigned
                program.
              </p>
            )}
            {user.role === "Manager" && (
              <button
                disabled={busy}
                className="btn btn-sm btn-outline-danger"
                onClick={() => {
                  if (confirm("Delete this training program?"))
                    perform(() => change("/trainings/" + t._id, "DELETE"));
                }}
              >
                Delete program
              </button>
            )}
          </article>
        ))}
      </section>
    </>
  );
}
