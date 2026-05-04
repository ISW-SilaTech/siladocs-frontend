import api from '@/shared/config/axios';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface GoogleDriveOAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string[];
}

export const GoogleDriveOAuthService = {
  /**
   * Get the authorization URL for Google Drive OAuth
   * User must navigate to this URL to grant permissions
   */
  getAuthorizationUrl: (clientId: string, redirectUri: string): string => {
    const scopes = [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.file',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  },

  /**
   * Exchange authorization code for access token
   * This should be done on the backend for security
   */
  exchangeCodeForToken: async (code: string): Promise<any> => {
    try {
      const response = await api.post('/oauth/google/token', { code });
      return response.data;
    } catch (error) {
      console.error('Error exchanging Google code for token:', error);
      throw error;
    }
  },

  /**
   * List files from Google Drive
   * Requires access token from backend
   */
  listFiles: async (accessToken: string, pageSize: number = 10): Promise<GoogleDriveFile[]> => {
    try {
      const response = await api.post('/oauth/google/files', {
        accessToken,
        pageSize,
        query: "mimeType='application/pdf' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'",
      });
      return response.data.files || [];
    } catch (error) {
      console.error('Error listing Google Drive files:', error);
      throw error;
    }
  },

  /**
   * Download file from Google Drive
   * Returns the file as a Blob
   */
  downloadFile: async (fileId: string, fileName: string): Promise<Blob> => {
    try {
      const response = await api.post(
        '/oauth/google/download',
        { fileId },
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error downloading from Google Drive:', error);
      throw error;
    }
  },

  /**
   * Store access token in localStorage (for frontend-only flow)
   */
  storeAccessToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('google_drive_access_token', token);
    }
  },

  /**
   * Retrieve stored access token
   */
  getAccessToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('google_drive_access_token');
    }
    return null;
  },

  /**
   * Clear stored access token
   */
  clearAccessToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('google_drive_access_token');
    }
  },
};
