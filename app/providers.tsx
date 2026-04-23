"use client";

import React, { useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/shared/redux/store";
import { Initialload, AuthProvider } from "@/shared/contextapi";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [pageloading, setpageloading] = useState(false);

  return (
    <Provider store={store}>
      <Initialload.Provider value={{ pageloading, setpageloading }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </Initialload.Provider>
    </Provider>
  );
}
