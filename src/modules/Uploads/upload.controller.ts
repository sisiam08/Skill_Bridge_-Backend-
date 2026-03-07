import { Request, Response } from "express";
import { UploadServices } from "./upload.service";
import { Multer } from "multer";

const uploadImage = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const fileUrl = await UploadServices.uploadImage(file);


    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: { url: fileUrl },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error uploading file",
    });
  }
};

export const UploadControllers = {
  uploadImage,
};
