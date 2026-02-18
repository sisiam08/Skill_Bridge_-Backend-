import { Categories } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createCategory = async (categoryData: Omit<Categories, "id">) => {
  const data = await prisma.categories.create({
    data: categoryData,
  });

  return data;
};

const getAllCategories = async () => {
  const data = await prisma.categories.findMany();
  return data;
};

const updateCategory = async (
  id: string,
  categoryData: Omit<Categories, "id">,
) => {
  const data = await prisma.categories.update({
    where: { id },
    data: categoryData,
  });

  return data;
};

const deleteCategory = async (id: string) => {
  const data = await prisma.categories.update({
    where: { id },
    data: { isActive: false },
  });

  return data;
};

export const CategoryServices = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
