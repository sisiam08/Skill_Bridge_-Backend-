import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getAllUsers = async () => {
  return await prisma.user.findMany();
};

const getUserById = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
};

const updateUser = async (userId: string, userStatus: UserStatus) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { status: userStatus },
  });
};

const getStats = async () => {
  return await prisma.$transaction(async (tx) => {
    const [
      totalUsers,
      totalTutors,
      bannedTutors,
      totalStudents,
      totalBookings,
      totalReviews,
    ] = await Promise.all([
      tx.user.count(),
      tx.tutorProfiles.count(),
      tx.tutorProfiles.count({ where: { user: { status: UserStatus.BAN } } }),
      tx.user.count({ where: { role: UserRole.STUDENT } }),
      tx.bookings.count(),
      tx.reviews.count(),
    ]);

    return {
      totalUsers,
      totalTutors,
      bannedTutors,
      totalStudents,
      totalBookings,
      totalReviews,
    };
  });
};

export const UserServices = {
  getAllUsers,
  getUserById,
  updateUser,
  getStats,
};
