import React from "react";
export const dateLabel = (value) => new Date(value).toLocaleString("en-IN");
export function Input({ label, ...props }) {
  return (
    <label className="form-label">
      {label}
      <input className="form-control" {...props} />
    </label>
  );
}
export function Empty({ children = "No records yet." }) {
  return <p className="empty">{children}</p>;
}
export function Panel({ title, children }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
