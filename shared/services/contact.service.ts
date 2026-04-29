import api from '@/shared/config/axios';

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  company?: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  ticketId?: string;
}

export const ContactService = {
  sendMessage: async (data: ContactRequest): Promise<ContactResponse> => {
    const response = await api.post<ContactResponse>('/contact/send', data);
    return response.data;
  },

  getInfo: async () => {
    // Datos de contacto estáticos o del backend
    return {
      email: 'contacto@siladocs.com',
      phone: '+34 900 123 456',
      address: 'Calle Principal 123, Madrid, España',
      businessHours: 'Lunes - Viernes: 9:00 - 18:00',
      responseTime: 'Respondemos en menos de 24 horas',
    };
  },
};
