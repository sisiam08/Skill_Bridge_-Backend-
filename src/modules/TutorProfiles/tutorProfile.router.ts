import { Router } from "express";
import { TutorProfileController } from "./tutorProfile.controller";

const router = Router();

router.post("/", TutorProfileController.createProfile);

router.get("/", TutorProfileController.getAllProfiles);

router.get("/:id", TutorProfileController.getProfileById);

router.patch("/:id", TutorProfileController.updateProfile);

router.delete("/:id", TutorProfileController.deleteProfile);

router.post("/:id/availability", TutorProfileController.setAvailability);

router.patch("/availability/:id", TutorProfileController.updateAvailability);


export const TutorProfileRouters: Router = router;
