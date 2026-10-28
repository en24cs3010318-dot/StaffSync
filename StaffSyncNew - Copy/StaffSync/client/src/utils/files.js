export function download(name, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function downloadDocument(api, userId) {
  const file = await api("/employee-profile/" + userId + "/document");
  const bytes = Uint8Array.from(atob(file.data), (c) => c.charCodeAt(0));
  download(file.name, new Blob([bytes], { type: file.type }));
}
// Prefix formula-like cells so spreadsheet software treats user text as data.
export function csv(headers, rows) {
  const escape = (value) =>
    '"' +
    String(value ?? "")
      .replace(/^[=+@\-\t\r]/, "'$&")
      .replaceAll('"', '""') +
    '"';
  return [headers, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}
