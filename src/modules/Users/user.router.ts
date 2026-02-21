import express from "express";
import { UserController } from "./user.controller";
import { auth_middleware } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/client";

const router = express.Router();

router.get(
  "/users",
  auth_middleware([UserRole.ADMIN]),
  UserController.getAllUsers,
);

router.get(
  "/users/me",
  auth_middleware([UserRole.ADMIN, UserRole.TUTOR, UserRole.STUDENT]),
  UserController.getUserById,
);

router.patch(
  "/users/:id",
  auth_middleware([UserRole.ADMIN]),
  UserController.updateUser,
);

export const UserRouters = router;
