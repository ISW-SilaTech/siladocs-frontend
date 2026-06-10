"use client"
import Backtotop from '@/shared/layouts-components/backtotop/backtotop'
import Footer from '@/shared/layouts-components/footer/footer'
import Header from '@/shared/layouts-components/header/header'
import { data$, getState } from '@/shared/layouts-components/services/switcherServices'
import Sidebar from '@/shared/layouts-components/sidebar/sidebar'
import Switcher from '@/shared/layouts-components/switcher/switcher'
import ProductOnboarding from '@/shared/components/ProductOnboarding'
import React, { Fragment, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/contextapi'
import { Spinner, Container, Row, Col } from 'react-bootstrap'

const layout = ({ children }: any) => {

  const progressRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/authentication/sign-in/cover');
    }
  }, [user, loading, router]);

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

  let [variable, setVariable] = useState(getState());
  useEffect(() => {
    const subscription = data$.subscribe((e) => {
      setVariable(e);
    });

    return () => subscription.unsubscribe();
  }, []);

  let containerclass = variable.dataPageStyle === 'flat' ? "main-body-container" : ""

  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8} className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
            <p className="mt-3 text-muted">Verificando autenticación...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Fragment>
      <div ref={progressRef} className="progress-top-bar"></div>
      <Switcher />
      <div className='page'>
        <Header />
        <Sidebar />
        <div className='main-content app-content'>
        <div className={`container-fluid page-container ${containerclass}`}>
            {children}
          </div>
        </div>
        <Footer />
      </div>
      <Backtotop />
      <ProductOnboarding />
    </Fragment>
  )
}

export default layout
