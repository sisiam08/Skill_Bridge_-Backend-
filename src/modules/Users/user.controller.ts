import { Request, Response } from "express";
import { UserServices } from "./user.service";

const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const data = await UserServices.getUserById(userId as string);

    res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get user",
    });
  }
};

const updateMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const { name, phone, image } = req.body;

    const data = await UserServices.updateMe(userId, { name, phone, image });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

export const UserControllers = {
  getUserById,
  updateMe,
};
