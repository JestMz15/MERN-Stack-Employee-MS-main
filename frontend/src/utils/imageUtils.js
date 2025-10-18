import API_BASE_URL from "./apiConfig";

const RAW_PLACEHOLDER_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' rx='16' fill='#e2e8f0'/><text x='50%' y='55%' text-anchor='middle' font-family='Arial, sans-serif' font-size='32' fill='#64748b'>No Img</text></svg>`;

export const FALLBACK_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(
  RAW_PLACEHOLDER_SVG
)}`;

export const resolveImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string") {
    return null;
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  let normalizedPath = imagePath.replace(/\\/g, "/").replace(/^\/+/, "");

  if (normalizedPath.startsWith("public/")) {
    normalizedPath = normalizedPath.slice("public/".length);
  }

  if (normalizedPath.startsWith("uploads/")) {
    normalizedPath = normalizedPath.slice("uploads/".length);
  }

  return `${API_BASE_URL}/${normalizedPath}`;
};

