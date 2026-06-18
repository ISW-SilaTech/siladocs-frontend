"use client";

import React, { useState, Fragment } from "react";
import { Tabs, Tab } from "react-bootstrap";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import ResumenTab from "./ResumenTab";
import TrazabilidadTab from "./TrazabilidadTab";
import AuditoriaTab from "./AuditoriaTab";

const BlockchainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("resumen");

  return (
    <Fragment>
      <Seo title="Blockchain" />
      <Pageheader currentpage="Blockchain" activepage="Core" mainpage="Blockchain" activepageclickable />

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || "resumen")} className="mb-4">
        <Tab eventKey="resumen" title="Resumen">
          <div className="pt-4">
            <ResumenTab />
          </div>
        </Tab>
        <Tab eventKey="trazabilidad" title="Trazabilidad">
          <div className="pt-4">
            <TrazabilidadTab />
          </div>
        </Tab>
        <Tab eventKey="auditoria" title="Auditoría">
          <div className="pt-4">
            <AuditoriaTab />
          </div>
        </Tab>
      </Tabs>
    </Fragment>
  );
};

export default BlockchainPage;
