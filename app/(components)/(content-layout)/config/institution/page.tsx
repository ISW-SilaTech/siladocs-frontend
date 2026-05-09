"use client";

import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import Seo from "@/shared/layouts-components/seo/seo";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";

export default function InstitutionConfig() {
  const [formData, setFormData] = useState({
    name: "Universidad Peruana de Ciencias",
    domain: "siladocs.edu.pe",
    email: "info@siladocs.edu.pe",
    phone: "+51 1 2345678",
    address: "Av. Principal 123, Lima, Perú",
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    // TODO: Implementar API call
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <Seo title="Configuración de Institución" />
      <Pageheader
        currentpage="Institución"
        activepage="Configuración"
        mainpage="Configurar"
        activepageclickable
      />

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="custom-card shadow-sm border-0">
              <Card.Body className="p-5">
                <h4 className="fw-bold mb-4">
                  <i className="ri-building-2-line me-2 text-primary"></i>
                  Configuración de Institución
                </h4>

                {saved && (
                  <Alert variant="success" dismissible>
                    ✓ Cambios guardados exitosamente
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Nombre de la Institución</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nombre de la institución"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Dominio</Form.Label>
                    <Form.Control
                      type="text"
                      name="domain"
                      value={formData.domain}
                      onChange={handleChange}
                      placeholder="example.edu.pe"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Email Institucional</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="info@institution.edu.pe"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Teléfono</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+51 1 2345678"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Dirección</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Dirección completa"
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" size="lg" className="w-100">
                    <i className="ri-save-line me-2"></i>
                    Guardar Cambios
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
