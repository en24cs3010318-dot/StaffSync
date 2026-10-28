import React from "react";
import { Input, Panel, Empty, dateLabel } from "../components/UI";
import { api } from "../api";
import { downloadDocument } from "../utils/files";
import EmployeeProfile from "./EmployeeProfile";
export default function MyProfilePage({
  user,
  busy,
  perform,
  submit,
  field,
  profile,
  setProfile,
  setUser,
}) {
  return (
    <>
      <EmployeeProfile user={user} perform={perform} busy={busy} />
      <Panel title="Personal information">
        <p>
          {user.email} · {user.role}
        </p>
        <form
          className="form-grid"
          onSubmit={(e) =>
            submit(e, async () => {
              const updated = await api("/me", "PATCH", profile);
              setUser(updated);
            })
          }
        >
          {field(profile, setProfile, "name")}
          <Input
            label="Phone"
            type="tel"
            maxLength={20}
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
          <button disabled={busy} className="btn btn-primary">
            Save profile
          </button>
        </form>
      </Panel>
    </>
  );
}
