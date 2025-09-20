// shared/layouts-components/ClientWrapper.tsx
"use client";
import { useState, ReactNode } from "react";
import { Initialload } from "@/shared/contextapi";

const ClientWrapper = ({ children }: { children: ReactNode }) => {
  const [pageloading, setpageloading] = useState(false);

  return (
    <Initialload.Provider value={{ pageloading, setpageloading }}>
      {children}
    </Initialload.Provider>
  );
};

export default ClientWrapper;
