import { apiClient } from './client';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ApiResponse,
  User 
} from '@donedep/shared';

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/auth/logout');
    return response.data;
  },

  async verifyEmail(token: string): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/auth/verify-email', { token });
    return response.data;
  },

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/auth/reset-password', { token, password });
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },
};
