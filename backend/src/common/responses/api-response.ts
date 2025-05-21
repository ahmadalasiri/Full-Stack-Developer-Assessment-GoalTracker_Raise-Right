export class ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;

  static success<T>(data: T, message?: string): ApiResponse<T> {
    const response = new ApiResponse<T>();
    response.success = true;
    response.data = data;
    if (message) {
      response.message = message;
    }
    return response;
  }

  static error<T>(error: string): ApiResponse<T> {
    const response = new ApiResponse<T>();
    response.success = false;
    response.error = error;
    return response;
  }
}
