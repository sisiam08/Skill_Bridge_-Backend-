import { Request, Response } from "express";
import { TutorProfileServices } from "./tutorProfile.service";
import PaginationHelper from "../../helpers/Pagination";
import { PaginationOptions, SortingOptions } from "../../types";
import SortingHelper from "../../helpers/Sorting";
import { BookingStatus } from "../../../generated/prisma/enums";

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

    const category = req.query.category
      ? String(req.query.category)
      : undefined;

    const maxPrice = req.query.maxPrice
      ? Number.parseFloat(req.query.maxPrice as string)
      : undefined;
    const minPrice = req.query.minPrice
      ? Number.parseFloat(req.query.minPrice as string)
      : undefined;

    const rating = req.query.rating
      ? Number.parseFloat(req.query.rating as string)
      : undefined;

    const availability = req.query.availability
      ? Number.parseFloat(req.query.availability as string)
      : undefined;

    const { page, limit, skip }: PaginationOptions = PaginationHelper(
      req.query,
    );

    const { sortBy, sortOrder }: SortingOptions = SortingHelper(req.query);

    const data = await TutorProfileServices.getAllProfiles(
      search,
      category,
      maxPrice,
      minPrice,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
      rating,
      availability,
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

const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const data = await TutorProfileServices.getMyProfile(userId);
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
    const userId = req.user?.id as string;
    const data = await TutorProfileServices.updateProfile(userId, req.body);
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
    const userId = req.user?.id as string;
    const id = req.params.id as string;
    const availability = req.body;

    const data = await TutorProfileServices.updateAvailability(
      userId,
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
      message: error.message,
    });
  }
};

const deleteAvailability = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const data = await TutorProfileServices.deleteAvailability(id);

    res.status(200).json({
      success: true,
      message: "Availability deleted successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete availability",
    });
  }
};

const getBookingSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const status = req.query.status
      ? (req.query.status as BookingStatus)
      : undefined;

    const { page, limit, skip }: PaginationOptions = PaginationHelper(
      req.query,
    );

    const data = await TutorProfileServices.getBookingSessions(
      userId!,
      status,
      page,
      limit,
      skip,
    );
    res.status(200).json({
      success: true,
      message: "Sessions retrieved successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get sessions",
    });
  }
};

const setDefaultClassLink = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const { defaultClassLink } = req.body;
    const data = await TutorProfileServices.setDefaultClassLink(
      userId,
      defaultClassLink,
    );

    res.status(200).json({
      success: true,
      message: "Default class link set successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to set default class link",
    });
  }
};

const getDefaultClassLink = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const data = await TutorProfileServices.getDefaultClassLink(userId);

    res.status(200).json({
      success: true,
      message: "Default class link retrieved successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get default class link",
    });
  }
};

const getTutorStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const data = await TutorProfileServices.getTutorStats(userId!);

    res.status(200).json({
      success: true,
      message: "Tutor stats retrieved successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get tutor stats",
    });
  }
};

const getWeeklyEarnings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const data = await TutorProfileServices.getWeeklyEarnings(userId!);
    res.status(200).json({
      success: true,
      message: "Weekly earnings retrieved successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get weekly earnings",
    });
  }
};

const sendClassLink = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const { classLink } = req.body;
    const data = await TutorProfileServices.sendClassLink(
      bookingId as string,
      classLink as string,
    );
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Class link sent successfully",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send class link",
    });
  }
};

export const TutorProfileControllers = {
  createProfile,
  getAllProfiles,
  getProfileById,
  getMyProfile,
  updateProfile,
  deleteProfile,
  setAvailability,
  getAvailability,
  getAvailableSlots,
  updateAvailability,
  deleteAvailability,
  getBookingSessions,
  setDefaultClassLink,
  getDefaultClassLink,
  getTutorStats,
  getWeeklyEarnings,
  sendClassLink,
};
