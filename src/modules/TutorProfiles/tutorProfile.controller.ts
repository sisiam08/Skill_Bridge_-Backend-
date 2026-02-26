import { Request, Response } from "express";
import { TutorProfileServices } from "./tutorProfile.service";
import PaginationHelper from "../../helpers/Pagination";
import { PaginationOptions, SortingOptions } from "../../types";
import SortingHelper from "../../helpers/Sorting";

const createProfile = async (req: Request, res: Response) => {
  try {
    const data = await TutorProfileServices.createProfile(req.body);

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create profile",
    });
  }
};

const getAllProfiles = async (req: Request, res: Response) => {
  try {
    const search = req.query.search ? String(req.query.search) : undefined;

    const { page, limit, skip }: PaginationOptions = PaginationHelper(
      req.query,
    );

    const { sortBy, sortOrder }: SortingOptions = SortingHelper(req.query);

    const data = await TutorProfileServices.getAllProfiles(
      search,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    );

    res.status(200).json({
      success: true,
      message: "Profiles retrieved successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get profiles",
    });
  }
};

const getProfileById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = await TutorProfileServices.getProfileById(id);
    res.status(200).json({
      success: true,
      message: "Profile details retrieved successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get profile",
    });
  }
};

const updateProfile = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = await TutorProfileServices.updateProfile(id, req.body);
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

const deleteProfile = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = await TutorProfileServices.deleteProfile(id);
    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete profile",
    });
  }
};

const setAvailability = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const availability = req.body;

    const data = await TutorProfileServices.setAvailability(
      userId,
      availability,
    );

    res.status(201).json({
      success: true,
      message: "Availability set successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to set availability",
    });
  }
};

const getAvailability = async (req: Request, res: Response) => {
  try {
    const tutorId = req.params.id as string;

    const tutorProfile = await TutorProfileServices.getProfileById(tutorId);

    if (req.user?.role === "TUTOR" && req.user?.id !== tutorProfile?.user.id) {
      return res.status(403).json({
        success: false,
        message: "You dont have permission to view other tutor's availability",
      });
    }

    const data = await TutorProfileServices.getAvailability(tutorId);

    res.status(200).json({
      success: true,
      message: "Availability retrieved successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get availability",
    });
  }
};

const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const tutorId = req.params.id as string;
    const { selectedDate, slotDuration } = req.query;

    const data = await TutorProfileServices.getAvailableSlots(
      tutorId,
      selectedDate as string,
      Number(slotDuration),
    );

    res.status(200).json({
      success: true,
      message: "Available slots retrieved successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get available slots",
    });
  }
};

const updateAvailability = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const availability = req.body;

    const data = await TutorProfileServices.updateAvailability(
      id,
      availability,
    );

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update availability",
    });
  }
};

const getMeetingHistory = async (req: Request, res: Response) => {
  try {
    const tutorId = req.params.id as string;

    const tutorProfile = await TutorProfileServices.getProfileById(tutorId);

    if (req.user?.role === "TUTOR" && req.user?.id !== tutorProfile?.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "You dont have permission to view other tutor's meeting history",
      });
    }

    const data = await TutorProfileServices.getMeetingHistory(tutorId);
    res.status(200).json({
      success: true,
      message: "Meeting history retrieved successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get bookings for tutor",
    });
  }
};

export const TutorProfileControllers = {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
  setAvailability,
  getAvailability,
  getAvailableSlots,
  updateAvailability,
  getMeetingHistory,
};
