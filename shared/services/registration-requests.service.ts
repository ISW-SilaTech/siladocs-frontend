import api from '@/shared/config/axios';
import adminApi from '@/shared/config/axios-admin';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface RegistrationRequest {
  id: string;
  fullName: string;
  email: string;
  institutionName: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface CreateRegistrationRequestDto {
  fullName: string;
  email: string;
  institutionName: string;
  message: string;
}

export interface ReviewRequestDto {
  reviewNote?: string;
}

export const RegistrationRequestsService = {
  submit: async (data: CreateRegistrationRequestDto): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/registration-requests', data);
    return response.data;
  },

  list: async (): Promise<RegistrationRequest[]> => {
    const response = await adminApi.get<RegistrationRequest[]>('/registration-requests');
    return response.data.map((r) => ({ ...r, status: r.status.toLowerCase() as RequestStatus }));
  },

  approve: async (id: string, dto?: ReviewRequestDto): Promise<RegistrationRequest> => {
    const response = await adminApi.patch<RegistrationRequest>(
      `/registration-requests/${id}/approve`,
      dto ?? {}
    );
    return { ...response.data, status: response.data.status.toLowerCase() as RequestStatus };
  },

  reject: async (id: string, dto?: ReviewRequestDto): Promise<RegistrationRequest> => {
    const response = await adminApi.patch<RegistrationRequest>(
      `/registration-requests/${id}/reject`,
      dto ?? {}
    );
    return { ...response.data, status: response.data.status.toLowerCase() as RequestStatus };
  },

  sendCode: async (
    id: string,
    recipient: { email: string; fullName: string; institutionName: string }
  ): Promise<{ code: string; institutionName: string; expiresAt: string }> => {
    const response = await adminApi.post(`/registration-requests/${id}/send-code`);
    const data = response.data;

    const signUpUrl = `https://siladocs-frontend.vercel.app/authentication/sign-up/cover?code=${data.code}`;
    try {
      await fetch('/api/send-access-code-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recipient.email,
          fullName: recipient.fullName,
          institutionName: recipient.institutionName,
          code: data.code,
          signUpUrl,
        }),
      });
    } catch (e) {
      console.error('[RegistrationRequestsService] Error sending access code email:', e);
    }

    return data;
  },
};
