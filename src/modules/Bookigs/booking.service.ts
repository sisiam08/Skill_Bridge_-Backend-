import { Bookings } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createBooking = async (bookingData: Omit<Bookings, "id">) => {
  const newBooking = await prisma.bookings.create({
    data: bookingData,
  });
  return newBooking;
};
