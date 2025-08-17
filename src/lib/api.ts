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

export function apiPost(path: string, body: any, noTimeout = false) {
  return apiRequest("POST", path, body, noTimeout);
}

async function apiRequest(
  method: "GET" | "POST",
  path: string,
  body?: any,
  noTimeout = false
) {
  const controller = new AbortController();
  const timeout = !noTimeout
    ? setTimeout(() => controller.abort(), 10000) // chỉ timeout nếu không bỏ qua
    : null;

  try {
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers:
        !isFormData && body
          ? { "Content-Type": "application/json" }
          : undefined,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      credentials: "include",
      signal: controller.signal,
    });

    if (timeout) clearTimeout(timeout);

    const contentType = res.headers.get("content-type");
    const json = contentType?.includes("application/json")
      ? await res.json().catch(() => ({}))
      : {};

    return {
      status: res.status,
      data: json || null,
    };
  } catch (error) {
    if (timeout) clearTimeout(timeout);
    return { status: 0, data: null };
  }
}

export function apiUploadWithProgress(
  path: string,
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<{ status: number; data: any }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}${path}`, true);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = (event.loaded / event.total) * 100;
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      let json = {};
      try {
        json = JSON.parse(xhr.responseText);
      } catch (err) {}

      resolve({
        status: xhr.status,
        data: json,
      });
    };

    xhr.onerror = () => {
      resolve({ status: 0, data: null });
    };

    xhr.send(formData);
  });
}
