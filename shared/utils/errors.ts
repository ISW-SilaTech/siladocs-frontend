export const extractErrorMessage = (err: unknown, fallback: string): string => {
  if (err && typeof err === 'object') {
    const e = err as any;
    const responseData = e?.response?.data;

    // Try multiple error response formats
    if (typeof responseData === 'string') {
      return responseData;
    }

    if (typeof responseData === 'object') {
      return (
        responseData.message ||
        responseData.error ||
        responseData.detail ||
        (Array.isArray(responseData) ? responseData[0]?.message : null)
      );
    }

    // Fallback to direct message
    return e?.message ?? fallback;
  }
  return fallback;
};
