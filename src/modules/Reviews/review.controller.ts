import { Request, Response } from "express";
import { ReviewServices } from "./review.service";

const createReview = async (req: Request, res: Response) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const data = await ReviewServices.createReview({
      bookingId,
      rating,
      comment,
    });
    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create review.",
    });
  }
};

const getAllReviews = async (req: Request, res: Response) => {
  try {
    const data = await ReviewServices.getAllReviews();
    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reviews.",
    });
  }
};

const getAllReviewsForTutor = async (req: Request, res: Response) => {
  try {
    const tutorId = req.params.id as string;

    const data = await ReviewServices.getAllReviewsForTutor(tutorId);

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reviews.",
    });
  }
};

export const ReviewControllers = {
  createReview,
  getAllReviews,
  getAllReviewsForTutor,
};
