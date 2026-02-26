import { Categories } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createCategory = async (categoryData: Omit<Categories, "id">) => {
  return await prisma.categories.create({
    data: categoryData,
  });
};

const getAllCategories = async () => {
  return await prisma.categories.findMany({
    where: { isActive: true },
  });
};

const updateCategory = async (
  id: string,
  categoryData: Omit<Categories, "id">,
) => {
  return await prisma.categories.update({
    where: { id },
    data: categoryData,
  });
};

const deleteCategory = async (id: string) => {
  return await prisma.categories.update({
    where: { id },
    data: { isActive: false },
  });
};

export const CategoryServices = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
