"use client";

import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import Seo from "@/shared/layouts-components/seo/seo";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import ConfigService from "@/shared/services/config.service";

export default function PreferencesConfig() {
  const [formData, setFormData] = useState({
    language: "es",
    theme: "light",
    emailNotifications: true,
    sysNotifications: true,
    autoSave: true,
    dateFormat: "DD/MM/YYYY",
    timezone: "America/Lima",
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await ConfigService.getUserPreferences();
      setFormData(prefs);
    } catch (err: any) {
      console.error("Error loading preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    try {
      await ConfigService.updateUserPreferences(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al guardar las preferencias");
    }
  };

  return (
    <>
      <Seo title="Preferencias" />
      <Pageheader
        currentpage="Preferencias"
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
                  <i className="ri-palette-line me-2 text-primary"></i>
                  Preferencias
                </h4>

                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError("")}>
                    {error}
                  </Alert>
                )}
                {saved && (
                  <Alert variant="success" dismissible>
                    ✓ Preferencias actualizadas exitosamente
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Idioma</Form.Label>
                    <Form.Select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Tema</Form.Label>
                    <Form.Select
                      name="theme"
                      value={formData.theme}
                      onChange={handleChange}
                    >
                      <option value="light">Claro</option>
                      <option value="dark">Oscuro</option>
                      <option value="auto">Automático</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Zona horaria</Form.Label>
                    <Form.Select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                    >
                      <option value="America/Lima">Lima (GMT-5)</option>
                      <option value="America/Bogota">Bogotá (GMT-5)</option>
                      <option value="America/Santiago">Santiago (GMT-4)</option>
                      <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Formato de fecha</Form.Label>
                    <Form.Select
                      name="dateFormat"
                      value={formData.dateFormat}
                      onChange={handleChange}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </Form.Select>
                  </Form.Group>

                  <hr className="my-4" />

                  <h6 className="fw-bold mb-3">Notificaciones</h6>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      name="emailNotifications"
                      checked={formData.emailNotifications}
                      onChange={handleChange}
                      label="Recibir notificaciones por email"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      name="sysNotifications"
                      checked={formData.sysNotifications}
                      onChange={handleChange}
                      label="Notificaciones del sistema"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      name="autoSave"
                      checked={formData.autoSave}
                      onChange={handleChange}
                      label="Guardar automáticamente cambios"
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" size="lg" className="w-100">
                    <i className="ri-save-line me-2"></i>
                    Guardar Preferencias
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
