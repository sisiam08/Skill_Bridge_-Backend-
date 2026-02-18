import { Request, Response } from "express";
import { CategoryServices } from "./category.service";

const createCategory = async (req: Request, res: Response) => {
  try {
    const data = await CategoryServices.createCategory(req.body);
    res.status(201).json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
};

const getAllCategories = async (req: Request, res: Response) => {
  try {
    const data = await CategoryServices.getAllCategories();
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get categories",
    });
  }
};

const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = await CategoryServices.updateCategory(id, req.body);
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update category",
    });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = await CategoryServices.deleteCategory(id);
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete category",
    });
  }
};

export const CategoryControllers = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
