import { Express } from "express";
import { ApiError } from "./ApiError.ts";
import cloudinary from "../config/cloudinaryConfig.ts";

export async function uploadImagesToCloudinary(
  files: Express.Multer.File[]
): Promise<{ url: string }[]> {
  if (!files || files.length === 0) {
    return [];
  }

  const uploadPromises = files.map(async (file, index) => {
    if (!file.buffer || file.buffer.length === 0) {
      throw new ApiError(400, `File[${index}] ${file.originalname} is empty`);
    }

    const dataURI = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    try {
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
      });

      return { url: result.secure_url };
    } catch (err) {
      throw new ApiError(500, `Failed to upload file ${file.originalname}`);
    }
  });

  return await Promise.all(uploadPromises);
}
