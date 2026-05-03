import api from '@/shared/config/axios';

export interface EmissionCredit {
  id: number;
  institutionId: number;
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  purchaseDate: string;
  phase: string;
  expiresAt?: string;
  status: string;
}

export interface EmissionCreditHistory {
  id: number;
  creditId: number;
  action: 'purchase' | 'usage' | 'refund' | 'expiration';
  amount: number;
  date: string;
  description: string;
  relatedCertificateId?: number;
}

export const EmissionCreditsService = {
  getCredits: async (institutionId?: number): Promise<EmissionCredit[]> => {
    const url = institutionId
      ? `/emission-credits?institutionId=${institutionId}`
      : '/emission-credits';
    const response = await api.get<EmissionCredit[]>(url);
    return response.data;
  },

  getCreditHistory: async (creditId: number): Promise<EmissionCreditHistory[]> => {
    const response = await api.get<EmissionCreditHistory[]>(
      `/emission-credits/${creditId}/history`
    );
    return response.data;
  },

  purchaseCredits: async (data: {
    institutionId: number;
    amount: number;
    phase: string;
  }): Promise<EmissionCredit> => {
    const response = await api.post<EmissionCredit>('/emission-credits/purchase', data);
    return response.data;
  },
};
