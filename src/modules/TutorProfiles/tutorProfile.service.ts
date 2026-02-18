import { TutorProfilesCreateInput } from "../../../generated/prisma/models";
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
  tutorData: TutorProfilesCreateInput,
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

export const TutorProfileServices = {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
};
