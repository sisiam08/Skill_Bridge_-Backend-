import { prisma } from "../../lib/prisma";

const createReview = async (reviewData: {
  bookingId: string;
  rating: number;
  comment: string;
}) => {
  const review = await prisma.reviews.create({
    data: { ...reviewData },
  });
  return review;
};

export const ReviewServices = {
  createReview,
};
