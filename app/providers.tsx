"use client";

import React, { useState } from "react";
import { Provider } from "react-redux";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { store } from "@/shared/redux/store";
import { Initialload, AuthProvider } from "@/shared/contextapi";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [pageloading, setpageloading] = useState(false);
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

  return (
    <Provider store={store}>
      <Initialload.Provider value={{ pageloading, setpageloading }}>
        <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </GoogleReCaptchaProvider>
      </Initialload.Provider>
    </Provider>
  );
}
