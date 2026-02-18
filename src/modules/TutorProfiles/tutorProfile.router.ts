import { Router } from "express";
import { TutorProfileController } from "./tutorProfile.controller";

const router = Router();

router.post("/", TutorProfileController.createProfile);

router.get("/", TutorProfileController.getAllProfiles);

router.get("/:id", TutorProfileController.getProfileById);

router.patch("/:id", TutorProfileController.updateProfile);

router.delete("/:id", TutorProfileController.deleteProfile);

export const TutorProfileRouters: Router = router;
