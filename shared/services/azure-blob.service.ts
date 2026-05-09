import api from '@/shared/config/axios';

export const AzureBlobService = {
  /**
   * Get a SAS URL for viewing/downloading a file from Azure Blob Storage
   * The backend generates a secure, time-limited SAS token
   */
  getPreviewUrl: async (fileName: string): Promise<string> => {
    try {
      const response = await api.get<{ previewUrl: string }>('/azure-blob/preview-url', {
        params: { fileName },
      });
      return response.data.previewUrl;
    } catch (error) {
      console.error('Error getting preview URL from Azure Blob:', error);
      throw error;
    }
  },

  /**
   * Get a SAS URL for downloading a file
   */
  getDownloadUrl: async (fileName: string): Promise<string> => {
    try {
      const response = await api.get<{ downloadUrl: string }>('/azure-blob/download-url', {
        params: { fileName },
      });
      return response.data.downloadUrl;
    } catch (error) {
      console.error('Error getting download URL from Azure Blob:', error);
      throw error;
    }
  },

  /**
   * Construct the blob storage URL (fallback if SAS token not available)
   * Format: https://[storageAccount].blob.core.windows.net/[container]/[fileName]
   */
  constructBlobUrl: (fileName: string, containerName: string = 'syllabi'): string => {
    const storageAccount = process.env.NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT || 'siladocsblob';
    return `https://${storageAccount}.blob.core.windows.net/${containerName}/${encodeURIComponent(fileName)}`;
  },
};
