"use client";

import React, { useEffect, useState, useContext } from "react";
import { LocalStorageBackup } from "@/shared/data/switcherdata/switcherdata";
import { data$, getState } from "@/shared/layouts-components/services/switcherServices";
import { Initialload } from "@/shared/contextapi";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [localVariable, setLocalVariable] = useState(getState());

    const customstyles: React.CSSProperties = {
        ...(localVariable.colorPrimaryRgb && { "--primary-rgb": localVariable.colorPrimaryRgb } as any),
        ...(localVariable.bodyBg && { "--body-bg-rgb": localVariable.bodyBg } as any),
        ...(localVariable.bodyBg2 && { "--body-bg-rgb2": localVariable.bodyBg2 } as any),
        ...(localVariable.lightRgb && { "--light-rgb": localVariable.lightRgb } as any),
        ...(localVariable.formControlBg && { "--form-control-bg": localVariable.formControlBg } as any),
        ...(localVariable.gray && { "--gray-3": localVariable.gray } as any),
        ...(localVariable.inputBorder && { "--input-border": localVariable.inputBorder } as any),
    };

    useEffect(() => {
        const subscription = data$.subscribe((e) => {
            setLocalVariable(e);
        });
        return () => subscription.unsubscribe();
    }, []);

    const theme: any = useContext(Initialload);

    useEffect(() => {
        if (typeof window !== "undefined" && !theme.pageloading) {
            LocalStorageBackup(theme.setpageloading);
        }
    }, [theme]);

    return (
        <div
            suppressHydrationWarning={true}
            lang={localVariable.lang || undefined}
            dir={localVariable.dir || undefined}
            data-theme-mode={localVariable.dataThemeMode || undefined}
            data-header-styles={localVariable.dataHeaderStyles || undefined}
            data-vertical-style={localVariable.dataVerticalStyle || undefined}
            data-nav-layout={localVariable.dataNavLayout || undefined}
            data-menu-styles={localVariable.dataMenuStyles || undefined}
            data-toggled={localVariable.toggled || undefined}
            data-nav-style={localVariable.dataNavStyle || undefined}
            hor-style={localVariable.horStyle || undefined}
            data-page-style={localVariable.dataPageStyle || undefined}
            data-width={localVariable.dataWidth || undefined}
            data-menu-position={localVariable.dataMenuPosition || undefined}
            data-header-position={localVariable.dataHeaderPosition || undefined}
            data-icon-overlay={localVariable.iconOverlay || undefined}
            data-bg-img={localVariable.bgImg || undefined}
            icon-text={localVariable.iconText || undefined}
            style={customstyles}
            className={localVariable.body || ""}
        >
            {theme.pageloading && children}
        </div>
    );
};

export default Layout;
