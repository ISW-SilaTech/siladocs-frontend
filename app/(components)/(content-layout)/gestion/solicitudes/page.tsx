"use client";

import React, { useState, useEffect, Fragment } from "react";
import {
  Row, Col, Card, Button, Form, Modal,
  Badge, Spinner, InputGroup,
} from "react-bootstrap";
import { toast } from "react-toastify";
import Seo from "@/shared/layouts-components/seo/seo";
import {
  OnboardingService,
  type Institution,
  type AccessCode,
  type InstitutionRequest,
} from "@/shared/services/onboarding.service";
import { extractErrorMessage } from "@/shared/utils/errors";

type Step = "institution" | "code";

interface CreatedCode {
  institution: Institution;
  accessCode: AccessCode;
}

const EMPTY_FORM: InstitutionRequest = {
  name: "",
  ruc: "",
  address: "",
  phone: "",
  email: "",
};

export default function SolicitudesPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal crear institución + generar código
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<Step>("institution");
  const [form, setForm] = useState<InstitutionRequest>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [createdInstitution, setCreatedInstitution] = useState<Institution | null>(null);

  // Modal generar código para institución existente
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);

  // Resultado final
  const [result, setResult] = useState<CreatedCode | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [inst, codes] = await Promise.all([
        OnboardingService.getInstitutions(),
        OnboardingService.getAccessCodes(),
      ]);
      setInstitutions(inst);
      setAccessCodes(codes);
    } catch {
      // silently fail – tables will be empty
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // STEP 1: crear institución
  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.warn("El nombre de la institución es requerido");
      return;
    }
    setSaving(true);
    try {
      const inst = await OnboardingService.createInstitution(form);
      setCreatedInstitution(inst);
      setInstitutions((prev) => [inst, ...prev]);
      setStep("code");
      toast.success(`Institución "${inst.name}" creada`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Error al crear la institución"));
    } finally {
      setSaving(false);
    }
  };

  // STEP 2: generar código para institución recién creada
  const handleGenerateCode = async () => {
    if (!createdInstitution) return;
    setSaving(true);
    try {
      const code = await OnboardingService.generateAccessCode({ institutionId: createdInstitution.id });
      setAccessCodes((prev) => [code, ...prev]);
      setResult({ institution: createdInstitution, accessCode: code });
      setShowModal(false);
      setShowResult(true);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Error al generar el código de acceso"));
    } finally {
      setSaving(false);
    }
  };

  // Generar código para institución existente
  const handleGenerateForExisting = async () => {
    if (!selectedInstitution) return;
    setGeneratingCode(true);
    try {
      const code = await OnboardingService.generateAccessCode({ institutionId: selectedInstitution.id });
      setAccessCodes((prev) => [code, ...prev]);
      setResult({ institution: selectedInstitution, accessCode: code });
      setShowCodeModal(false);
      setShowResult(true);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Error al generar el código de acceso"));
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCloseModal = () => {
    if (saving) return;
    setShowModal(false);
    setStep("institution");
    setForm(EMPTY_FORM);
    setCreatedInstitution(null);
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Código copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  const availableCodes = accessCodes.filter((c) => !c.used);
  const usedCodes = accessCodes.filter((c) => c.used);

  return (
    <Fragment>
      <Seo title="Solicitudes de Registro - Siladocs" />

      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1">Solicitudes de Registro</h4>
          <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
            Aprueba nuevas instituciones y genera códigos de acceso para sus administradores.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)} className="d-flex align-items-center gap-2">
          <i className="ri-building-add-line fs-5"></i>
          Nueva Institución
        </Button>
      </div>

      {/* Stats */}
      <Row className="g-3 mb-4">
        {[
          { label: "Instituciones", value: institutions.length, icon: "ri-building-line", color: "#4767ed" },
          { label: "Códigos Disponibles", value: availableCodes.length, icon: "ri-key-line", color: "#10b981" },
          { label: "Códigos Utilizados", value: usedCodes.length, icon: "ri-checkbox-circle-line", color: "#6b7280" },
        ].map((stat) => (
          <Col xl={4} md={4} key={stat.label}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center gap-3 p-3">
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${stat.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className={`${stat.icon} fs-4`} style={{ color: stat.color }}></i>
                </div>
                <div>
                  <div className="fw-bold fs-4 lh-1">{loading ? "—" : stat.value}</div>
                  <div className="text-muted" style={{ fontSize: "0.82rem" }}>{stat.label}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Instituciones */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-white border-0 pb-0 pt-3 px-4 d-flex align-items-center justify-content-between">
          <h6 className="fw-semibold mb-0 d-flex align-items-center gap-2">
            <i className="ri-building-line text-primary"></i> Instituciones Registradas
          </h6>
        </Card.Header>
        <Card.Body className="px-4">
          {loading ? (
            <div className="text-center py-4"><Spinner size="sm" /> Cargando...</div>
          ) : institutions.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="ri-building-line fs-1 d-block mb-2 opacity-25"></i>
              No hay instituciones registradas aún.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Institución</th>
                    <th>Email</th>
                    <th>RUC</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {institutions.map((inst) => (
                    <tr key={inst.id}>
                      <td className="fw-semibold">{inst.name}</td>
                      <td className="text-muted">{inst.email || "—"}</td>
                      <td className="text-muted">{inst.ruc || "—"}</td>
                      <td className="text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="d-inline-flex align-items-center gap-1"
                          onClick={() => { setSelectedInstitution(inst); setShowCodeModal(true); }}
                        >
                          <i className="ri-key-line"></i> Generar Código
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Códigos de acceso */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 pb-0 pt-3 px-4">
          <h6 className="fw-semibold mb-0 d-flex align-items-center gap-2">
            <i className="ri-key-line text-primary"></i> Códigos de Acceso Generados
          </h6>
        </Card.Header>
        <Card.Body className="px-4">
          {loading ? (
            <div className="text-center py-4"><Spinner size="sm" /> Cargando...</div>
          ) : accessCodes.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="ri-key-line fs-1 d-block mb-2 opacity-25"></i>
              No hay códigos generados aún.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Institución</th>
                    <th>Código</th>
                    <th>Estado</th>
                    <th>Creado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {accessCodes.map((ac) => {
                    const inst = institutions.find((i) => i.id === ac.institutionId);
                    return (
                      <tr key={ac.id}>
                        <td className="fw-semibold">{inst?.name || ac.institutionName || `ID ${ac.institutionId}`}</td>
                        <td>
                          <code className="bg-light px-2 py-1 rounded" style={{ fontSize: "0.9rem", letterSpacing: 1 }}>
                            {ac.code}
                          </code>
                        </td>
                        <td>
                          <Badge bg={ac.used ? "secondary" : "success"} className="fw-normal">
                            {ac.used ? "Utilizado" : "Disponible"}
                          </Badge>
                        </td>
                        <td className="text-muted" style={{ fontSize: "0.85rem" }}>
                          {new Date(ac.createdAt).toLocaleDateString("es-PE")}
                        </td>
                        <td>
                          {!ac.used && (
                            <Button variant="ghost" size="sm" className="text-muted p-1" onClick={() => copyCode(ac.code)} title="Copiar código">
                              <i className="ri-clipboard-line fs-5"></i>
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* ===== MODAL: Nueva institución + código ===== */}
      <Modal show={showModal} onHide={handleCloseModal} centered backdrop={saving ? "static" : true}>
        <Modal.Header closeButton={!saving} className="border-0 pb-0">
          <Modal.Title>
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#4767ed,#7b5cff)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 16 }}>
                {step === "institution" ? "🏛" : "🔑"}
              </div>
              <div>
                <div className="fw-semibold">{step === "institution" ? "Nueva Institución" : "Generar Código de Acceso"}</div>
                <small className="text-muted fw-normal">Paso {step === "institution" ? 1 : 2} de 2</small>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>

        <div className="px-4 pt-2">
          <div style={{ height: 4, borderRadius: 4, background: "#e5e7eb", overflow: "hidden" }}>
            <div style={{ height: "100%", width: step === "institution" ? "50%" : "100%", background: "linear-gradient(90deg,#4767ed,#7b5cff)", transition: "width .35s ease" }} />
          </div>
        </div>

        <Modal.Body className="px-4 pt-3">
          {step === "institution" ? (
            <Form id="inst-form" onSubmit={handleCreateInstitution}>
              <Row className="g-3">
                <Col xs={12}>
                  <Form.Label className="fw-medium">Nombre de la Institución *</Form.Label>
                  <Form.Control name="name" value={form.name} onChange={handleChange} placeholder="Ej. Universidad Nacional de Ingeniería" required />
                </Col>
                <Col xs={12} md={6}>
                  <Form.Label className="fw-medium">Email de contacto</Form.Label>
                  <Form.Control name="email" type="email" value={form.email} onChange={handleChange} placeholder="contacto@universidad.edu.pe" />
                </Col>
                <Col xs={12} md={6}>
                  <Form.Label className="fw-medium">RUC</Form.Label>
                  <Form.Control name="ruc" value={form.ruc} onChange={handleChange} placeholder="20123456789" />
                </Col>
                <Col xs={12} md={6}>
                  <Form.Label className="fw-medium">Teléfono</Form.Label>
                  <Form.Control name="phone" value={form.phone} onChange={handleChange} placeholder="+51 1 234 5678" />
                </Col>
                <Col xs={12} md={6}>
                  <Form.Label className="fw-medium">Dirección</Form.Label>
                  <Form.Control name="address" value={form.address} onChange={handleChange} placeholder="Av. Universitaria 1801, Lima" />
                </Col>
              </Row>
            </Form>
          ) : (
            <div>
              <div className="alert border-0 mb-3" style={{ background: "#f0fdf4", color: "#166534" }}>
                <i className="ri-check-circle-line me-2"></i>
                <strong>{createdInstitution?.name}</strong> fue creada exitosamente.
              </div>
              <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                Genera ahora el código de acceso que enviarás al administrador de esta institución para que pueda registrarse en Siladocs.
              </p>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          {step === "institution" ? (
            <>
              <Button variant="light" onClick={handleCloseModal} disabled={saving}>Cancelar</Button>
              <Button variant="primary" type="submit" form="inst-form" disabled={saving} className="d-flex align-items-center gap-2">
                {saving && <Spinner size="sm" />}
                {saving ? "Creando..." : "Crear Institución →"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="light" onClick={handleCloseModal} disabled={saving}>Cerrar</Button>
              <Button variant="primary" onClick={handleGenerateCode} disabled={saving} className="d-flex align-items-center gap-2">
                {saving && <Spinner size="sm" />}
                {saving ? "Generando..." : "Generar Código de Acceso"}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* ===== MODAL: Generar código para institución existente ===== */}
      <Modal show={showCodeModal} onHide={() => !generatingCode && setShowCodeModal(false)} centered backdrop={generatingCode ? "static" : true}>
        <Modal.Header closeButton={!generatingCode} className="border-0">
          <Modal.Title className="d-flex align-items-center gap-2">
            <i className="ri-key-line text-primary fs-5"></i>
            Generar Código de Acceso
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
          {selectedInstitution && (
            <>
              <p className="mb-1 text-muted" style={{ fontSize: "0.85rem" }}>Institución seleccionada</p>
              <div className="fw-bold fs-5 mb-3">{selectedInstitution.name}</div>
              <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                Se generará un código de acceso único. Compártelo con el administrador para que complete su registro.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowCodeModal(false)} disabled={generatingCode}>Cancelar</Button>
          <Button variant="primary" onClick={handleGenerateForExisting} disabled={generatingCode} className="d-flex align-items-center gap-2">
            {generatingCode && <Spinner size="sm" />}
            {generatingCode ? "Generando..." : "Generar Código"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== MODAL: Resultado — mostrar código generado ===== */}
      <Modal show={showResult} onHide={() => { setShowResult(false); setCopied(false); }} centered>
        <Modal.Header className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2">
            <span style={{ fontSize: 24 }}>🎉</span> Código Generado
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-2">
          {result && (
            <>
              <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                Comparte este código con el administrador de <strong>{result.institution.name}</strong> para que complete su registro.
              </p>

              <div className="mb-4" style={{ background: "#f8faff", border: "2px dashed #4767ed", borderRadius: 12, padding: "20px 24px" }}>
                <p className="text-muted mb-2" style={{ fontSize: "0.75rem", letterSpacing: 1, textTransform: "uppercase" }}>Código de Acceso</p>
                <div className="d-flex align-items-center gap-3">
                  <code style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: 4, color: "#4767ed", flex: 1 }}>
                    {result.accessCode.code}
                  </code>
                  <Button
                    variant={copied ? "success" : "primary"}
                    size="sm"
                    onClick={() => copyCode(result.accessCode.code)}
                    className="d-flex align-items-center gap-1"
                  >
                    <i className={`ri-${copied ? "check" : "clipboard"}-line`}></i>
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                </div>
              </div>

              <div className="alert border-0" style={{ background: "#fffbeb", color: "#92400e", fontSize: "0.85rem" }}>
                <i className="ri-information-line me-1"></i>
                El administrador deberá ingresar este código en el formulario de registro de Siladocs.
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="primary" className="w-100" onClick={() => { setShowResult(false); setCopied(false); }}>
            Listo
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
}
