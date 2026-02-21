import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getAllUsers = async () => {
  const result = await prisma.user.findMany();
  return result;
};

const getUserById = async (userId: string) => {
  const result = await prisma.user.findUnique({
    where: { id: userId },
  });
  return result;
};

const updateUser = async (userId: string, userStatus: UserStatus) => {
  const result = await prisma.user.update({
    where: { id: userId },
    data: { status: userStatus },
  });
  return result;
};

export const UserServices = {
  getAllUsers,
  getUserById,
  updateUser,
};
