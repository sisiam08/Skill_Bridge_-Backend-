import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const uploadImage = async (file: Express.Multer.File) => {
  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const fileName = `image-${file.originalname}-${Date.now()}`;
  
  const filePath = join(uploadDir, fileName);

  await writeFile(filePath, file.buffer);

  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:5000";
  return `${baseUrl}/uploads/${fileName}`;
};


export const UploadServices = {
  uploadImage,
};