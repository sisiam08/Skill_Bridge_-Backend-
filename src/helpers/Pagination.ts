import { PaginationOptions } from "../types";

const PaginationHelper = (options: PaginationOptions) => {
  const page: number = Number(options.page) || 1;
  const limit: number = Number(options.limit) || 10;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export default PaginationHelper;
