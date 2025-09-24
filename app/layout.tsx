"use client"; // mantenemos el layout como cliente
import React, { useState } from "react";
import "./globals.scss";
import { Provider } from "react-redux";
import { store } from "@/shared/redux/store";
import { Initialload } from "@/shared/contextapi";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const [pageloading, setpageloading] = useState(false);

  return (
    <html lang="es">
      <body className="app sidebar-mini ltr light-mode" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        <Provider store={store}>
          <Initialload.Provider value={{ pageloading, setpageloading }}>
            {children}
          </Initialload.Provider>
        </Provider>
      </body>
    </html>
  );
};

export default RootLayout;
