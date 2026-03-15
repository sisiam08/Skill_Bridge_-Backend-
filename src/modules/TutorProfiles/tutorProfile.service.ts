import {
  addDays,
  addHours,
  format,
  getHours,
  getMinutes,
  isEqual,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
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
  return await prisma.tutorProfiles.create({
    data: tutorData,
  });
};

const getAllProfiles = async (
  search?: string | undefined,
  category?: string | undefined,
  maxPrice?: number | undefined,
  minPrice?: number | undefined,
  page?: number,
  limit?: number,
  skip?: number,
  sortBy?: string,
  sortOrder?: string,
  availability?: number | undefined,
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
          {
            user: {
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

  if (category) {
    const categoryName = category.trim();

    andConsditions.push({
      category: {
        name: {
          contains: categoryName,
          mode: "insensitive",
        },
      },
    });
  }

  if (minPrice || maxPrice) {
    andConsditions.push({
      hourlyRate: {
        ...(minPrice && { gte: Number(minPrice) }),
        ...(maxPrice && { lte: Number(maxPrice) }),
      },
    });
  }

  if (availability) {
    andConsditions.push({
      availability: {
        some: {
          dayOfWeek: availability,
        },
      },
    });
  }

  const result = await prisma.tutorProfiles.findMany({
    skip: skip as number,
    take: limit as number,
    where: {
      AND: [...andConsditions],
      user: {
        status: "UNBAN",
      },
    },
    orderBy: {
      [sortBy as string]: sortOrder,
    },
    include: {
      user: true,
      category: true,
      availability: true,
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
        status: "UNBAN",
      },
    },
  });

  const totalPages = Math.ceil(totalData / (limit as number));

  return { data: result, pagination: { totalData, page, limit, totalPages } };
};

const getProfileById = async (id: string) => {
  return await prisma.tutorProfiles.findUnique({
    where: { id },
    include: {
      user: true,
      category: true,
      availability: true,
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
};

const getMyProfile = async (userId: string) => {
  return await prisma.tutorProfiles.findUnique({
    where: { userId },
    include: {
      user: true,
      category: true,
      availability: true,
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
};

const updateProfile = async (
  userId: string,
  tutorData: TutorProfilesUpdateInput,
) => {
  return await prisma.tutorProfiles.update({
    where: { userId },
    data: tutorData,
    include: {
      user: true,
      category: true,
      availability: true,
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
};

const deleteProfile = async (id: string) => {
  return await prisma.tutorProfiles.delete({
    where: { id },
  });
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

  return await prisma.tutorAvailability.create({
    data: {
      tutorId,
      ...availability,
    },
  });
};

const getAvailability = async (tutorId: string) => {
  return await prisma.tutorAvailability.findMany({
    where: { tutorId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "desc" }],
  });
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

  const isToday = isSameDay(date, now);

  const currentMinutes = getHours(now) * 60 + getMinutes(now);

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
  return await prisma.tutorAvailability.update({
    where: { id },
    data: availability,
  });
};

const deleteAvailability = async (id: string) => {
  return await prisma.tutorAvailability.delete({
    where: { id },
  });
};

const getBookingSessions = async (
  userId: string,
  status: BookingStatus | undefined,
) => {
  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }

  const andConditions: any = { tutorId: tutorProfile.id };

  if (status) {
    andConditions.status = status;
  }

  return await prisma.$transaction(async (tx) => {
    const today = addHours(startOfDay(new Date()), 6);
    const currentTime = format(new Date(), "HH:mm");

    await tx.bookings.updateMany({
      where: {
        OR: [
          {
            sessionDate: {
              lt: today,
            },
          },
          {
            sessionDate: {
              equals: today,
            },
            endTime: {
              lt: currentTime,
            },
          },
        ],
        status: BookingStatus.CONFIRMED,
      },
      data: {
        status: BookingStatus.CANCELLED,
      },
    });

    return await prisma.bookings.findMany({
      where: andConditions,
      orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
      include: {
        student: true,
      },
    });
  });
};

const setDefaultClassLink = async (
  userId: string,
  defaultClassLink: string,
) => {
  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  return await prisma.tutorProfiles.update({
    where: { id: tutorProfile.id },
    data: { defaultClassLink: defaultClassLink },
  });
};

const getDefaultClassLink = async (userId: string) => {
  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: { userId },
    select: { defaultClassLink: true },
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  return { defaultClassLink: tutorProfile.defaultClassLink };
};

const getTutorStats = async (userId: string) => {
  const today = addHours(startOfDay(new Date()), 6);
  const currentMonthStart = addHours(startOfMonth(new Date()), 6);
  const currentWeekStart = addHours(startOfWeek(new Date()), 6);

  return await prisma.$transaction(async (tx) => {
    const tutorProfile = await tx.tutorProfiles.findUnique({
      where: { userId },
      select: {
        id: true,
        totalRating: true,
        totalReviews: true,
        hourlyRate: true,
        experienceYears: true,
      },
    });

    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }

    const tutorId = tutorProfile.id as string;
    const [
      totalEarnings,
      monthlyEarnings,
      todayEarnings,
      totalUniqueStudents,
      activeAvailableDays,
      totalRatings,
      averageRating,
      totalReviews,
      completedSessions,
      todayCompletedSessions,
      weeklyCompletedSessions,
      canceledSessions,
      monthlyCanceledSessions,
      confirmedSessions,
    ] = await Promise.all([
      // Total Earnings
      tx.bookings.aggregate({
        where: { tutorId, status: BookingStatus.COMPLETED },
        _sum: { price: true },
      }),

      // Monthly Earnings
      tx.bookings.aggregate({
        where: {
          tutorId,
          status: BookingStatus.COMPLETED,
          sessionDate: { gte: currentMonthStart },
        },
        _sum: { price: true },
      }),

      // Today's Earnings
      tx.bookings.aggregate({
        where: {
          tutorId,
          status: BookingStatus.COMPLETED,
          sessionDate: {
            equals: today,
          },
        },
        _sum: { price: true },
      }),

      // Total Unique Students
      tx.bookings.findMany({
        where: {
          tutorId,
          status: BookingStatus.COMPLETED,
        },
        distinct: ["studentId"],
        select: { studentId: true },
      }),

      // Active Available Days
      tx.tutorAvailability.findMany({
        where: { tutorId, isActive: true },
        distinct: ["dayOfWeek"],
        select: { dayOfWeek: true },
      }),

      // Total Ratings
      tutorProfile.totalRating,

      // Average Rating
      tutorProfile.totalRating /
        (tutorProfile.totalReviews ? tutorProfile.totalReviews : 1),

      // Total Reviews
      tutorProfile.totalReviews,

      // Total Completed Sessions
      tx.bookings.count({
        where: { tutorId, status: BookingStatus.COMPLETED },
      }),

      // Today's Completed Sessions
      tx.bookings.count({
        where: {
          tutorId,
          status: BookingStatus.COMPLETED,
          sessionDate: {
            equals: today,
          },
        },
      }),

      // Weekly Completed Sessions
      tx.bookings.count({
        where: {
          tutorId,
          status: BookingStatus.COMPLETED,
          sessionDate: { gte: currentWeekStart },
        },
      }),

      // Canceled Sessions
      tx.bookings.count({
        where: { tutorId, status: BookingStatus.CANCELLED },
      }),

      // Monthly Canceled Sessions
      tx.bookings.count({
        where: {
          tutorId,
          status: BookingStatus.CANCELLED,
          sessionDate: { gte: currentMonthStart },
        },
      }),

      // Confirmed Sessions
      tx.bookings.count({
        where: { tutorId, status: BookingStatus.CONFIRMED },
      }),
    ]);

    return {
      earnings: {
        totalEarnings: totalEarnings._sum.price ?? 0,
        earningsThisMonth: monthlyEarnings._sum.price ?? 0,
        earningsToday: todayEarnings._sum.price ?? 0,
        hourlyRate: tutorProfile.hourlyRate,
      },
      profile: {
        uniqueStudents: totalUniqueStudents.length,
        experienceYears: tutorProfile.experienceYears,
        activeDays: activeAvailableDays.length,
        averageRating,
        totalRatings,
        reviewCount: totalReviews,
      },
      sessions: {
        completed: completedSessions,
        completedToday: todayCompletedSessions,
        completedThisWeek: weeklyCompletedSessions,
        cancelled: canceledSessions,
        cancelledThisMonth: monthlyCanceledSessions,
        upcoming: confirmedSessions,
      },
    };
  });
};

const getWeeklyEarnings = async (userId: string) => {
  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }

  const currentWeekStart = addHours(startOfWeek(new Date()), 6);

  const data = Array.from({ length: 7 }, async (_, i) => {
    const dayStart = addDays(currentWeekStart, i);
    const dayEnd = addDays(dayStart, 1);
    const dayName = format(dayStart, "EEE");

    const result = await prisma.bookings.aggregate({
      where: {
        tutorId: tutorProfile.id,
        status: BookingStatus.COMPLETED,
        sessionDate: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      _sum: { price: true },
    });

    return {
      weekDay: dayName,
      earnings: result._sum.price ?? 0,
    };
  });

  const weeklyEarnings = await Promise.all(data);

  return weeklyEarnings;
};

const sendClassLink = async (bookingId: string, classLink: string) => {
  const today = addHours(startOfDay(new Date()), 6);
  const currentTime = format(new Date(), "HH:mm");

  const bookings = await prisma.bookings.findUnique({
    where: { id: bookingId },
    select: { sessionDate: true, startTime: true },
  });

  if (!bookings) {
    throw new Error("Booking not found");
  }

  if (
    bookings.sessionDate > today ||
    (isEqual(bookings.sessionDate, today) && bookings.startTime > currentTime)
  ) {
    throw new Error("Cannot send class link before the session time starts.");
  }

  return await prisma.bookings.update({
    where: { id: bookingId },
    data: { status: BookingStatus.RUNNING, classLink },
  });
};

export const TutorProfileServices = {
  createProfile,
  getAllProfiles,
  getProfileById,
  getMyProfile,
  updateProfile,
  deleteProfile,
  setAvailability,
  getAvailability,
  getAvailableSlots,
  updateAvailability,
  deleteAvailability,
  getBookingSessions,
  setDefaultClassLink,
  getDefaultClassLink,
  getTutorStats,
  getWeeklyEarnings,
  sendClassLink,
};
