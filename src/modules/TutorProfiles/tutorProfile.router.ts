import { Router } from "express";
import { TutorProfileController } from "./tutorProfile.controller";
import { auth_middleware } from "../../middleware/auth";

const router = Router();

router.post(
  "/",
  auth_middleware(["TUTOR"]),
  TutorProfileController.createProfile,
);

router.get(
  "/",
  auth_middleware(["ADMIN", "STUDENT"]),
  TutorProfileController.getAllProfiles,
);

router.get(
  "/:id",
  auth_middleware(["ADMIN", "STUDENT"]),
  TutorProfileController.getProfileById,
);

router.patch(
  "/:id",
  auth_middleware(["TUTOR"]),
  TutorProfileController.updateProfile,
);

router.delete(
  "/:id",
  auth_middleware(["TUTOR"]),
  TutorProfileController.deleteProfile,
);

router.post(
  "/availability",
  auth_middleware(["TUTOR"]),
  TutorProfileController.setAvailability,
);

router.get(
  "/:id/availability",
  auth_middleware(["ADMIN", "STUDENT", "TUTOR"]),
  TutorProfileController.getAvailability,
);

router.get(
  "/:id/availableSlots",
  auth_middleware(["STUDENT"]),
  TutorProfileController.getAvailableSlots,
);

router.patch(
  "/availability/:id",
  auth_middleware(["TUTOR"]),
  TutorProfileController.updateAvailability,
);

export const TutorProfileRouters: Router = router;
