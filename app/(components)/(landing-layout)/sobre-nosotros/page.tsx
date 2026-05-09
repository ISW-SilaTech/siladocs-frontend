"use client";

import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Link from "next/link";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";

const SobreNosotros: React.FC = () => {
  return (
    <>
      <Seo title="Sobre Nosotros - SilaDocs" description="Conoce la misión y visión de SilaDocs" />
      <Pageheader
        currentpage="Sobre Nosotros"
        activepage="SilaDocs"
        mainpage="Home"
        activepageclickable
      />

      <Container className="py-5">
        {/* Introducción */}
        <Row className="mb-5">
          <Col lg={8} className="mx-auto">
            <div className="text-center mb-4">
              <h1 className="fw-bold mb-3">Sobre SilaDocs</h1>
              <p className="fs-16 text-muted">
                Una plataforma innovadora que transforma la gestión de sílabos universitarios
                mediante tecnología blockchain
              </p>
            </div>
          </Col>
        </Row>

        {/* Misión y Visión */}
        <Row className="mb-5 g-4">
          <Col lg={6}>
            <Card className="custom-card border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <div className="mb-3">
                  <i className="ri-target-2-line text-primary" style={{ fontSize: "30px" }}></i>
                </div>
                <h4 className="fw-bold mb-3">Nuestra Misión</h4>
                <p className="text-muted">
                  Proporcionar a instituciones educativas una solución segura, inmutable y
                  trazable para la gestión de sílabos académicos mediante tecnología blockchain,
                  garantizando integridad, transparencia y cumplimiento normativo.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="custom-card border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <div className="mb-3">
                  <i className="ri-eye-line text-primary" style={{ fontSize: "30px" }}></i>
                </div>
                <h4 className="fw-bold mb-3">Nuestra Visión</h4>
                <p className="text-muted">
                  Ser la plataforma líder en gestión de documentos académicos con blockchain,
                  permitiendo que instituciones educativas demuestren excelencia, transparencia
                  y cumplimiento normativo a través de la tecnología más segura y confiable.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Valores */}
        <Row className="mb-5">
          <Col lg={12}>
            <h3 className="fw-bold mb-4 text-center">Nuestros Valores</h3>
          </Col>

          <Col md={6} lg={3} className="mb-4">
            <Card className="custom-card border-0 shadow-sm text-center">
              <Card.Body className="p-4">
                <i className="ri-shield-check-fill text-success" style={{ fontSize: "40px" }}></i>
                <h6 className="fw-semibold mt-3 mb-2">Seguridad</h6>
                <small className="text-muted">
                  Protección máxima de datos con encriptación y blockchain
                </small>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-4">
            <Card className="custom-card border-0 shadow-sm text-center">
              <Card.Body className="p-4">
                <i className="ri-eye-2-fill text-info" style={{ fontSize: "40px" }}></i>
                <h6 className="fw-semibold mt-3 mb-2">Transparencia</h6>
                <small className="text-muted">
                  Auditoría completa y visible de todos los cambios
                </small>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-4">
            <Card className="custom-card border-0 shadow-sm text-center">
              <Card.Body className="p-4">
                <i className="ri-git-branch-line text-warning" style={{ fontSize: "40px" }}></i>
                <h6 className="fw-semibold mt-3 mb-2">Inmutabilidad</h6>
                <small className="text-muted">
                  Registros que no pueden ser alterados retroactivamente
                </small>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-4">
            <Card className="custom-card border-0 shadow-sm text-center">
              <Card.Body className="p-4">
                <i className="ri-lightbulb-flash-fill text-warning" style={{ fontSize: "40px" }}></i>
                <h6 className="fw-semibold mt-3 mb-2">Innovación</h6>
                <small className="text-muted">
                  Soluciones de vanguardia para educación superior
                </small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ¿Por qué SilaDocs? */}
        <Row className="mb-5">
          <Col lg={10} className="mx-auto">
            <h3 className="fw-bold mb-4">¿Por qué elegir SilaDocs?</h3>

            <div className="mb-4">
              <div className="d-flex align-items-start">
                <i className="ri-check-line text-success me-3" style={{ fontSize: "20px" }}></i>
                <div>
                  <h6 className="fw-semibold mb-2">Tecnología Blockchain Avanzada</h6>
                  <p className="text-muted mb-3">
                    Integración con Hyperledger Fabric para garantizar inmutabilidad y
                    trazabilidad de registros académicos sin alteraciones posibles.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex align-items-start">
                <i className="ri-check-line text-success me-3" style={{ fontSize: "20px" }}></i>
                <div>
                  <h6 className="fw-semibold mb-2">Cumplimiento Normativo</h6>
                  <p className="text-muted mb-3">
                    Demuestra cumplimiento de estándares de calidad académica y normativas
                    institucionales con auditoría completa y visible.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex align-items-start">
                <i className="ri-check-line text-success me-3" style={{ fontSize: "20px" }}></i>
                <div>
                  <h6 className="fw-semibold mb-2">Facilidad de Uso</h6>
                  <p className="text-muted mb-3">
                    Interfaz intuitiva que no requiere conocimiento técnico en blockchain.
                    Administradores y docentes pueden usar el sistema inmediatamente.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex align-items-start">
                <i className="ri-check-line text-success me-3" style={{ fontSize: "20px" }}></i>
                <div>
                  <h6 className="fw-semibold mb-2">Compartibilidad Verificable</h6>
                  <p className="text-muted mb-3">
                    Genera QR y URLs públicas para que terceros verifiquen autenticidad
                    sin necesidad de acceso al sistema interno.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex align-items-start">
                <i className="ri-check-line text-success me-3" style={{ fontSize: "20px" }}></i>
                <div>
                  <h6 className="fw-semibold mb-2">Escalabilidad Empresarial</h6>
                  <p className="text-muted mb-0">
                    Arquitectura cloud-native que crece con tu institución, desde pequeñas
                    universidades hasta grandes redes de educación superior.
                  </p>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Equipo y Desarrollo */}
        <Row className="mb-5 bg-light py-5 px-3 rounded">
          <Col lg={12}>
            <h3 className="fw-bold mb-4 text-center">Desarrollo e Investigación</h3>
            <p className="text-muted text-center mb-4">
              SilaDocs es una iniciativa académica desarrollada como propuesta de investigación
              y tesis en el campo de tecnología blockchain aplicada a educación superior.
            </p>

            <Row className="g-4">
              <Col md={6}>
                <div className="d-flex">
                  <i className="ri-graduation-cap-line text-primary me-3" style={{ fontSize: "24px" }}></i>
                  <div>
                    <h6 className="fw-semibold mb-2">Base Académica Sólida</h6>
                    <small className="text-muted">
                      Desarrollado con principios de investigación rigurosa y estándares
                      académicos internacionales.
                    </small>
                  </div>
                </div>
              </Col>

              <Col md={6}>
                <div className="d-flex">
                  <i className="ri-code-block-line text-primary me-3" style={{ fontSize: "24px" }}></i>
                  <div>
                    <h6 className="fw-semibold mb-2">Código de Calidad</h6>
                    <small className="text-muted">
                      Stack tecnológico moderno: Next.js, Spring Boot, PostgreSQL,
                      Hyperledger Fabric.
                    </small>
                  </div>
                </div>
              </Col>

              <Col md={6}>
                <div className="d-flex">
                  <i className="ri-feedback-line text-primary me-3" style={{ fontSize: "24px" }}></i>
                  <div>
                    <h6 className="fw-semibold mb-2">Validación de Expertos</h6>
                    <small className="text-muted">
                      Evaluado por jurados especializados en blockchain, seguridad
                      informática y gestión educativa.
                    </small>
                  </div>
                </div>
              </Col>

              <Col md={6}>
                <div className="d-flex">
                  <i className="ri-earth-line text-primary me-3" style={{ fontSize: "24px" }}></i>
                  <div>
                    <h6 className="fw-semibold mb-2">Impacto Institucional</h6>
                    <small className="text-muted">
                      Diseñado para resolver problemas reales de gestión académica
                      en instituciones educativas.
                    </small>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* CTA */}
        <Row className="text-center">
          <Col lg={8} className="mx-auto">
            <h3 className="fw-bold mb-4">¿Listo para transformar tu gestión académica?</h3>
            <p className="text-muted mb-4">
              Únete a SilaDocs y descubre cómo la tecnología blockchain puede garantizar
              seguridad, transparencia y cumplimiento normativo en tu institución.
            </p>
            <Link href="/authentication/sign-up/cover" className="btn btn-primary btn-lg">
              Comenzar Ahora
            </Link>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default SobreNosotros;
