import React, { useState, useEffect } from "react";
import { api } from "../api";
import { csv, download } from "../utils/files";
export default function ReportsPage() {
  const [dates, setDates] = useState({ from: "", to: "" }),
    [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [kind, setKind] = useState("attendance");
  async function load() {
    setBusy(true);
    setError("");
    try {
      setData(await api("/reports?" + new URLSearchParams(dates)));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  const columns =
    kind === "employees"
      ? ["Name", "Email", "Role", "Department", "Manager", "Active"]
      : kind === "attendance"
        ? [
            "Name",
            "Email",
            "Department",
            "Date",
            "Check In",
            "Check Out",
            "Hours",
          ]
        : ["Name", "Email", "Department", "From", "To", "Reason", "Status"];
  const rows = (data?.[kind] || []).map((x) =>
    kind === "employees"
      ? [
          x.name,
          x.email,
          x.role,
          x.department,
          x.manager?.name,
          x.active ? "Yes" : "No",
        ]
      : kind === "attendance"
        ? [
            x.user?.name,
            x.user?.email,
            x.user?.department,
            x.date,
            new Date(x.checkIn).toLocaleString(),
            x.checkOut ? new Date(x.checkOut).toLocaleString() : "",
            x.checkOut
              ? Math.max(
                  0,
                  (new Date(x.checkOut) - new Date(x.checkIn)) / 3600000,
                ).toFixed(2)
              : "",
          ]
        : [
            x.user?.name,
            x.user?.email,
            x.user?.department,
            x.from,
            x.to,
            x.reason,
            x.status,
          ],
  );
  return (
    <section className="panel">
      <h2>HR reports</h2>
      <p>
        Filter attendance by day and leave by overlapping dates. Employee
        information includes all current employee records. Hours support
        administrative review; this does not calculate payroll or performance
        ratings.
      </p>
      {error && <div className="alert alert-danger">{error}</div>}
      <form
        className="form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        {["from", "to"].map((k) => (
          <label key={k} className="form-label">
            {k === "from" ? "From" : "To"}
            <input
              className="form-control"
              type="date"
              value={dates[k]}
              onChange={(e) => setDates({ ...dates, [k]: e.target.value })}
            />
          </label>
        ))}
        <button disabled={busy} className="btn btn-primary">
          {busy ? "Loading…" : "Apply dates"}
        </button>
      </form>
      <div className="d-flex gap-2 mb-4">
        <select
          aria-label="Report type"
          className="form-select"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          {["attendance", "leaves", "employees"].map((k) => (
            <option key={k} value={k}>
              {k[0].toUpperCase() + k.slice(1)}
            </option>
          ))}
        </select>
        <button
          disabled={!data || busy}
          className="btn btn-outline-primary text-nowrap"
          onClick={() =>
            download(
              "staffsync-" + kind + ".csv",
              new Blob(["\ufeff" + csv(columns, rows)], {
                type: "text/csv;charset=utf-8;",
              }),
            )
          }
        >
          Export CSV
        </button>
      </div>
      <p>{rows.length} records in the applied report</p>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell || "—"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && !rows.length && (
        <p className="empty">No records for this selection.</p>
      )}
    </section>
  );
}
