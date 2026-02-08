import { ApiResponse } from "./interfaces/api-response";
  
const responseJson = <T>(data: T, message?: string): ApiResponse<T> => ({
    status: 'success',
    data,
    message,
});
  
  
export { responseJson };
  