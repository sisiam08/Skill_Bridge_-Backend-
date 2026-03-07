import { Request, Response } from "express";
import { AdminServices } from "./admin.service";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const data = await AdminServices.getAllUsers();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get users",
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

    const data = await AdminServices.updateUser(id, status);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data,
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
    const data = await AdminServices.getStats();

    res.status(200).json({
      success: true,
      message: "Stats retrieved successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get stats",
    });
  }
};

export const AdminControllers = {
  getAllUsers,
  updateUser,
  getStats,
};