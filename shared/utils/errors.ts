export const extractErrorMessage = (err: unknown, fallback: string): string => {
  if (err && typeof err === 'object') {
    const e = err as any;
    return e?.response?.data?.message ?? e?.message ?? fallback;
  }
  return fallback;
};
