import { prisma } from "../../lib/prisma";

const createReview = async (reviewData: {
  bookingId: string;
  rating: number;
  comment: string;
}) => {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.bookings.findUnique({
      where: { id: reviewData.bookingId },
      select: { tutorId: true },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    await tx.tutorProfiles.update({
      where: { id: booking.tutorId },
      data: {
        totalReviews: {
          increment: 1,
        },
        totalRating: {
          increment: reviewData.rating,
        },
      },
    });

    return await tx.reviews.create({
      data: { ...reviewData },
    });
  });
};

const getAllReviews = async () => {
  return await prisma.reviews.findMany();
};


const getAllReviewsForTutor = async (tutorId: string) => {
  return await prisma.reviews.findMany({
    where: { booking: { tutorId } },
  });
};

export const ReviewServices = {
  createReview,
  getAllReviews,
  getAllReviewsForTutor,
};
