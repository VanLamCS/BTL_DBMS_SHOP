export class ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: {
    code: number;
    details?: string;
  };

  constructor(
    status: 'success' | 'error',
    data?: T,
    message?: string,
    errorCode?: number,
    errorDetails?: string,
  ) {
    this.status = status;
    if (status === 'success') {
      this.data = data;
      this.message = message || 'Success';
    } else {
      this.error = {
        code: errorCode || 500,
        details: errorDetails,
      };
      this.message = message || 'Internal Server Error';
    }
  }

  static success<T>(data?: T, message?: string): ApiResponse<T> {
    return new ApiResponse<T>('success', data, message);
  }

  static error<T>(
    code: number,
    message?: string,
    details?: string,
  ): ApiResponse<T> {
    return new ApiResponse<T>('error', undefined, message, code, details);
  }
}
