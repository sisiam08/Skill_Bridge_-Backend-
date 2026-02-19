import express from "express";
import { UserController } from "./user.controller";
import { auth_middleware } from "../../middleware/auth";

const router = express.Router();

router.get("/users", auth_middleware(["ADMIN"]), UserController.getAllUsers);

router.patch(
  "/users/:id",
  auth_middleware(["ADMIN"]),
  UserController.updateUser,
);

export const UserRouters = router;
