import { v2 as cloudinary } from "cloudinary";

const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingVars = requiredEnvVars.filter(
  (envKey) => !process.env[envKey] || process.env[envKey].trim() === "",
);

if (missingVars.length > 0) {
  console.error(
    `[cloudinary] Falta configurar las variables de entorno: ${missingVars.join(
      ", ",
    )}. Verifica tu archivo .env en /server antes de intentar subir archivos.`,
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
