import { Request, Response } from "express";
import { BookingService } from "./booking.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const studentId = req.user.id;
    const bookingData = req.body;

    const data = await BookingService.createBooking(
      studentId as string,
      bookingData,
    );

    return res.status(201).json({
      success: true,
      message: "Booking completed successfully",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Booking failed",
    });
  }
};

const getBookings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const studentId = req.user.id;
    const bookings = await BookingService.getBookings(studentId);

    return res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: bookings,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve bookings",
    });
  }
};

const getBookingDetails = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const bookingDetails = await BookingService.getBookingDetails(
      bookingId as string,
    );

    if (!bookingDetails) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking details retrieved successfully",
      data: bookingDetails,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve booking details",
    });
  }
};

export const BookingController = {
  createBooking,
  getBookings,
  getBookingDetails,
};
