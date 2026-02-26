import { Router } from "express";
import { TutorProfileControllers } from "./tutorProfile.controller";
import { auth_middleware } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.createProfile,
);

router.get("/", TutorProfileControllers.getAllProfiles);

router.get("/:id", TutorProfileControllers.getProfileById);

router.patch(
  "/:id",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.updateProfile,
);

router.delete(
  "/:id",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.deleteProfile,
);

router.post(
  "/availability",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.setAvailability,
);

router.get(
  "/:id/availability",
  auth_middleware([UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR]),
  TutorProfileControllers.getAvailability,
);

router.get(
  "/:id/availableSlots",
  auth_middleware([UserRole.STUDENT]),
  TutorProfileControllers.getAvailableSlots,
);

router.patch(
  "/availability/:id",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.updateAvailability,
);

router.get(
  "/:id/bookings",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.getMeetingHistory,
);

export const TutorProfileRouters: Router = router;
