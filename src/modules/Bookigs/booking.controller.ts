import { Request, Response } from "express";
import { BookingServices } from "./booking.service";

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

    const data = await BookingServices.createBooking(
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

const getAllBookings = async (req: Request, res: Response) => {
  try {
    const data = await BookingServices.getAllBookings();

    return res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve bookings",
    });
  }
};

const getMyBookings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const studentId = req.user.id;
    const data = await BookingServices.getMyBookings(studentId);

    return res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data,
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
    const data = await BookingServices.getBookingDetails(bookingId as string);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking details retrieved successfully",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve booking details",
    });
  }
};

const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;
    const data = await BookingServices.updateBookingStatus(
      bookingId as string,
      status,
    );
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update booking status",
    });
  }
};

export const BookingControllers = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingDetails,
  updateBookingStatus,
};
