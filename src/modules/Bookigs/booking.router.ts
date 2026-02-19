import express from "express";
import { BookingController } from "./booking.controller";
import { auth_middleware } from "../../middleware/auth";

const router = express.Router();

router.post("/", auth_middleware(["STUDENT"]), BookingController.createBooking);

export const BookingRouters = router;
