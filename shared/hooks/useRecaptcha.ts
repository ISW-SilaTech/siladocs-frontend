import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useCallback } from 'react';

export const useRecaptcha = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const getToken = useCallback(async (action: string = 'submit'): Promise<string | null> => {
    if (!executeRecaptcha) {
      console.warn('reCAPTCHA not yet available');
      return null;
    }

    try {
      const token = await executeRecaptcha(action);
      return token;
    } catch (error) {
      console.error('Error executing reCAPTCHA:', error);
      return null;
    }
  }, [executeRecaptcha]);

  return { getToken };
};
