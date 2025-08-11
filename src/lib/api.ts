export const API_BASE = (() => {
  const port = `${process.env.NEXT_PUBLIC_API_PORT}`;
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:${port}`;
  }

  return `http://localhost:${port}`; // dùng cho SSR
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
