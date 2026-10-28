import React from "react";
import { Input, Panel, Empty, dateLabel } from "../components/UI";
import { api } from "../api";
import { downloadDocument } from "../utils/files";
export default function AnnouncementsPage({
  user,
  announcements,
  busy,
  perform,
  change,
  submit,
  field,
  announcement,
  setAnnouncement,
}) {
  return (
    <>
      {["HR", "Manager"].includes(user.role) && (
        <Panel title="Post an announcement">
          <form
            onSubmit={(e) =>
              submit(e, async () => {
                await change("/announcements", "POST", announcement);
                setAnnouncement({ title: "", body: "" });
              })
            }
          >
            {field(announcement, setAnnouncement, "title")}
            <label className="form-label">
              Message
              <textarea
                className="form-control"
                required
                maxLength={2000}
                value={announcement.body}
                onChange={(e) =>
                  setAnnouncement({ ...announcement, body: e.target.value })
                }
              />
            </label>
            <button disabled={busy} className="btn btn-primary">
              Publish announcement
            </button>
          </form>
        </Panel>
      )}
      <Panel title="Company updates">
        {announcements.map((a) => (
          <article key={a._id}>
            <small>
              {a.author?.name} · {dateLabel(a.createdAt)}
            </small>
            <h3>{a.title}</h3>
            <p className="preserve-lines">{a.body}</p>
            {(user.role === "HR" ||
              (user.role === "Manager" && a.author?._id === user._id)) && (
              <button
                disabled={busy}
                className="btn btn-sm btn-outline-danger"
                onClick={() => {
                  if (window.confirm("Delete this announcement?"))
                    perform(() => change("/announcements/" + a._id, "DELETE"));
                }}
              >
                Delete
              </button>
            )}
          </article>
        ))}
        {!announcements.length && <Empty />}
      </Panel>
    </>
  );
}
