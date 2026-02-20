import { Request, Response } from "express";
import { TutorProfileServices } from "./tutorProfile.service";
import { string } from "better-auth/*";

const createProfile = async (req: Request, res: Response) => {
  try {
    const data = await TutorProfileServices.createProfile(req.body);

    res.status(201).json({
      success: true,
      message: data,
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
    const data = await TutorProfileServices.getAllProfiles();

    res.status(200).json({
      success: true,
      data: data,
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
      data: data,
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
      data: data,
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
      data: data,
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
      data: data,
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
      data: data,
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
      data: data,
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
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update availability",
    });
  }
};

const getBookingsForTutor = async (req: Request, res: Response) => {
  try {
    const tutorId = req.params.id as string;

    const tutorProfile = await TutorProfileServices.getProfileById(tutorId);

    if (req.user?.role === "TUTOR" && req.user?.id !== tutorProfile?.user.id) {
      return res.status(403).json({
        success: false,
        message: "You dont have permission to view other tutor's meeting history",
      });
    }

    const data = await TutorProfileServices.getBookingsForTutor(
      tutorId,
    );
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get bookings for tutor",
    });
  }
};

export const TutorProfileController = {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
  setAvailability,
  getAvailability,
  getAvailableSlots,
  updateAvailability,
  getBookingsForTutor,
};
