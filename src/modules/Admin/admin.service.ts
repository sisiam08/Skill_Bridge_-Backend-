import { start } from "node:repl";
import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { addHours, compareAsc, startOfDay, startOfMonth } from "date-fns";

const getAllUsers = async () => {
  return await prisma.user.findMany();
};

const updateUser = async (userId: string, userStatus: UserStatus) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { status: userStatus },
  });
};

const getStats = async () => {
  return await prisma.$transaction(async (tx) => {
    const bookingsPrice = await tx.bookings.findMany({
      where: { status: "COMPLETED" },
      select: {
        sessionDate: true,
        price: true,
      },
    });

    const commissionsPerBooking = bookingsPrice.map((booking) => ({
      commission: booking.price * 0.1,
      sessionDate: booking.sessionDate,
    }));

    // console.log(bookingsPrice);
    // console.log(commissionsPerBooking);

    const currentMonthStart = addHours(startOfMonth(new Date()), 6);

    // console.log(commissionsPerBooking[0]?.sessionDate! > currentMonthStart);

    const [
      totalUsers,
      totalTutors,
      bannedTutors,
      totalStudents,
      totalBookings,
      totalBookingsCompleted,
      totalBookingsCanceled,
      totalReviews,
      totalRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      tx.user.count(),
      tx.tutorProfiles.count(),
      tx.tutorProfiles.count({ where: { user: { status: UserStatus.BAN } } }),
      tx.user.count({ where: { role: UserRole.STUDENT } }),
      tx.bookings.count(),
      tx.bookings.count({ where: { status: "COMPLETED" } }),
      tx.bookings.count({ where: { status: "CANCELLED" } }),
      tx.reviews.count(),
      commissionsPerBooking.reduce(
        (accumulator, currentbooking) =>
          accumulator + currentbooking.commission,
        0,
      ),
      commissionsPerBooking
        .filter((booking) => booking.sessionDate >  currentMonthStart)
        .reduce(
          (accumulator, currentbooking) =>
            accumulator + currentbooking.commission,
          0,
        ),
    ]);

    return {
      totalUsers,
      totalTutors,
      bannedTutors,
      totalStudents,
      totalBookings,
      totalBookingsCompleted,
      totalBookingsCanceled,
      totalReviews,
      totalRevenue,
      monthlyRevenue,
    };
  });
};

export const AdminServices = {
  getAllUsers,
  updateUser,
  getStats,
};
