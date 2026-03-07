import express from "express";
import { auth_middleware } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/client";
import { UserControllers } from "./user.controller";

const router = express.Router();

router.get(
  "/me",
  auth_middleware([UserRole.ADMIN, UserRole.TUTOR, UserRole.STUDENT]),
  UserControllers.getUserById,
);

router.patch(
  "/me",
  auth_middleware([UserRole.ADMIN, UserRole.TUTOR, UserRole.STUDENT]),
  UserControllers.updateMe,
);

router.patch(
  "/me/password",
  auth_middleware([UserRole.ADMIN, UserRole.TUTOR, UserRole.STUDENT]),
  UserControllers.updatePassword,
);

export const UserRouters = router;
