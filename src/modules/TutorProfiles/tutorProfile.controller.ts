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

export const TutorProfileController = {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
};
