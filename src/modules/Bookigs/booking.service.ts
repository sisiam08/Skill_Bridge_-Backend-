import { BookingStatus } from "../../../generated/prisma/enums";
import { calculateTutionPrice } from "../../helpers/CalculateTutionPrice";
import {
  fitsInAvailabilitySlot,
  isOverlapping,
  timeDuration,
  validateBookingDateTime,
} from "../../helpers/TimeHelpers";
import { prisma } from "../../lib/prisma";

const createBooking = async (
  studentId: string,
  bookingData: {
    tutorId: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
  },
) => {
  return await prisma.$transaction(async (tx) => {
    const { tutorId, sessionDate, startTime, endTime } = bookingData;

    const date = new Date(sessionDate);
    const dayOfWeek = date.getDay();
    const slotDuration = timeDuration(startTime, endTime);

    validateBookingDateTime(date, startTime);

    const availabilitySlots = await tx.tutorAvailability.findMany({
      where: {
        tutorId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!availabilitySlots.length) {
      throw new Error("Tutor not available on this day");
    }

    if (!fitsInAvailabilitySlot({ startTime, endTime }, availabilitySlots)) {
      throw new Error("Selected time outside of tutor availability");
    }

    const existingBookings = await tx.bookings.findMany({
      where: {
        tutorId,
        sessionDate: date,
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    if (isOverlapping({ startTime, endTime }, existingBookings)) {
      throw new Error("Slot already booked");
    }

    const tutor = await tx.tutorProfiles.findUnique({
      where: { id: tutorId },
      select: { hourlyRate: true },
    });

    if (!tutor) {
      throw new Error("Tutor not found");
    }

    const price = calculateTutionPrice(slotDuration, tutor.hourlyRate);

    return await tx.bookings.create({
      data: {
        studentId,
        tutorId,
        sessionDate: date,
        startTime,
        endTime,
        price,
      },
    });
  });
};

const getAllBookings = async () => {
  return await prisma.bookings.findMany({
    include: {
      tutor: {
        include: {
          user: true,
          category: true,
        },
      },
    },
  });
};

const getMyBookings = async (studentId: string) => {
  return await prisma.bookings.findMany({
    where: {
      studentId: studentId,
    },
    include: {
      tutor: {
        include: {
          user: true,
          category: true,
        },
      },
      reviews: true,
    },
  });
};

const getBookingDetails = async (bookingId: string) => {
  return await prisma.bookings.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      tutor: {
        include: {
          user: true,
          category: true,
        },
      },
      reviews: true,
    },
  });
};

const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus,
) => {
  return await prisma.bookings.update({
    where: { id: bookingId },
    data: { status },
  });
};

export const BookingServices = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingDetails,
  updateBookingStatus,
};
