import { SortingOptions } from "../types";

const SortingHelper = (options: SortingOptions) => {
  const sortBy: string = options.sortBy || "totalRating";
  const sortOrder: string = options.sortOrder || "desc";

  return { sortBy, sortOrder };
};

export default SortingHelper;
