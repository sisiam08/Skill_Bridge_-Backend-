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
      category: true,
    },
  });

  return result;
};

const getProfileById = async (id: string) => {
  const result = await prisma.tutorProfiles.findUnique({
    where: { id },
    include: {
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
  tutorId: string,
  availability: Omit<TutorAvailability, "id" | "tutorId">,
) => {
  const result = await prisma.tutorAvailability.create({
    data: {
      tutorId,
      ...availability,
    },
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
  updateAvailability,
};
