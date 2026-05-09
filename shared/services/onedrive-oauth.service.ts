import api from '@/shared/config/axios';
import { safeStorage } from '@/shared/utils/safeStorage';

export interface OneDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
  webUrl?: string;
}

export interface OneDriveOAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string[];
}

export const OneDriveOAuthService = {
  /**
   * Get the authorization URL for Microsoft OneDrive OAuth
   * User must navigate to this URL to grant permissions
   */
  getAuthorizationUrl: (clientId: string, redirectUri: string, tenantId: string = 'common'): string => {
    const scopes = [
      'files.read',
      'files.read.all',
    ].map(scope => `https://graph.microsoft.com/.default`).join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      response_mode: 'query',
      state: Math.random().toString(36).substring(7),
    });

    return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
  },

  /**
   * Exchange authorization code for access token
   * This should be done on the backend for security
   */
  exchangeCodeForToken: async (code: string): Promise<any> => {
    try {
      const response = await api.post('/oauth/onedrive/token', { code });
      return response.data;
    } catch (error) {
      console.error('Error exchanging OneDrive code for token:', error);
      throw error;
    }
  },

  /**
   * List files from OneDrive
   * Requires access token from backend
   */
  listFiles: async (accessToken: string, pageSize: number = 10): Promise<OneDriveFile[]> => {
    try {
      const response = await api.post('/oauth/onedrive/files', {
        accessToken,
        pageSize,
        query: "endswith(name, '.pdf') or endswith(name, '.docx')",
      });
      return response.data.files || [];
    } catch (error) {
      console.error('Error listing OneDrive files:', error);
      throw error;
    }
  },

  /**
   * Download file from OneDrive
   * Returns the file as a Blob
   */
  downloadFile: async (fileId: string, fileName: string): Promise<Blob> => {
    try {
      const response = await api.post(
        '/oauth/onedrive/download',
        { fileId },
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error downloading from OneDrive:', error);
      throw error;
    }
  },

  /**
   * Store access token in localStorage (for frontend-only flow)
   */
  storeAccessToken: (token: string): void => {
    safeStorage.setItem('onedrive_access_token', token);
  },

  /**
   * Retrieve stored access token
   */
  getAccessToken: (): string | null => {
    return safeStorage.getItem('onedrive_access_token');
  },

  /**
   * Clear stored access token
   */
  clearAccessToken: (): void => {
    safeStorage.removeItem('onedrive_access_token');
  },
};
