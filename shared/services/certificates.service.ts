import api from '@/shared/config/axios';

export interface Certificate {
  id: number;
  institutionId: number;
  courseId: number;
  courseName: string;
  courseCode: string;
  studentName: string;
  studentEmail: string;
  issuedDate: string;
  creditsUsed: number;
  fabricTxId: string;
  blockchainHash: string;
  status: 'issued' | 'revoked' | 'pending';
  metadata?: Record<string, any>;
}

export interface CertificateSummary {
  totalIssued: number;
  totalByMonth: Array<{
    month: string;
    count: number;
  }>;
  totalByStatus: {
    issued: number;
    revoked: number;
    pending: number;
  };
}

export const CertificatesService = {
  getCertificates: async (
    institutionId?: number,
    params?: {
      limit?: number;
      offset?: number;
      status?: string;
    }
  ): Promise<Certificate[]> => {
    const queryParams = new URLSearchParams();
    if (institutionId) queryParams.append('institutionId', institutionId.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.status) queryParams.append('status', params.status);

    const url = `/certificates${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<Certificate[]>(url);
    return response.data;
  },

  getCertificateSummary: async (institutionId: number): Promise<CertificateSummary> => {
    const response = await api.get<CertificateSummary>(
      `/certificates/summary?institutionId=${institutionId}`
    );
    return response.data;
  },

  issueCertificate: async (data: {
    courseId: number;
    studentEmail: string;
    studentName: string;
  }): Promise<Certificate> => {
    const response = await api.post<Certificate>('/certificates/issue', data);
    return response.data;
  },

  revokeCertificate: async (certificateId: number): Promise<void> => {
    await api.post(`/certificates/${certificateId}/revoke`);
  },
};
