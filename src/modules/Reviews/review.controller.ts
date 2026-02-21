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

export const ReviewControllers = {
  createReview,
};
