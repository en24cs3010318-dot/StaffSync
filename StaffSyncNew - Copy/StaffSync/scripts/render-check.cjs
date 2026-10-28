const { createRequire } = require("node:module");
const { pathToFileURL } = require("node:url");
(async () => {
  const local = createRequire(
    require("node:path").join(__dirname, "../client/package.json"),
  );
  const { createServer } = await import(pathToFileURL(local.resolve("vite")));
  const React = local("react");
  const { renderToString } = local("react-dom/server");
  const server = await createServer({
    root: require("node:path").join(__dirname, "../client"),
    server: { middlewareMode: true },
    appType: "custom",
  });
  const noop = () => {};
  let count = 0;
  const records = {
    users: [
      {
        _id: "u1",
        name: "Employee",
        email: "e@test.com",
        role: "Employee",
        active: true,
        department: "IT",
      },
    ],
    attendance: [
      {
        _id: "a1",
        user: { _id: "u1", name: "Employee" },
        date: "2026-11-10",
        checkIn: "2026-11-10T04:00:00Z",
      },
    ],
    leaves: [
      {
        _id: "l1",
        user: { _id: "u1", name: "Employee" },
        from: "2026-11-10",
        to: "2026-11-11",
        reason: "Family event",
        status: "Pending",
      },
    ],
    announcements: [
      {
        _id: "n1",
        title: "Welcome",
        body: "A company update",
        createdAt: "2026-11-10T04:00:00Z",
        author: { _id: "u1", name: "HR" },
      },
    ],
    trainings: [
      {
        _id: "t1",
        title: "React",
        date: "2026-11-12",
        description: "Basics",
        manager: { _id: "u1", name: "Manager" },
        assignments: [
          {
            _id: "s1",
            user: { _id: "u1", name: "Employee" },
            status: "Assigned",
          },
        ],
      },
    ],
    notifications: [],
  };
  try {
    for (const role of ["HR", "Manager", "Employee"])
      for (const page of [
        "DashboardPage",
        "EmployeesPage",
        "AttendancePage",
        "LeavesPage",
        "AnnouncementsPage",
        "TrainingPage",
        "MyProfilePage",
        "ReportsPage",
      ]) {
        const { default: Page } = await server.ssrLoadModule(
          "/src/pages/" + page + ".jsx",
        );
        const props = {
          ...records,
          user: { _id: "u1", name: "Demo", role, email: "demo@test.com" },
          employee: {
            name: "",
            email: "",
            password: "",
            role: "Employee",
            department: "",
            manager: "",
          },
          edit: null,
          leave: { from: "", to: "", reason: "" },
          announcement: { title: "", body: "" },
          profile: { name: "Demo", phone: "" },
          busy: false,
          perform: noop,
          change: noop,
          submit: noop,
          field: () => null,
        };
        for (const key of [
          "setPage",
          "setEmployee",
          "setEdit",
          "setLeave",
          "setAnnouncement",
          "setProfile",
          "setUser",
        ])
          props[key] = noop;
        renderToString(React.createElement(Page, props));
        count++;
      }
    console.log("PASS: " + count + " role/page server render checks.");
  } finally {
    await server.close();
  }
})();
