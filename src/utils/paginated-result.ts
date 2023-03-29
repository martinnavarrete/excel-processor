type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  size: number;
};

export default PaginatedResult;
