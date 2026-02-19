import { TutorAvailability } from "../../../generated/prisma/client";
import {
  TutorAvailabilityUpdateInput,
  TutorProfilesCreateInput,
  TutorProfilesUpdateInput,
} from "../../../generated/prisma/models";
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
  availability: Omit<TutorAvailability, "id" | "tutorId">,
) => {
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

const getAvailabilityByTutorId = async (tutorId: string) => {
  const result = await prisma.tutorAvailability.findMany({
    where: { tutorId },
  });

  return result;
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
  getAvailabilityByTutorId,
  updateAvailability,
};
