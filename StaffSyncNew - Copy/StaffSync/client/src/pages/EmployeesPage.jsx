import React from "react";
import { Input, Panel, Empty, dateLabel } from "../components/UI";
import { api } from "../api";
import { downloadDocument } from "../utils/files";
function ManagerSelect({ value, onChange, users }) {
  return (
    <label className="form-label">
      Reporting manager
      <select
        className="form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">No manager</option>
        {users
          .filter((u) => u.role === "Manager" && u.active)
          .map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
      </select>
    </label>
  );
}

export default function EmployeesPage({
  user,
  users,
  busy,
  perform,
  change,
  submit,
  field,
  employee,
  setEmployee,
  edit,
  setEdit,
}) {
  return (
    <>
      <Panel title={user.role === "HR" ? "Manage employees" : "My team"}>
        {user.role === "HR" && (
          <form
            className="form-grid"
            onSubmit={(e) =>
              submit(
                e,
                async () => {
                  await change("/users", "POST", employee);
                  setEmployee(initialEmployee);
                },
                "Employee created.",
              )
            }
          >
            {["name", "email", "password", "department"].map((key) =>
              field(employee, setEmployee, key),
            )}
            <label className="form-label">
              Role
              <select
                className="form-select"
                value={employee.role}
                onChange={(e) =>
                  setEmployee({ ...employee, role: e.target.value })
                }
              >
                {["Employee", "Manager", "HR"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <ManagerSelect
              value={employee.manager}
              onChange={(v) => setEmployee({ ...employee, manager: v })}
              users={users}
            />
            <button className="btn btn-primary" disabled={busy}>
              Add employee
            </button>
          </form>
        )}
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Manager</th>
                <th>Status</th>
                {user.role === "HR" && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.department || "—"}</td>
                  <td>{u.manager?.name || "—"}</td>
                  <td>{u.active ? "Active" : "Inactive"}</td>
                  {user.role === "HR" && (
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() =>
                          setEdit({ ...u, manager: u.manager?._id || "" })
                        }
                      >
                        Edit
                      </button>
                      <button
                        disabled={busy}
                        className="btn btn-sm btn-outline-primary ms-1"
                        onClick={() =>
                          perform(
                            () => downloadDocument(api, u._id),
                            "Document downloaded.",
                          )
                        }
                      >
                        Document
                      </button>
                      {u._id !== user._id && (
                        <button
                          disabled={busy}
                          className="btn btn-sm btn-outline-danger ms-1"
                          onClick={() => {
                            if (
                              confirm(
                                "Remove this employee? Login will be blocked; historical records are retained.",
                              )
                            )
                              perform(
                                () => change("/users/" + u._id, "DELETE"),
                                "Employee removed.",
                              );
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!users.length && <Empty />}
      </Panel>
      {edit && (
        <Panel title="Edit employee">
          <form
            className="form-grid"
            onSubmit={(e) =>
              submit(e, async () => {
                await change("/users/" + edit._id, "PATCH", {
                  name: edit.name,
                  department: edit.department,
                  manager: edit.manager,
                  active: edit.active,
                });
                setEdit(null);
              })
            }
          >
            {["name", "department"].map((key) => field(edit, setEdit, key))}
            <ManagerSelect
              value={edit.manager}
              onChange={(v) => setEdit({ ...edit, manager: v })}
              users={users.filter((u) => u._id !== edit._id)}
            />
            <label className="form-label">
              Status
              <select
                className="form-select"
                value={String(edit.active)}
                onChange={(e) =>
                  setEdit({ ...edit, active: e.target.value === "true" })
                }
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
            <button disabled={busy} className="btn btn-primary">
              Save changes
            </button>
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setEdit(null)}
            >
              Cancel
            </button>
          </form>
        </Panel>
      )}
    </>
  );
}
