import express, { Application } from "express";
import { CategoryControllers } from "./category.controller";

const router = express.Router();

router.post("/", CategoryControllers.createCategory);

router.get("/", CategoryControllers.getAllCategories);

router.patch("/:id", CategoryControllers.updateCategory);

router.delete("/:id", CategoryControllers.deleteCategory);

export const CategoryRouters = router;
