export interface SearchTableState<T> {
  pageIndex: number;
  pageSize: number;
  data: T[];
  total: number;

  [key: string]: any;
}
