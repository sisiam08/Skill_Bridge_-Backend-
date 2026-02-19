import express from "express";
import { BookingController } from "./booking.controller";
import { auth_middleware } from "../../middleware/auth";

const router = express.Router();

router.post("/", auth_middleware(["STUDENT"]), BookingController.createBooking);

router.get("/", auth_middleware(["STUDENT"]), BookingController.getBookings);

router.get("/:id", auth_middleware(["STUDENT"]), BookingController.getBookingDetails);

export const BookingRouters = router;
