"use client";

import React, { useEffect, useRef, useState } from "react";
import { Alert, Card, Col, Form, ProgressBar, Row, Spinner } from "react-bootstrap";
import { ReactSortable } from "react-sortablejs";
import { toast } from "react-toastify";
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import {
  DEFAULT_VALIDATION_RULES,
  ValidationRule,
  getValidationRules,
  newRuleId,
  requiredWeightTotal,
  saveValidationRules,
} from "@/shared/utils/validationRules";
import { extractPdfLines, PdfLine } from "@/shared/utils/pdfText";
import { extractPdfText } from "@/shared/utils/pdfText";
import { detectSyllabusStructure, SyllabusStructureResult } from "@/shared/utils/syllabusStructure";

const cloneRules = (rules: ValidationRule[]): ValidationRule[] => rules.map((r) => ({ ...r, keywords: [...r.keywords] }));

const SyllabusValidationConfig: React.FC = () => {
  const [rules, setRules] = useState<ValidationRule[]>(() => cloneRules(getValidationRules()));
  const [savedRules, setSavedRules] = useState<ValidationRule[]>(() => cloneRules(getValidationRules()));
  const [keywordDrafts, setKeywordDrafts] = useState<Record<string, string>>({});

  // Plantilla modelo (mapeo de secciones)
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateUrl, setTemplateUrl] = useState<string | null>(null);
  const [templateLines, setTemplateLines] = useState<PdfLine[]>([]);
  const [isExtractingTemplate, setIsExtractingTemplate] = useState(false);
  const templateInputRef = useRef<HTMLInputElement>(null);

  // Panel de simulación
  const [showSimulator, setShowSimulator] = useState(false);
  const [testFile, setTestFile] = useState<File | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<SyllabusStructureResult | null>(null);
  const testInputRef = useRef<HTMLInputElement>(null);

  const weightTotal = requiredWeightTotal(rules);
  const isOverweight = weightTotal > 100;
  const isDirty = JSON.stringify(rules) !== JSON.stringify(savedRules);

  useEffect(() => {
    if (!templateFile) { setTemplateUrl(null); return; }
    const url = URL.createObjectURL(templateFile);
    setTemplateUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [templateFile]);

  // --- Rule builder handlers ---
  const handleAddRule = () => {
    const rule: ValidationRule = { id: newRuleId(), name: "", keywords: [], required: true, weight: 0 };
    setRules((prev) => [...prev, rule]);
  };

  const handleAddRuleFromLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const rule: ValidationRule = {
      id: newRuleId(),
      name: trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed,
      keywords: [trimmed.toLowerCase()],
      required: true,
      weight: 0,
    };
    setRules((prev) => [...prev, rule]);
    toast.success(`Sección "${rule.name}" añadida desde la plantilla.`);
  };

  const updateRule = (id: string, patch: Partial<ValidationRule>) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    setKeywordDrafts((prev) => { const next = { ...prev }; delete next[id]; return next; });
  };

  const addKeyword = (id: string) => {
    const draft = (keywordDrafts[id] ?? "").trim();
    if (!draft) return;
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, keywords: [...r.keywords, draft] } : r)));
    setKeywordDrafts((prev) => ({ ...prev, [id]: "" }));
  };

  const removeKeyword = (id: string, index: number) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, keywords: r.keywords.filter((_, i) => i !== index) } : r)));
  };

  // --- Template upload + mapping ---
  const handleTemplateSelect = async (file: File) => {
    setTemplateFile(file);
    setTemplateLines([]);
    if (file.type !== "application/pdf") return;
    setIsExtractingTemplate(true);
    try {
      const lines = await extractPdfLines(file);
      setTemplateLines(lines);
    } catch {
      toast.error("No se pudo leer la plantilla. Intenta con otro PDF.");
    } finally {
      setIsExtractingTemplate(false);
    }
  };

  // --- Simulación ---
  const handleTestSelect = async (file: File) => {
    setTestFile(file);
    setTestResult(null);
    if (file.type !== "application/pdf") return;
    setIsTesting(true);
    try {
      const text = await extractPdfText(file);
      setTestResult(detectSyllabusStructure(text, rules));
    } catch {
      toast.error("No se pudo analizar el PDF de prueba.");
    } finally {
      setIsTesting(false);
    }
  };

  // --- Acciones finales ---
  const handleDiscard = () => {
    setRules(cloneRules(savedRules));
    toast.info("Cambios descartados.");
  };

  const handleSave = () => {
    if (rules.some((r) => !r.name.trim())) {
      toast.error("Todas las secciones necesitan un nombre.");
      return;
    }
    if (isOverweight) {
      toast.error("La suma de pesos de las secciones obligatorias no puede superar el 100%.");
      return;
    }
    saveValidationRules(rules);
    setSavedRules(cloneRules(rules));
    toast.success("Configuración de validación guardada. Se aplicará a los próximos sílabos cargados.");
  };

  const handleRestoreDefaults = () => {
    setRules(cloneRules(DEFAULT_VALIDATION_RULES));
  };

  return (
    <div>
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 className="fw-bold mb-1">Configuración de Reglas de Validación</h5>
          <p className="text-muted fs-13 mb-0">
            Define las secciones y criterios obligatorios que el sistema deberá detectar automáticamente en los archivos PDF cargados.
          </p>
        </div>
        <div className="d-flex gap-2">
          <SpkButton Customclass="btn btn-pink" onClick={handleDiscard} Disabled={!isDirty}>
            Cancelar / Descartar Cambios
          </SpkButton>
          <SpkButton Customclass="btn btn-primary" onClick={handleSave} Disabled={isOverweight}>
            <i className="ri-save-3-line me-1"></i>Guardar Configuración de Validación
          </SpkButton>
        </div>
      </div>

      <Row className="g-3">
        {/* COLUMNA IZQUIERDA: Constructor de estructura */}
        <Col lg={7}>
          <Card className="custom-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fs-13 fw-semibold text-uppercase ls-1 text-muted">
                  <i className="ri-list-settings-line me-1"></i>Constructor de Estructura
                </span>
                <span className={`badge ${isOverweight ? "bg-danger-transparent text-danger" : "bg-info-transparent text-info"}`}>
                  Total obligatorio: {weightTotal}% / 100%
                </span>
              </div>

              {isOverweight && (
                <Alert variant="danger" className="py-2 fs-13">
                  <i className="ri-alert-line me-1"></i>
                  La suma de pesos de las secciones obligatorias supera el 100%. Ajusta los pesos antes de guardar.
                </Alert>
              )}

              <ReactSortable list={rules} setList={setRules} animation={150} handle=".rule-drag-handle" className="d-flex flex-column gap-2">
                {rules.map((rule) => (
                  <div key={rule.id} className="border rounded-3 p-3 bg-light">
                    <div className="d-flex align-items-start gap-2 mb-2">
                      <span className="rule-drag-handle text-muted pt-1" style={{ cursor: "grab" }}>
                        <i className="ri-draggable fs-5"></i>
                      </span>
                      <Form.Control
                        type="text"
                        placeholder="Nombre de la sección (ej. Logro de Aprendizaje)"
                        value={rule.name}
                        onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                        className="fw-semibold"
                      />
                      <button className="btn btn-sm btn-light text-danger" title="Eliminar sección" onClick={() => removeRule(rule.id)}>
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>

                    <div className="mb-2">
                      <Form.Label className="fs-12 text-muted mb-1">Palabras clave o títulos alternativos</Form.Label>
                      <div className="d-flex flex-wrap gap-1 mb-2">
                        {rule.keywords.map((kw, idx) => (
                          <span key={idx} className="badge bg-primary-transparent text-primary d-flex align-items-center gap-1">
                            {kw}
                            <i className="ri-close-line" style={{ cursor: "pointer" }} onClick={() => removeKeyword(rule.id, idx)}></i>
                          </span>
                        ))}
                      </div>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="text"
                          size="sm"
                          placeholder="Agregar palabra clave y presiona Enter"
                          value={keywordDrafts[rule.id] ?? ""}
                          onChange={(e) => setKeywordDrafts((prev) => ({ ...prev, [rule.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(rule.id); } }}
                        />
                        <button className="btn btn-sm btn-outline-primary text-nowrap" onClick={() => addKeyword(rule.id)}>Añadir</button>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-4 flex-wrap">
                      <Form.Check
                        type="switch"
                        id={`required-${rule.id}`}
                        label={rule.required ? "Obligatoria" : "Opcional"}
                        checked={rule.required}
                        onChange={(e) => updateRule(rule.id, { required: e.target.checked })}
                      />
                      <div className="d-flex align-items-center gap-2" style={{ maxWidth: 220 }}>
                        <Form.Label className="fs-12 text-muted mb-0 text-nowrap">Peso (%)</Form.Label>
                        <Form.Control
                          type="number"
                          size="sm"
                          min={0}
                          max={100}
                          value={rule.weight}
                          onChange={(e) => updateRule(rule.id, { weight: Number(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </ReactSortable>

              {rules.length === 0 && (
                <div className="text-center text-muted py-4">
                  <i className="ri-file-list-3-line fs-1 mb-2 d-block"></i>
                  <p className="mb-0">Aún no hay secciones configuradas.</p>
                </div>
              )}

              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-outline-primary btn-sm" onClick={handleAddRule}>
                  <i className="ri-add-line me-1"></i>Añadir Nueva Sección Requerida
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={handleRestoreDefaults}>
                  <i className="ri-refresh-line me-1"></i>Restaurar valores por defecto
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* COLUMNA DERECHA: Plantilla y mapeo */}
        <Col lg={5}>
          <Card className="custom-card h-100">
            <Card.Body>
              <span className="fs-13 fw-semibold text-uppercase ls-1 text-muted d-block mb-3">
                <i className="ri-file-search-line me-1"></i>Plantilla Modelo
              </span>

              <div
                onClick={() => templateInputRef.current?.click()}
                style={{
                  border: `2px dashed ${templateFile ? "#22c55e" : "#cbd5e1"}`,
                  borderRadius: "12px",
                  padding: templateFile ? "0.75rem" : "1.5rem",
                  textAlign: "center",
                  cursor: "pointer",
                  background: templateFile ? "#f0fdf4" : "#f8fafc",
                  marginBottom: "0.75rem",
                }}
              >
                {templateFile ? (
                  <div className="d-flex align-items-center gap-2 text-start">
                    <i className="ri-file-pdf-2-line text-danger fs-3"></i>
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="fw-semibold mb-0 fs-13 text-truncate">{templateFile.name}</p>
                      <p className="text-muted fs-12 mb-0">Haz clic en una línea para crear una sección</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <i className="ri-upload-cloud-2-line fs-2 mb-1 d-block text-muted"></i>
                    <p className="fw-semibold mb-1 fs-13">Sube un sílabo base o plantilla modelo</p>
                    <span className="badge bg-light text-muted fs-11">PDF</span>
                  </>
                )}
              </div>
              <input
                type="file"
                accept=".pdf"
                ref={templateInputRef}
                className="d-none"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleTemplateSelect(f); }}
              />

              {templateFile && (
                <>
                  {templateUrl && (
                    <div className="border rounded-3 overflow-hidden mb-2" style={{ height: 420 }}>
                      <iframe src={templateUrl} width="100%" height="100%" style={{ border: "none" }} title="Plantilla modelo" />
                    </div>
                  )}
                  <span className="fs-12 fw-semibold text-uppercase ls-1 text-muted d-block mb-2">
                    Líneas detectadas
                  </span>
                  <div className="border rounded-3 p-2" style={{ height: 220, overflowY: "auto" }}>
                    {isExtractingTemplate ? (
                      <div className="d-flex align-items-center gap-2 text-muted fs-13 p-2">
                        <Spinner animation="border" size="sm" />
                        Leyendo plantilla...
                      </div>
                    ) : templateLines.length === 0 ? (
                      <p className="text-muted fs-12 p-2 mb-0">No se detectó texto seleccionable en el PDF.</p>
                    ) : (
                      <ul className="list-unstyled mb-0 fs-12">
                        {templateLines.map((line, idx) => (
                          <li
                            key={idx}
                            className="px-2 py-1 rounded-1"
                            style={{ cursor: "pointer" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#eef2ff")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            onClick={() => handleAddRuleFromLine(line.text)}
                            title="Clic para crear una sección a partir de esta línea"
                          >
                            <span className="text-muted">p.{line.page}</span> {line.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* PANEL DE SIMULACIÓN */}
      <Card className="custom-card mt-3">
        <Card.Body>
          <div
            className="d-flex align-items-center justify-content-between"
            style={{ cursor: "pointer" }}
            onClick={() => setShowSimulator((prev) => !prev)}
          >
            <span className="fs-13 fw-semibold text-uppercase ls-1 text-muted">
              <i className="ri-flask-line me-1"></i>Probar Reglas
            </span>
            <i className={`ri-arrow-${showSimulator ? "up" : "down"}-s-line fs-5`}></i>
          </div>

          {showSimulator && (
            <div className="mt-3">
              <div
                onClick={() => testInputRef.current?.click()}
                style={{
                  border: `2px dashed ${testFile ? "#22c55e" : "#cbd5e1"}`,
                  borderRadius: "12px",
                  padding: "1rem",
                  textAlign: "center",
                  cursor: "pointer",
                  background: testFile ? "#f0fdf4" : "#f8fafc",
                  marginBottom: "1rem",
                }}
              >
                {testFile ? (
                  <p className="fw-semibold mb-0 fs-13">{testFile.name}</p>
                ) : (
                  <p className="mb-0 fs-13 text-muted">
                    <i className="ri-upload-cloud-2-line me-1"></i>
                    Sube un PDF de prueba de un docente para ver cómo respondería el validador con las reglas actuales
                  </p>
                )}
              </div>
              <input
                type="file"
                accept=".pdf"
                ref={testInputRef}
                className="d-none"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleTestSelect(f); }}
              />

              {isTesting ? (
                <div className="d-flex align-items-center gap-2 text-muted fs-13">
                  <Spinner animation="border" size="sm" />
                  Analizando con las reglas actuales...
                </div>
              ) : testResult ? (
                <>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fs-12 fw-semibold text-muted text-uppercase ls-1">Resultado de la simulación</span>
                    <span className={`badge ${testResult.structureScore === 100 ? "bg-success-transparent text-success" : testResult.structureScore >= 50 ? "bg-warning-transparent text-warning" : "bg-danger-transparent text-danger"}`}>
                      {testResult.structureScore}% de precisión
                    </span>
                  </div>
                  <ul className="list-unstyled mb-2 fs-13">
                    {testResult.sections.map((section) => (
                      <li key={section.key} className="d-flex align-items-center gap-2 mb-1">
                        <i className={`ri-${section.found ? "checkbox-circle-fill text-success" : "close-circle-fill text-danger"}`}></i>
                        {section.label}
                        {!section.required && <span className="badge bg-light text-muted fs-11">Opcional</span>}
                        {!section.found && <span className="text-muted fs-12">— no encontrada</span>}
                      </li>
                    ))}
                  </ul>
                  <ProgressBar
                    now={testResult.structureScore}
                    variant={testResult.structureScore === 100 ? "success" : testResult.structureScore >= 50 ? "warning" : "danger"}
                    style={{ height: "6px", borderRadius: "99px" }}
                  />
                </>
              ) : null}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default SyllabusValidationConfig;
