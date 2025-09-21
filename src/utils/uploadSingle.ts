import cloudinary from "../config/cloudinaryConfig.ts";

export async function handleUpload(filePath: string) {
  try {
    const res = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    return res;
  } catch (err) {
    throw err;
  }
}
