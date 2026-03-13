import express from "express";
import { BookingControllers } from "./booking.controller";
import { auth_middleware } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/client";

const router = express.Router();

router.post(
  "/",
  auth_middleware([UserRole.STUDENT]),
  BookingControllers.createBooking,
);

router.get(
  "/",
  auth_middleware([UserRole.ADMIN]),
  BookingControllers.getAllBookings,
);

router.get(
  "/my-bookings",
  auth_middleware([UserRole.STUDENT]),
  BookingControllers.getMyBookings,
);

router.get(
  "/:id/classLink",
  auth_middleware([UserRole.STUDENT]),
  BookingControllers.receiveClassLink,
);

router.get(
  "/:id",
  auth_middleware([UserRole.ADMIN, UserRole.STUDENT]),
  BookingControllers.getBookingDetails,
);

router.patch(
  "/:id/classLink",
  auth_middleware([UserRole.TUTOR]),
  BookingControllers.sendClassLink,
);

router.patch(
  "/:id",
  auth_middleware([UserRole.TUTOR, UserRole.STUDENT]),
  BookingControllers.updateBookingStatus,
);

export const BookingRouters = router;
