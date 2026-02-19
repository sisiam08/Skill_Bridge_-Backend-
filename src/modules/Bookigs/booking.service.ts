import { Bookings } from "../../../generated/prisma/client";
import { BookingsCreateInput } from "../../../generated/prisma/models";
import { timeToMinutes } from "../../helpers/TimeConversion";
import { prisma } from "../../lib/prisma";

const createBooking = async (
  studentId: string,
  tutorId: string,
  bookingData: {
    sessionDate: string;
    startTime: string;
    endTime: string;
    price: number;
  },
) => {
  const { sessionDate, startTime, endTime, price } = bookingData;

  const date = new Date(sessionDate);

  const result = await prisma.bookings.create({
    data: {
      studentId,
      tutorId,
      sessionDate: date,
      startTime,
      endTime,
      price,
    },
  });
  return result;
};

const getBookings = async (studentId: string) => {
  return await prisma.bookings.findMany({
    where: {
      studentId: studentId,
    },
  });
};

export const BookingService = {
  createBooking,
  getBookings,
};
