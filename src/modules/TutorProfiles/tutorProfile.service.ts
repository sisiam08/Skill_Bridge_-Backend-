import { number, string } from "better-auth/*";
import { BookingStatus } from "../../../generated/prisma/enums";
import {
  TutorAvailabilityUpdateInput,
  TutorProfilesCreateInput,
  TutorProfilesUpdateInput,
} from "../../../generated/prisma/models";
import { calculateTutionPrice } from "../../helpers/CalculateTutionPrice";
import {
  isOverlapping,
  minutesToTime,
  subtractBookedFromFreeSlots,
  timeToMinutes,
  validateBookingDateTime,
} from "../../helpers/TimeHelpers";
import { prisma } from "../../lib/prisma";

const createProfile = async (tutorData: TutorProfilesCreateInput) => {
  const result = await prisma.tutorProfiles.create({
    data: tutorData,
  });

  return result;
};

const getAllProfiles = async (
  search?: string | undefined,
  page?: number,
  limit?: number,
  skip?: number,
  sortBy?: string,
  sortOrder?: string,
) => {
  const andConsditions: any[] = [];

  if (search) {
    search = search.trim();

    const numberSearch = Number(search);

    if (Number.isNaN(numberSearch)) {
      andConsditions.push({
        OR: [
          {
            bio: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            category: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ],
      });
    } else {
      andConsditions.push({
        OR: [
          {
            hourlyRate: {
              gte: numberSearch,
            },
          },
          {
            totalRating: {
              gte: numberSearch,
            },
          },
        ],
      });
    }
  }

  const result = await prisma.tutorProfiles.findMany({
    skip: skip as number,
    take: limit as number,
    where: {
      AND: [...andConsditions],
      user: {
        status: "ACTIVE",
      },
    },
    orderBy: {
      [sortBy as string]: sortOrder,
    },
    include: {
      user: true,
      category: true,
      bookings: {
        where: { status: BookingStatus.COMPLETED },
        include: {
          reviews: {
            select: {
              rating: true,
              comment: true,
            },
          },
        },
      },
    },
  });

  const totalData = await prisma.tutorProfiles.count({
    where: {
      AND: [...andConsditions],
      user: {
        status: "ACTIVE",
      },
    },
  });

  const totalPages = Math.ceil(totalData / (limit as number));

  return { data: result, pagination: { totalData, page, limit, totalPages } };
};

const getProfileById = async (id: string) => {
  const result = await prisma.tutorProfiles.findUnique({
    where: { id },
    include: {
      user: true,
      category: true,
    },
  });

  return result;
};

const updateProfile = async (
  id: string,
  tutorData: TutorProfilesUpdateInput,
) => {
  const result = await prisma.tutorProfiles.update({
    where: { id },
    data: tutorData,
    include: {
      user: true,
      category: true,
    },
  });

  return result;
};

const deleteProfile = async (id: string) => {
  const result = await prisma.tutorProfiles.delete({
    where: { id },
  });

  return result;
};

const setAvailability = async (
  userId: string,
  availability: { dayOfWeek: number; startTime: string; endTime: string },
) => {
  const { dayOfWeek, startTime, endTime } = availability;

  const StartMin = timeToMinutes(startTime);
  const EndMin = timeToMinutes(endTime);

  if (EndMin <= StartMin) {
    throw new Error("Invalid time range");
  }

  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }

  const tutorId = tutorProfile.id;

  const exixtingSlots = await prisma.tutorAvailability.findMany({
    where: {
      tutorId,
      dayOfWeek,
    },
  });

  if (isOverlapping({ startTime, endTime }, exixtingSlots)) {
    throw new Error("Overlapping availability slots");
  }

  const result = await prisma.tutorAvailability.create({
    data: {
      tutorId,
      ...availability,
    },
  });

  return result;
};

const getAvailability = async (tutorId: string) => {
  const result = await prisma.tutorAvailability.findMany({
    where: { tutorId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "desc" }],
  });

  return result;
};

const getAvailableSlots = async (
  tutorId: string,
  selectedDate: string,
  slotDuration: number,
) => {
  const date = new Date(selectedDate);
  const dayOfWeek = date.getDay();

  validateBookingDateTime(date);

  const availabilitySlots = await prisma.tutorAvailability.findMany({
    where: {
      tutorId,
      dayOfWeek,
      isActive: true,
    },
  });

  if (!availabilitySlots.length) {
    throw new Error("Tutor not available on this day");
  }

  const tutorSlots = await prisma.tutorAvailability.findMany({
    where: {
      tutorId,
      dayOfWeek,
      isActive: true,
    },
    orderBy: { startTime: "asc" },
  });

  const bookedSlots = await prisma.bookings.findMany({
    where: {
      tutorId,
      sessionDate: date,
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  let availableSlots: { startTime: string; endTime: string }[] = [];

  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  tutorSlots.forEach((slot) => {
    const freeRanges = subtractBookedFromFreeSlots(
      { startTime: slot.startTime, endTime: slot.endTime },
      bookedSlots,
    );
    freeRanges.forEach((freeSlot) => {
      let freeStartMin = timeToMinutes(freeSlot.startTime);
      let freeEndMin = timeToMinutes(freeSlot.endTime);

      if (isToday) {
        if (freeEndMin <= currentMinutes) {
          return;
        } else if (freeStartMin < currentMinutes) {
          freeStartMin = currentMinutes;
        }
      }

      let currentStart = freeStartMin;

      while (currentStart + slotDuration <= freeEndMin) {
        const endMin = currentStart + slotDuration;

        availableSlots.push({
          startTime: minutesToTime(currentStart),
          endTime: minutesToTime(endMin),
        });

        currentStart = currentStart + 60;
      }
    });
  });

  availableSlots.sort((a, b) => {
    const aStart = timeToMinutes(a.startTime);
    const bStart = timeToMinutes(b.startTime);
    return aStart - bStart;
  });

  const tutor = await prisma.tutorProfiles.findUnique({
    where: { id: tutorId },
    select: { hourlyRate: true },
  });

  if (!tutor) {
    throw new Error("Tutor not found");
  }

  const price = calculateTutionPrice(slotDuration, tutor.hourlyRate);

  return { dayOfWeek, availableSlots, price };
};

const updateAvailability = async (
  id: string,
  availability: TutorAvailabilityUpdateInput,
) => {
  const result = await prisma.tutorAvailability.update({
    where: { id },
    data: availability,
  });

  return result;
};

const getMeetingHistory = async (tutorId: string) => {
  const result = await prisma.bookings.findMany({
    where: { tutorId },
    include: {
      student: true,
    },
  });
  return result;
};

export const TutorProfileServices = {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
  setAvailability,
  getAvailability,
  getAvailableSlots,
  updateAvailability,
  getMeetingHistory,
};
