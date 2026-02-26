import express from "express";
import { UserControllers } from "./user.controller";
import { auth_middleware } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/client";

const router = express.Router();

router.get(
  "/users",
  auth_middleware([UserRole.ADMIN]),
  UserControllers.getAllUsers,
);

router.get(
  "/users/me",
  auth_middleware([UserRole.ADMIN, UserRole.TUTOR, UserRole.STUDENT]),
  UserControllers.getUserById,
);

router.patch(
  "/users/:id",
  auth_middleware([UserRole.ADMIN]),
  UserControllers.updateUser,
);

router.get(
  "/stats",
  auth_middleware([UserRole.ADMIN]),
  UserControllers.getStats,
);

export const UserRouters = router;
