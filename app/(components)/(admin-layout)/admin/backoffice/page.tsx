"use client";

import React, { useState, useEffect, Fragment } from "react";
import {
  Row, Col, Card, Button, Form, Modal,
  Badge, Spinner,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import {
  type Institution,
  type AccessCode,
  type InstitutionRequest,
} from "@/shared/services/onboarding.service";
import { extractErrorMessage } from "@/shared/utils/errors";
import adminApi from "@/shared/config/axios-admin";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Step = "institution" | "code";

interface CreatedCode {
  institution: Institution;
  accessCode: AccessCode;
}

const EMPTY_FORM: InstitutionRequest = {
  name: "",
  domain: "",
  status: "active",
};

const ADMIN_SESSION_KEY = "siladocs_admin_session";

export default function AdminBackofficePage() {
  const router = useRouter();

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<Step>("institution");
  const [form, setForm] = useState<InstitutionRequest>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [createdInstitution, setCreatedInstitution] = useState<Institution | null>(null);

  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);

  const [result, setResult] = useState<CreatedCode | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [instRes, codesRes] = await Promise.all([
        adminApi.get<Institution[]>('/institutions'),
        adminApi.get<AccessCode[]>('/access-codes'),
      ]);
      setInstitutions(instRes.data);
      setAccessCodes(codesRes.data);
    } catch (err) {
      toast.error('Error al cargar los datos. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación frontend completa
    if (!form.name.trim()) {
      toast.warn("El nombre de la institución es requerido");
      return;
    }
    if (!form.domain.trim()) {
      toast.warn("El dominio es requerido");
      return;
    }
    if (!form.status) {
      toast.warn("El estado es requerido");
      return;
    }

    setSaving(true);
    try {
      // Validar que el estado sea uno de los permitidos
      if (!['active', 'inactive', 'pending'].includes(form.status)) {
        throw new Error(`Estado inválido: ${form.status}`);
      }

      // Log para debugging
      console.log('Enviando institución:', form);

      const res = await adminApi.post<Institution>('/institutions', form);
      const inst = res.data;
      setCreatedInstitution(inst);
      setInstitutions((prev) => [inst, ...prev]);
      setStep("code");
      toast.success(`Institución "${inst.name}" creada`);
    } catch (err: any) {
      const responseData = err?.response?.data;
      const statusCode = err?.response?.status;

      // Log completo para ver exactamente qué devuelve el backend
      console.error('Error completo:', {
        status: statusCode,
        responseData,
        headers: err?.response?.headers,
      });

      const backendMsg =
        responseData?.message ||
        responseData?.error ||
        responseData?.detail ||
        (typeof responseData === 'string' ? responseData : null);

      let msg = 'Error al crear la institución';

      if (statusCode === 400) {
        if (backendMsg?.toLowerCase().includes('already') ||
            backendMsg?.toLowerCase().includes('unique') ||
            backendMsg?.toLowerCase().includes('existe') ||
            backendMsg?.toLowerCase().includes('duplicate')) {
          msg = '❌ Esta institución ya existe. Usa un nombre diferente.';
        } else {
          msg = backendMsg
            ? `❌ ${backendMsg}`
            : `❌ Error de validación (400). Revisa la pestaña Network para ver el cuerpo de la respuesta.`;
        }
      } else if (statusCode === 409) {
        msg = '❌ Esta institución ya está registrada en el sistema.';
      } else {
        msg = backendMsg || extractErrorMessage(err, msg);
      }

      toast.error(msg, { autoClose: 8000 });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!createdInstitution) return;
    setSaving(true);
    try {
      const res = await adminApi.post<AccessCode>('/access-codes/generate', { institutionName: createdInstitution.name });
      const code = res.data;
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

  const handleGenerateForExisting = async () => {
    if (!selectedInstitution) return;
    setGeneratingCode(true);
    try {
      const res = await adminApi.post<AccessCode>('/access-codes/generate', { institutionName: selectedInstitution.name });
      const code = res.data;
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

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    router.replace("/admin/login");
  };

  const availableCodes = accessCodes.filter((c) => !c.used);
  const usedCodes = accessCodes.filter((c) => c.used);

  return (
    <Fragment>
      <ToastContainer position="top-right" />

      {/* Admin Header */}
      <header style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "0 2rem",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 130, height: 32 }}>
            <Image
              src="/assets/images/brand-logos/desktop-dark.png"
              alt="Siladocs"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "rgba(71,103,237,0.2)", border: "1px solid rgba(71,103,237,0.4)",
            color: "#93c5fd", borderRadius: 20, padding: "3px 12px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1.5
          }}>
            <i className="ri-shield-keyhole-line" style={{ fontSize: 11 }}></i> BACKOFFICE
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            <i className="ri-user-settings-line me-1"></i>superadmin@siladocs.com
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5", borderRadius: 8, padding: "6px 14px",
              cursor: "pointer", fontSize: "0.82rem", fontWeight: 500,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <i className="ri-logout-box-r-line"></i> Cerrar sesión
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ minHeight: "calc(100vh - 64px)", background: "#f8fafc", padding: "2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Page title */}
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
                        <th>Dominio</th>
                        <th>Estado</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {institutions.map((inst) => (
                        <tr key={inst.id}>
                          <td className="fw-semibold">{inst.name}</td>
                          <td className="text-muted">{inst.domain || "—"}</td>
                          <td><span className={`badge bg-${inst.status === 'active' ? 'success' : 'secondary'}-transparent text-${inst.status === 'active' ? 'success' : 'secondary'}`}>{inst.status || "—"}</span></td>
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
        </div>
      </main>

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
                  <Form.Text className="text-muted">El nombre debe ser único en el sistema.</Form.Text>
                </Col>
                <Col xs={12}>
                  <Form.Label className="fw-medium">Dominio *</Form.Label>
                  <Form.Control name="domain" value={form.domain} onChange={handleChange} placeholder="universidad.edu.pe" required />
                  <Form.Text className="text-muted">Dominio web o email corporativo de la institución.</Form.Text>
                </Col>
                <Col xs={12}>
                  <Form.Label className="fw-medium">Estado</Form.Label>
                  <Form.Select name="status" value={form.status} onChange={handleChange}>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="pending">Pendiente</option>
                  </Form.Select>
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
