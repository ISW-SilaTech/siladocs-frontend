"use client"
import Backtotop from '@/shared/layouts-components/backtotop/backtotop'
import Footer from '@/shared/layouts-components/footer/footer'
import Header from '@/shared/layouts-components/header/header'
import { data$, getState } from '@/shared/layouts-components/services/switcherServices'
import Sidebar from '@/shared/layouts-components/sidebar/sidebar'
import Switcher from '@/shared/layouts-components/switcher/switcher'
import React, { Fragment, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

const Layout = ({ children }: any) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname(); // 👈 obtenemos la ruta actual

  // Barra de progreso en scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / scrollHeight) * 100;

      if (progressRef.current) {
        progressRef.current.style.width = `${scrollPercent}%`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Estado de switcher
  let [variable, setVariable] = useState(getState());
  useEffect(() => {
    const subscription = data$.subscribe((e) => {
      setVariable(e);
    });

    return () => subscription.unsubscribe();
  }, []);

  let containerclass = variable.dataPageStyle === 'flat'
    ? "main-body-container"
    : "default-body-container";

  // Debug + disparar resize al cambiar de ruta
  useEffect(() => {
    console.log("ContainerClass:", containerclass, "Path:", pathname);

    // 👇 forzar a recalcular anchos de tablas o grids
    window.dispatchEvent(new Event("resize"));
  }, [containerclass, pathname]);

  return (
    <Fragment>
      <div ref={progressRef} className="progress-top-bar"></div>
      <Switcher />
      <div className="page">
        <Header />
        <Sidebar />
        <div className="main-content app-content">
          {/* 👇 el key fuerza remount al cambiar de ruta */}
          <div key={pathname} className={`container-fluid page-container ${containerclass}`}>
            {children}
          </div>
        </div>
        <Footer />
      </div>
      <Backtotop />
    </Fragment>
  )
}

export default Layout
