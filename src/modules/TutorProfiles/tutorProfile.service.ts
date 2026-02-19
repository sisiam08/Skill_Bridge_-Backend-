import { SortOrder } from "../../../generated/prisma/internal/prismaNamespace";
import {
  TutorAvailabilityUpdateInput,
  TutorProfilesCreateInput,
  TutorProfilesUpdateInput,
} from "../../../generated/prisma/models";
import { calculateTutionPrice } from "../../helpers/CalculateTutionPrice";
import {
  minutesToTime,
  subtractBookedFromFreeSlots,
  timeDuration,
  timeToMinutes,
} from "../../helpers/TimeHelpers";
import { prisma } from "../../lib/prisma";

const createProfile = async (tutorData: TutorProfilesCreateInput) => {
  const result = await prisma.tutorProfiles.create({
    data: tutorData,
  });

  return result;
};

const getAllProfiles = async () => {
  const result = await prisma.tutorProfiles.findMany({
    include: {
      user: true,
      category: true,
    },
  });

  return result;
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

  tutorSlots.forEach((slot) => {
    const freeRanges = subtractBookedFromFreeSlots(
      { startTime: slot.startTime, endTime: slot.endTime },
      bookedSlots,
    );
    freeRanges.forEach((freeSlot) => {
      const freeStartMin = timeToMinutes(freeSlot.startTime);
      const freeEndMin = timeToMinutes(freeSlot.endTime);

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
};
