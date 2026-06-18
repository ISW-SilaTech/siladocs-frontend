import api from '@/shared/config/axios';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string;
  institutionName?: string;
  language?: string;
  timezone?: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  language?: string;
  timezone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const ProfileService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await api.put<UserProfile>('/users/profile', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.post('/users/change-password', data);
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ avatarUrl: string }>('/users/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
