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
  auth_middleware([UserRole.STUDENT]),
  BookingControllers.getBookings,
);

router.get(
  "/:id",
  auth_middleware([UserRole.STUDENT]),
  BookingControllers.getBookingDetails,
);

export const BookingRouters = router;
