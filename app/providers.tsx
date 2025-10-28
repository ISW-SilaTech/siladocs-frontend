"use client";

import React, { useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/shared/redux/store";
import { Initialload } from "@/shared/contextapi";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [pageloading, setpageloading] = useState(false);

  return (
    <Provider store={store}>
      <Initialload.Provider value={{ pageloading, setpageloading }}>
        {children}
      </Initialload.Provider>
    </Provider>
  );
}
