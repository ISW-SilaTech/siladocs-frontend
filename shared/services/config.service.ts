import api from '@/shared/config/axios';

export interface InstitutionConfig {
  name: string;
  domain: string;
  email: string;
  phone: string;
  address: string;
}

export interface SystemConfig {
  maxFileSize: number;
  sessionTimeout: number;
  enableNotifications: boolean;
  enableBlockchain: boolean;
  blockchainChannel: string;
  maxUploadRetries: number;
}

export interface PreferencesConfig {
  language: string;
  theme: string;
  emailNotifications: boolean;
  sysNotifications: boolean;
  autoSave: boolean;
  dateFormat: string;
  timezone: string;
}

export const ConfigService = {
  // Institution Configuration
  getInstitutionConfig: async (): Promise<InstitutionConfig> => {
    const response = await api.get<InstitutionConfig>('/config/institution');
    return response.data;
  },

  updateInstitutionConfig: async (data: InstitutionConfig): Promise<InstitutionConfig> => {
    const response = await api.put<InstitutionConfig>('/config/institution', data);
    return response.data;
  },

  // System Configuration
  getSystemConfig: async (): Promise<SystemConfig> => {
    const response = await api.get<SystemConfig>('/config/system');
    return response.data;
  },

  updateSystemConfig: async (data: SystemConfig): Promise<SystemConfig> => {
    const response = await api.put<SystemConfig>('/config/system', data);
    return response.data;
  },

  // User Preferences
  getUserPreferences: async (): Promise<PreferencesConfig> => {
    const response = await api.get<PreferencesConfig>('/config/preferences');
    return response.data;
  },

  updateUserPreferences: async (data: PreferencesConfig): Promise<PreferencesConfig> => {
    const response = await api.put<PreferencesConfig>('/config/preferences', data);
    return response.data;
  },
};

export default ConfigService;
