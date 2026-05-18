const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://careerguide-ai-7s24.onrender.com/api"
    : "http://localhost:5000/api");

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("cg_token");
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type");
    const data =
      contentType && contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
      const message =
        typeof data === "object" && data?.message
          ? data.message
          : typeof data === "string" && data
          ? data
          : "Something went wrong";

      throw new Error(message);
    }

    return data;
  } catch (error) {
    throw new Error(
      error.message || "Backend server not reachable. Please try again."
    );
  }
}
