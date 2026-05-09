"use client";

import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import Seo from "@/shared/layouts-components/seo/seo";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";

export default function SystemConfig() {
  const [formData, setFormData] = useState({
    maxFileSize: 50,
    sessionTimeout: 30,
    enableNotifications: true,
    enableBlockchain: true,
    blockchainChannel: "silabos-channel",
    maxUploadRetries: 3,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    // TODO: Implementar API call
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <Seo title="Parámetros del Sistema" />
      <Pageheader
        currentpage="Parámetros del Sistema"
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
                  <i className="ri-settings-3-line me-2 text-primary"></i>
                  Parámetros del Sistema
                </h4>

                {saved && (
                  <Alert variant="success" dismissible>
                    ✓ Configuración actualizada exitosamente
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Tamaño máximo de archivo (MB)</Form.Label>
                    <Form.Control
                      type="number"
                      name="maxFileSize"
                      value={formData.maxFileSize}
                      onChange={handleChange}
                      min="1"
                      max="500"
                    />
                    <Form.Text className="text-muted">
                      Tamaño máximo permitido para subir archivos
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Tiempo de sesión (minutos)</Form.Label>
                    <Form.Control
                      type="number"
                      name="sessionTimeout"
                      value={formData.sessionTimeout}
                      onChange={handleChange}
                      min="5"
                      max="480"
                    />
                    <Form.Text className="text-muted">
                      Tiempo de inactividad antes de cerrar sesión
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Reintentos de carga</Form.Label>
                    <Form.Control
                      type="number"
                      name="maxUploadRetries"
                      value={formData.maxUploadRetries}
                      onChange={handleChange}
                      min="1"
                      max="10"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Canal de Blockchain</Form.Label>
                    <Form.Control
                      type="text"
                      name="blockchainChannel"
                      value={formData.blockchainChannel}
                      onChange={handleChange}
                      placeholder="silabos-channel"
                      disabled
                    />
                    <Form.Text className="text-muted">
                      Canal de Hyperledger Fabric para el registro de sílabos
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      name="enableNotifications"
                      checked={formData.enableNotifications}
                      onChange={handleChange}
                      label="Habilitar notificaciones por email"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      name="enableBlockchain"
                      checked={formData.enableBlockchain}
                      onChange={handleChange}
                      label="Habilitar registro en blockchain"
                      disabled
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" size="lg" className="w-100">
                    <i className="ri-save-line me-2"></i>
                    Guardar Parámetros
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
