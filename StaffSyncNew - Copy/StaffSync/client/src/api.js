const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export async function api(path, method = "GET", body) {
  const token = sessionStorage.getItem("staffsync-token");
  let response;
  try {
    response = await fetch(base + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error("Cannot connect to the API. Start the backend server.");
  }
  const data = await response.json();
  if (!response.ok) {
    if (
      response.status === 401 &&
      path !== "/auth/login" &&
      token === sessionStorage.getItem("staffsync-token")
    )
      window.dispatchEvent(new Event("session-expired"));
    throw new Error(data.message || "Request failed.");
  }
  return data;
}
