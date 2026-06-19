"use client";

import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import Image from "next/image";
import Seo from "@/shared/layouts-components/seo/seo";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import ConfigService from "@/shared/services/config.service";
import { extractErrorMessage } from "@/shared/utils/errors";
import UploadAvatarModal from "@/shared/components/upload-avatar-modal";
import { useAuth } from "@/shared/contextapi";

export default function InstitutionConfig() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "Universidad Peruana de Ciencias",
    domain: "siladocs.edu.pe",
    email: "info@siladocs.edu.pe",
    phone: "+51 1 2345678",
    address: "Av. Principal 123, Lima, Perú",
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const config = await ConfigService.getInstitutionConfig();
      setFormData(config);
    } catch (err: any) {
      console.error("Error loading institution config:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    try {
      await ConfigService.updateInstitutionConfig(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(extractErrorMessage(err, "Error al guardar la configuración"));
    }
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
            {/* Avatar Section */}
            <Card className="custom-card shadow-sm border-0 mb-4">
              <Card.Body className="p-4">
                <div className="text-center">
                  <div className="mb-3">
                    {user?.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt="Avatar"
                        width={120}
                        height={120}
                        className="rounded-circle border border-3 border-primary"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto"
                        style={{
                          width: "120px",
                          height: "120px",
                          fontSize: "48px",
                          color: "white",
                        }}
                      >
                        <i className="ri-user-fill"></i>
                      </div>
                    )}
                  </div>
                  <h5 className="fw-bold mb-1">{user?.fullName || "Usuario"}</h5>
                  <p className="text-muted mb-3">{user?.email}</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAvatarModal(true)}
                    className="d-flex align-items-center gap-2 mx-auto"
                  >
                    <i className="ri-image-edit-line"></i>
                    Cambiar Foto
                  </Button>
                </div>
              </Card.Body>
            </Card>

            <Card className="custom-card shadow-sm border-0">
              <Card.Body className="p-5">
                <h4 className="fw-bold mb-4">
                  <i className="ri-building-2-line me-2 text-primary"></i>
                  Configuración de Institución
                </h4>

                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError("")}>
                    {error}
                  </Alert>
                )}
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

      <UploadAvatarModal
        show={showAvatarModal}
        onHide={() => setShowAvatarModal(false)}
        currentAvatarUrl={user?.avatarUrl}
      />
    </>
  );
}
