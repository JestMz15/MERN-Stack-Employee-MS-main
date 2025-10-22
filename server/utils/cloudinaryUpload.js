import streamifier from "streamifier";
import cloudinary from "./cloudinary.js";

export const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "humana",
        resource_type: "auto",
        ...options,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      },
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

export const deleteAsset = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
  } catch {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    } catch {
      // ignore
    }
  }
};
