import MyProfilePage from "./pages/MyProfilePage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import LeavesPage from "./pages/LeavesPage";
import AttendancePage from "./pages/AttendancePage";
import EmployeesPage from "./pages/EmployeesPage";
import DashboardPage from "./pages/DashboardPage";
import React, { useState, useEffect } from "react";
import { api } from "./api";
import TrainingPage from "./pages/TrainingPage";
import ReportsPage from "./pages/ReportsPage";

import { Input, Panel, Empty, dateLabel } from "./components/UI";
const initialEmployee = {
  name: "",
  email: "",
  password: "",
  role: "Employee",
  department: "",
  manager: "",
};
export default function App() {
  const [user, setUser] = useState(null),
    [page, setPage] = useState("Dashboard"),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [login, setLogin] = useState({
    email: "hr@staffsync.com",
    password: "",
  });
  const [notifications, setNotifications] = useState([]),
    [users, setUsers] = useState([]),
    [attendance, setAttendance] = useState([]),
    [leaves, setLeaves] = useState([]),
    [announcements, setAnnouncements] = useState([]),
    [trainings, setTrainings] = useState([]);
  const [employee, setEmployee] = useState(initialEmployee),
    [edit, setEdit] = useState(null),
    [leave, setLeave] = useState({ from: "", to: "", reason: "" }),
    [announcement, setAnnouncement] = useState({ title: "", body: "" }),
    [profile, setProfile] = useState({ name: "", phone: "" });
  function logout() {
    sessionStorage.removeItem("staffsync-token");
    setUser(null);
    setPage("Dashboard");
    setUsers([]);
    setAttendance([]);
    setLeaves([]);
    setAnnouncements([]);
    setTrainings([]);
    setNotifications([]);
  }
  useEffect(() => {
    const expired = () => {
      logout();
      setError("Your session expired. Please log in again.");
    };
    window.addEventListener("session-expired", expired);
    if (sessionStorage.getItem("staffsync-token"))
      api("/me")
        .then(setUser)
        .catch((e) => {
          logout();
          setError(e.message);
        })
        .finally(() => setLoading(false));
    else setLoading(false);
    return () => window.removeEventListener("session-expired", expired);
  }, []);
  async function refresh(current = user) {
    const session = sessionStorage.getItem("staffsync-token");
    const results = await Promise.all([
      api("/attendance"),
      api("/leaves"),
      api("/announcements"),
      api("/trainings"),
      current.role !== "Employee" ? api("/users") : Promise.resolve([]),
      api("/notifications"),
    ]);
    // Ignore responses belonging to a user who signed out while requests ran.
    if (sessionStorage.getItem("staffsync-token") !== session) return;
    setAttendance(results[0]);
    setLeaves(results[1]);
    setAnnouncements(results[2]);
    setTrainings(results[3]);
    setUsers(results[4]);
    setNotifications(results[5]);
  }
  useEffect(() => {
    if (user) {
      setProfile({ name: user.name, phone: user.phone || "" });
      let alive = true;
      const update = () =>
        refresh(user).catch((e) => {
          if (alive) setError(e.message);
        });
      update();
      const timer = setInterval(update, 15000);
      return () => {
        alive = false;
        clearInterval(timer);
      };
    }
  }, [user]);
  async function perform(fn, success) {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await fn();
      setMessage(success || "Saved successfully.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function submit(e, fn, success) {
    e.preventDefault();
    perform(fn, success);
  }
  async function change(path, method, body) {
    await api(path, method, body);
    await refresh();
  }
  const field = (state, setter, key) => (
    <Input
      key={key}
      label={key[0].toUpperCase() + key.slice(1)}
      value={state[key]}
      onChange={(e) => setter({ ...state, [key]: e.target.value })}
      required
      maxLength={key === "password" ? 72 : 150}
      type={
        key === "password"
          ? "password"
          : key === "email"
            ? "email"
            : key === "date" || key === "from" || key === "to"
              ? "date"
              : "text"
      }
    />
  );
  if (loading) return <main className="login-shell">Loading StaffSync…</main>;
  if (!user)
    return (
      <main className="login-shell">
        <div className="login-intro">
          <span className="brand-mark">S</span>
          <p className="eyebrow">PEOPLE. CONNECTED.</p>
          <h1>
            Good teams.
            <br />
            Great workplaces.
          </h1>
          <p>A simple home for your people, attendance, and everyday HR.</p>
          <div className="demo-note">COLLEGE PROJECT · MERN STACK</div>
        </div>
        <section className="login-card">
          <h2>Welcome to StaffSync</h2>
          <p className="text-secondary">Sign in to your workspace</p>
          {error && (
            <div role="alert" className="alert alert-danger">
              {error}
            </div>
          )}
          <form
            onSubmit={(e) =>
              submit(
                e,
                async () => {
                  const data = await api("/auth/login", "POST", login);
                  sessionStorage.setItem("staffsync-token", data.token);
                  setUser(data.user);
                },
                "Signed in.",
              )
            }
          >
            <Input
              label="Email"
              type="email"
              required
              value={login.email}
              onChange={(e) => setLogin({ ...login, email: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              required
              value={login.password}
              onChange={(e) => setLogin({ ...login, password: e.target.value })}
            />
            <button disabled={busy} className="btn btn-primary w-100">
              {busy ? "Signing in…" : "Sign in →"}
            </button>
          </form>
          <div className="sample-accounts">
            <strong>Demo accounts (run the seed first)</strong>
            <p>
              hr@staffsync.com
              <br />
              manager@staffsync.com
              <br />
              employee@staffsync.com
            </p>
            <span>
              Password for all: <code>Demo@123</code>
            </span>
          </div>
        </section>
      </main>
    );
  const tabs = [
    "Dashboard",
    ...(user.role !== "Employee" ? ["Employees"] : []),
    "Attendance",
    "Leaves",
    "Announcements",
    "Training",
    ...(user.role === "HR" ? ["Reports"] : []),
    "Notifications",
    "My Profile",
  ];
  return (
    <div className="app-shell">
      <aside>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage("Dashboard");
          }}
        >
          <span className="brand-mark">S</span>StaffSync
          <span className="brand-dot">.</span>
        </a>
        <p className="nav-label">WORKSPACE</p>
        <nav>
          {tabs.map((tab, i) => (
            <button
              key={tab}
              className={page === tab ? "selected" : ""}
              onClick={() => {
                setPage(tab);
                setError("");
                setMessage("");
              }}
            >
              <span className="nav-icon">
                {["◈", "▦", "◷", "▤", "◉", "◇", "○"][i % 7]}
              </span>
              {tab}
              {tab === "Notifications" && notifications.some((n) => !n.read)
                ? " •"
                : ""}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <strong>{user.name}</strong>
          <span>
            {user.role} · {user.department || "StaffSync"}
          </span>
          <button
            className="btn btn-outline-light btn-sm mt-3"
            onClick={logout}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="workspace">
        <header>
          <div>
            <p className="eyebrow">YOUR PEOPLE WORKSPACE</p>
            <h1>{page === "Dashboard" ? user.role + " Dashboard" : page}</h1>
          </div>
          <span className="role-pill">{user.role}</span>
        </header>
        {error && (
          <div role="alert" className="alert alert-danger">
            {error}
          </div>
        )}
        {message && (
          <div role="status" className="alert alert-success">
            {message}
          </div>
        )}
        {page === "Dashboard" && (
          <DashboardPage
            user={user}
            users={users}
            attendance={attendance}
            leaves={leaves}
            announcements={announcements}
            trainings={trainings}
            setPage={setPage}
            leave={leave}
            profile={profile}
          />
        )}
        {page === "Employees" && (
          <EmployeesPage
            user={user}
            users={users}
            busy={busy}
            perform={perform}
            change={change}
            submit={submit}
            field={field}
            employee={employee}
            setEmployee={setEmployee}
            edit={edit}
            setEdit={setEdit}
          />
        )}
        {page === "Attendance" && (
          <AttendancePage
            user={user}
            attendance={attendance}
            busy={busy}
            perform={perform}
            change={change}
          />
        )}
        {page === "Leaves" && (
          <LeavesPage
            user={user}
            leaves={leaves}
            busy={busy}
            perform={perform}
            change={change}
            submit={submit}
            field={field}
            leave={leave}
            setLeave={setLeave}
          />
        )}
        {page === "Announcements" && (
          <AnnouncementsPage
            user={user}
            announcements={announcements}
            busy={busy}
            perform={perform}
            change={change}
            submit={submit}
            field={field}
            announcement={announcement}
            setAnnouncement={setAnnouncement}
          />
        )}
        {page === "Training" && (
          <TrainingPage
            user={user}
            users={users}
            trainings={trainings}
            busy={busy}
            perform={perform}
            change={change}
          />
        )}
        {page === "Reports" && user.role === "HR" && <ReportsPage />}
        {page === "Notifications" && (
          <Panel title="Your notifications">
            <p>
              Updates are checked every 15 seconds while signed in. The latest
              100 notifications are shown.
            </p>
            <button
              disabled={busy}
              className="btn btn-outline-primary mb-3"
              onClick={() =>
                perform(
                  () => change("/notifications/read", "PATCH"),
                  "Notifications marked as read.",
                )
              }
            >
              Mark all as read
            </button>
            {notifications.map((n) => (
              <article key={n._id}>
                <small>
                  {dateLabel(n.createdAt)} · {n.read ? "Read" : "New"}
                </small>
                <p>{n.message}</p>
              </article>
            ))}
            {!notifications.length && <Empty />}
          </Panel>
        )}
        {page === "My Profile" && (
          <MyProfilePage
            user={user}
            busy={busy}
            perform={perform}
            submit={submit}
            field={field}
            profile={profile}
            setProfile={setProfile}
            setUser={setUser}
          />
        )}
        <footer>StaffSync · HR made simple · College MERN project</footer>
      </main>
    </div>
  );
}
