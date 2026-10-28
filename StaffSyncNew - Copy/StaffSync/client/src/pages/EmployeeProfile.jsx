import React, { useEffect, useState } from "react";
import { api } from "../api";
import { downloadDocument } from "../utils/files";
export default function EmployeeProfile({ user, perform, busy }) {
  const [profile, setProfile] = useState({ address: "", designation: "" }),
    [file, setFile] = useState(null);
  async function load() {
    setProfile(await api("/employee-profile"));
  }
  useEffect(() => {
    load().catch((e) =>
      perform(async () => {
        throw e;
      }),
    );
  }, []);
  async function upload() {
    if (!file) throw new Error("Choose a document first.");
    if (file.size > 1024 * 1024) throw new Error("Maximum file size is 1 MB.");
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = () => reject(new Error("Unable to read file."));
      reader.readAsDataURL(file);
    });
    await api("/employee-profile/document", "POST", {
      name: file.name,
      type: file.type,
      data,
    });
    await load();
  }
  return (
    <section className="panel">
      <h2>Employee profile and document</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          perform(async () => {
            await api("/employee-profile", "PATCH", {
              address: profile.address || "",
              designation: profile.designation || "",
            });
            await load();
          });
        }}
      >
        <label className="form-label">
          Designation
          <input
            maxLength={100}
            className="form-control"
            value={profile.designation || ""}
            onChange={(e) =>
              setProfile({ ...profile, designation: e.target.value })
            }
          />
        </label>
        <label className="form-label">
          Address
          <textarea
            maxLength={500}
            className="form-control"
            value={profile.address || ""}
            onChange={(e) =>
              setProfile({ ...profile, address: e.target.value })
            }
          />
        </label>
        <button className="btn btn-primary" disabled={busy}>
          Save employee information
        </button>
      </form>
      <hr />
      <p>
        Upload a profile document: PDF, PNG or JPEG, up to 1 MB. Only you and HR
        can download it.
      </p>
      <label className="form-label">
        Choose document
        <input
          className="form-control"
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          onChange={(e) => setFile(e.target.files[0] || null)}
        />
      </label>
      <button
        className="btn btn-outline-primary me-2"
        disabled={busy || !file}
        onClick={() => perform(upload, "Document uploaded.")}
      >
        Upload / replace
      </button>
      {profile.documentName && (
        <button
          className="btn btn-light"
          disabled={busy}
          onClick={() =>
            perform(
              () => downloadDocument(api, user._id),
              "Document downloaded.",
            )
          }
        >
          Download {profile.documentName}
        </button>
      )}
    </section>
  );
}
