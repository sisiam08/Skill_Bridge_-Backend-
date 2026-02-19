import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getAllUsers = async () => {
  const result = await prisma.user.findMany();
  return result;
};

const updateUser = async (id: string, userStatus: UserStatus) => {
  const result = await prisma.user.update({
    where: { id },
    data: { status: userStatus },
  });
  return result;
};

export const UserServices = {
  getAllUsers,
  updateUser,
};
