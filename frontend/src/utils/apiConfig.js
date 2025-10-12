const rawBaseUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE_URL =
  (rawBaseUrl ? rawBaseUrl.replace(/\/+$/, "") : "") || "http://localhost:5000";

export default API_BASE_URL;
