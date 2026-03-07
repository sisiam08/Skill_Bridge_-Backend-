import { prisma } from "../../lib/prisma";

const getUserById = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
};

const updateMe = async (
  userId: string,
  data: { name?: string; phone?: string; image?: string },
) => {
  return await prisma.user.update({
    where: { id: userId },
    data,
  });
};

export const UserServices = {
  getUserById,
  updateMe,
};
