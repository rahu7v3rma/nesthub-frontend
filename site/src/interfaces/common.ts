export interface ApiResponse<T> {
  success: boolean;
  message: string;
  code: string;
  status: number;
  data: T;
}
