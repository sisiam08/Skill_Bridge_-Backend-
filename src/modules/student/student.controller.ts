import { Request, Response } from "express";
import { StudentServices } from "./student.service";

const getStudentStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const data = await StudentServices.getStudentStats(userId!);

    return res.status(200).json({
      success: true,
      message: "Stats retrieved successfully",
      data: data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve stats",
    });
  }
};

const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const data = await StudentServices.getRecentActivity(userId!);

    return res.status(200).json({
      success: true,
      message: "Recent activity retrieved successfully",
      data: data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve recent activity",
    });
  }
};

export const StudentControllers = {
  getStudentStats,
  getRecentActivity,
};
