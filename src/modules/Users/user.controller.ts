import { Request, Response } from "express";
import { UserServices } from "./user.service";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const data = await UserServices.getAllUsers();

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get users",
    });
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const data = await UserServices.getUserById(userId as string);

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get user",
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "You can update only the status field",
      });
    }

    const data = await UserServices.updateUser(id, status);

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update user",
    });
  }
};

const getStats = async (req: Request, res: Response) => {
  try {
    const data = await UserServices.getStats();

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get stats",
    });
  }
};

export const UserControllers = {
  getAllUsers,
  getUserById,
  updateUser,
  getStats,
};
