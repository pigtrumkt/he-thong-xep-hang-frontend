export const API_BASE = (() => {
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3001`;
  }
  return "http://localhost:3001"; // fallback khi SSR (nếu cần)
})();

export function apiGet(path: string) {
  return apiRequest("GET", path);
}

export function apiPost(path: string, body: any) {
  return apiRequest("POST", path, body);
}

async function apiRequest(method: "GET" | "POST", path: string, body?: any) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 giây

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const contentType = res.headers.get("content-type");
    const json = contentType?.includes("application/json")
      ? await res.json().catch(() => ({}))
      : {};

    return {
      status: res.status,
      data: json || null,
    };
  } catch (error) {
    clearTimeout(timeout);
    return { status: 0, data: null };
  }
}
