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
import { extractPdfLines, PdfLine, extractPdfText } from "@/shared/utils/pdfText";
import { detectSyllabusStructure, SyllabusStructureResult } from "@/shared/utils/syllabusStructure";

const cloneRules = (rules: ValidationRule[]): ValidationRule[] =>
  rules.map((r) => ({ ...r, keywords: [...r.keywords] }));

// Returns a weight to auto-assign when adding a new required rule,
// keeping the total at or below 100% if possible.
const suggestWeight = (rules: ValidationRule[]): number => {
  const requiredRules = rules.filter((r) => r.required);
  const usedWeight = requiredRules.reduce((s, r) => s + r.weight, 0);
  const remaining = Math.max(0, 100 - usedWeight);
  if (remaining === 0) return 0;
  // Divide remaining equally among existing required rules + 1 new one
  return Math.floor(remaining / (requiredRules.length + 1));
};

const SyllabusValidationConfig: React.FC = () => {
  const [rules, setRules] = useState<ValidationRule[]>(() => cloneRules(getValidationRules()));
  const [savedRules, setSavedRules] = useState<ValidationRule[]>(() => cloneRules(getValidationRules()));
  const [keywordDrafts, setKeywordDrafts] = useState<Record<string, string>>({});

  // Plantilla modelo
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateUrl, setTemplateUrl] = useState<string | null>(null);
  const [templateLines, setTemplateLines] = useState<PdfLine[]>([]);
  const [isExtractingTemplate, setIsExtractingTemplate] = useState(false);
  const [templateView, setTemplateView] = useState<"preview" | "lines">("preview");
  const templateInputRef = useRef<HTMLInputElement>(null);

  // Panel de simulación
  const [showSimulator, setShowSimulator] = useState(false);
  const [testFile, setTestFile] = useState<File | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<SyllabusStructureResult | null>(null);
  const [testRulesSnapshot, setTestRulesSnapshot] = useState<string>("");
  const testInputRef = useRef<HTMLInputElement>(null);

  const [isDraggingTemplate, setIsDraggingTemplate] = useState(false);
  const [isDraggingTest, setIsDraggingTest] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const weightTotal = requiredWeightTotal(rules);
  const isOverweight = weightTotal > 100;
  const isDirty = JSON.stringify(rules) !== JSON.stringify(savedRules);
  // True when simulator results reflect a different rule set than current
  const simIsStale = testResult !== null && testRulesSnapshot !== JSON.stringify(rules);

  useEffect(() => {
    if (!templateFile) { setTemplateUrl(null); return; }
    const url = URL.createObjectURL(templateFile);
    setTemplateUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [templateFile]);

  // --- Rule builder handlers ---
  const handleAddRule = () => {
    const weight = suggestWeight(rules);
    const rule: ValidationRule = { id: newRuleId(), name: "", keywords: [], required: true, weight };
    setRules((prev) => [...prev, rule]);
  };

  const handleAddRuleFromLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const weight = suggestWeight(rules);
    const rule: ValidationRule = {
      id: newRuleId(),
      name: trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed,
      keywords: [trimmed.toLowerCase()],
      required: true,
      weight,
    };
    setRules((prev) => [...prev, rule]);
    toast.success(`Sección "${rule.name}" añadida${weight > 0 ? ` con peso ${weight}%` : " — recuerda asignar un peso"}.`);
  };

  const updateRule = (id: string, patch: Partial<ValidationRule>) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    setKeywordDrafts((prev) => { const next = { ...prev }; delete next[id]; return next; });
  };

  const addKeyword = (id: string) => {
    const draft = (keywordDrafts[id] ?? "").trim().toLowerCase();
    if (!draft) return;
    const rule = rules.find((r) => r.id === id);
    if (rule?.keywords.includes(draft)) {
      toast.warning("Esa palabra clave ya existe en esta sección.");
      return;
    }
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, keywords: [...r.keywords, draft] } : r)));
    setKeywordDrafts((prev) => ({ ...prev, [id]: "" }));
  };

  const removeKeyword = (id: string, index: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, keywords: r.keywords.filter((_, i) => i !== index) } : r))
    );
  };

  // --- Template upload + mapping ---
  const handleTemplateSelect = async (file: File) => {
    setTemplateFile(file);
    setTemplateLines([]);
    setTemplateView("preview");
    if (file.type !== "application/pdf") return;
    setIsExtractingTemplate(true);
    try {
      const lines = await extractPdfLines(file);
      setTemplateLines(lines);
      if (lines.length > 0) setTemplateView("lines");
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
      const result = detectSyllabusStructure(text, rules);
      setTestResult(result);
      setTestRulesSnapshot(JSON.stringify(rules));
    } catch {
      toast.error("No se pudo analizar el PDF de prueba.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleReRunTest = async () => {
    if (!testFile) return;
    setIsTesting(true);
    try {
      const text = await extractPdfText(testFile);
      const result = detectSyllabusStructure(text, rules);
      setTestResult(result);
      setTestRulesSnapshot(JSON.stringify(rules));
    } catch {
      toast.error("No se pudo analizar el PDF de prueba.");
    } finally {
      setIsTesting(false);
    }
  };

  // --- Drag & drop ---
  const handleDropFile = (e: React.DragEvent<HTMLDivElement>, onFile: (file: File) => void) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Solo se aceptan archivos PDF.");
      return;
    }
    onFile(file);
  };

  // --- Acciones finales ---
  const handleDiscard = () => {
    setRules(cloneRules(savedRules));
    setTestResult(null);
    toast.info("Cambios descartados.");
  };

  const handleSave = () => {
    const noName = rules.find((r) => !r.name.trim());
    if (noName) {
      toast.error("Todas las secciones deben tener un nombre.");
      return;
    }
    const noKeywords = rules.find((r) => r.required && r.keywords.length === 0);
    if (noKeywords) {
      toast.error(`La sección "${noKeywords.name || "sin nombre"}" es obligatoria pero no tiene palabras clave — nunca se detectará.`);
      return;
    }
    if (isOverweight) {
      toast.error("La suma de pesos de las secciones obligatorias supera el 100%. Ajusta los pesos antes de guardar.");
      return;
    }
    saveValidationRules(rules);
    setSavedRules(cloneRules(rules));
    // Reset stale indicator since saved rules now match current rules
    if (testResult) setTestRulesSnapshot(JSON.stringify(rules));
    toast.success("Configuración guardada. Se aplicará a los próximos sílabos cargados.");
  };

  const handleRestoreDefaults = () => {
    if (confirmingReset) {
      setRules(cloneRules(DEFAULT_VALIDATION_RULES));
      setConfirmingReset(false);
      setTestResult(null);
      toast.info("Reglas restauradas a valores por defecto.");
    } else {
      setConfirmingReset(true);
      setTimeout(() => setConfirmingReset(false), 4000);
    }
  };

  // Weight distribution bar data (only required rules with weight > 0)
  const requiredWithWeight = rules.filter((r) => r.required && r.weight > 0);
  const barColors = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#3b82f6"];

  return (
    <div>
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 className="fw-bold mb-1">Configuración de Reglas de Validación</h5>
          <p className="text-muted fs-13 mb-0">
            Define las secciones y criterios obligatorios que el sistema detectará automáticamente en los PDFs cargados por los docentes.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <SpkButton Customclass="btn btn-pink" onClick={handleDiscard} Disabled={!isDirty}>
            Descartar cambios
          </SpkButton>
          <SpkButton Customclass="btn btn-primary" onClick={handleSave} Disabled={!isDirty || isOverweight}>
            <i className="ri-save-3-line me-1"></i>Guardar configuración
          </SpkButton>
        </div>
      </div>

      <Row className="g-3">
        {/* COLUMNA IZQUIERDA: Constructor de estructura */}
        <Col lg={7}>
          <Card className="custom-card h-100">
            <Card.Body>
              {/* Header con peso total */}
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="fs-13 fw-semibold text-uppercase ls-1 text-muted">
                  <i className="ri-list-settings-line me-1"></i>Secciones del sílabo
                </span>
                <span className={`badge ${isOverweight ? "bg-danger-transparent text-danger" : weightTotal === 100 ? "bg-success-transparent text-success" : "bg-warning-transparent text-warning"}`}>
                  {weightTotal}% / 100% asignado
                </span>
              </div>

              {/* Barra de distribución de pesos */}
              {requiredWithWeight.length > 0 && (
                <div className="mb-3">
                  <div style={{ display: "flex", height: 6, borderRadius: 99, overflow: "hidden", gap: 1 }}>
                    {requiredWithWeight.map((r, i) => (
                      <div
                        key={r.id}
                        title={`${r.name}: ${r.weight}%`}
                        style={{
                          width: `${(r.weight / Math.max(weightTotal, 1)) * 100}%`,
                          background: barColors[i % barColors.length],
                          minWidth: 2,
                        }}
                      />
                    ))}
                    {weightTotal < 100 && (
                      <div style={{ flex: 1, background: "#e2e8f0" }} title="Sin asignar" />
                    )}
                  </div>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {requiredWithWeight.map((r, i) => (
                      <span key={r.id} className="fs-11 text-muted d-flex align-items-center gap-1">
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: barColors[i % barColors.length], display: "inline-block" }} />
                        {r.name || "Sin nombre"} ({r.weight}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {isOverweight && (
                <Alert variant="danger" className="py-2 fs-13 mb-2">
                  <i className="ri-alert-line me-1"></i>
                  La suma de pesos supera el 100%. Reduce el peso de alguna sección antes de guardar.
                </Alert>
              )}

              {weightTotal < 100 && weightTotal > 0 && rules.some((r) => r.required) && (
                <Alert variant="warning" className="py-2 fs-13 mb-2">
                  <i className="ri-alert-line me-1"></i>
                  Quedan <strong>{100 - weightTotal}%</strong> sin asignar. Un sílabo perfecto igual obtendrá 100% porque el puntaje es relativo al total asignado.
                </Alert>
              )}

              <ReactSortable list={rules} setList={setRules} animation={150} handle=".rule-drag-handle" className="d-flex flex-column gap-2">
                {rules.map((rule) => {
                  const hasNoKeywords = rule.keywords.length === 0;
                  const hasZeroWeight = rule.required && rule.weight === 0;
                  const hasIssue = hasNoKeywords || hasZeroWeight;

                  return (
                    <div
                      key={rule.id}
                      className={`border rounded-3 p-3 ${hasIssue ? "border-warning" : "bg-light"}`}
                      style={hasIssue ? { background: "#fffbeb" } : undefined}
                    >
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
                        <button
                          className="btn btn-sm btn-light text-danger flex-shrink-0"
                          title="Eliminar sección"
                          onClick={() => removeRule(rule.id)}
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>

                      {/* Alertas inline de la regla */}
                      {hasNoKeywords && (
                        <div className="fs-12 text-warning fw-semibold mb-2">
                          <i className="ri-alert-line me-1"></i>
                          Sin palabras clave — esta sección nunca será detectada en ningún PDF.
                        </div>
                      )}
                      {!hasNoKeywords && hasZeroWeight && (
                        <div className="fs-12 text-warning fw-semibold mb-2">
                          <i className="ri-alert-line me-1"></i>
                          Peso 0% — esta sección no afecta el puntaje de validación.
                        </div>
                      )}

                      <div className="mb-2">
                        <Form.Label className="fs-12 text-muted mb-1">Palabras clave o títulos alternativos</Form.Label>
                        <div className="d-flex flex-wrap gap-1 mb-2">
                          {rule.keywords.map((kw, idx) => (
                            <span key={idx} className="badge bg-primary-transparent text-primary d-flex align-items-center gap-1">
                              {kw}
                              <i
                                className="ri-close-line"
                                style={{ cursor: "pointer" }}
                                onClick={() => removeKeyword(rule.id, idx)}
                              ></i>
                            </span>
                          ))}
                        </div>
                        <div className="d-flex gap-2">
                          <Form.Control
                            type="text"
                            size="sm"
                            placeholder="Agregar palabra clave y presiona Enter"
                            value={keywordDrafts[rule.id] ?? ""}
                            onChange={(e) =>
                              setKeywordDrafts((prev) => ({ ...prev, [rule.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") { e.preventDefault(); addKeyword(rule.id); }
                            }}
                          />
                          <button
                            className="btn btn-sm btn-outline-primary text-nowrap"
                            onClick={() => addKeyword(rule.id)}
                          >
                            Añadir
                          </button>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-4 flex-wrap">
                        <Form.Check
                          type="switch"
                          id={`required-${rule.id}`}
                          label={rule.required ? "Obligatoria" : "Opcional"}
                          checked={rule.required}
                          onChange={(e) => updateRule(rule.id, { required: e.target.checked, weight: e.target.checked ? rule.weight : 0 })}
                        />
                        {rule.required && (
                          <div className="d-flex align-items-center gap-2" style={{ maxWidth: 220 }}>
                            <Form.Label className="fs-12 text-muted mb-0 text-nowrap">Peso (%)</Form.Label>
                            <Form.Control
                              type="number"
                              size="sm"
                              min={0}
                              max={100}
                              value={rule.weight}
                              onChange={(e) =>
                                updateRule(rule.id, { weight: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })
                              }
                            />
                          </div>
                        )}
                        {!rule.required && (
                          <span className="fs-12 text-muted">
                            <i className="ri-information-line me-1"></i>Las secciones opcionales no afectan el puntaje.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </ReactSortable>

              {rules.length === 0 && (
                <div className="text-center text-muted py-4">
                  <i className="ri-file-list-3-line fs-1 mb-2 d-block"></i>
                  <p className="mb-0">Aún no hay secciones configuradas.</p>
                </div>
              )}

              <div className="d-flex gap-2 mt-3 flex-wrap">
                <button className="btn btn-outline-primary btn-sm" onClick={handleAddRule}>
                  <i className="ri-add-line me-1"></i>Añadir sección
                </button>
                <button
                  className={`btn btn-sm ${confirmingReset ? "btn-danger" : "btn-outline-secondary"}`}
                  onClick={handleRestoreDefaults}
                >
                  <i className="ri-refresh-line me-1"></i>
                  {confirmingReset ? "¿Confirmar? Esto borrará tus reglas" : "Restaurar por defecto"}
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* COLUMNA DERECHA: Plantilla modelo */}
        <Col lg={5}>
          <Card className="custom-card h-100">
            <Card.Body>
              <span className="fs-13 fw-semibold text-uppercase ls-1 text-muted d-block mb-3">
                <i className="ri-file-search-line me-1"></i>Plantilla Modelo
              </span>

              <div
                onClick={() => templateInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingTemplate(true); }}
                onDragLeave={() => setIsDraggingTemplate(false)}
                onDrop={(e) => { setIsDraggingTemplate(false); handleDropFile(e, handleTemplateSelect); }}
                style={{
                  border: `2px dashed ${isDraggingTemplate ? "#6366f1" : templateFile ? "#22c55e" : "#cbd5e1"}`,
                  borderRadius: "12px",
                  padding: templateFile ? "0.75rem" : "1.5rem",
                  textAlign: "center",
                  cursor: "pointer",
                  background: isDraggingTemplate ? "#eef2ff" : templateFile ? "#f0fdf4" : "#f8fafc",
                  marginBottom: "0.75rem",
                  transition: "background-color 0.15s, border-color 0.15s",
                }}
              >
                {templateFile ? (
                  <div className="d-flex align-items-center gap-2 text-start">
                    <i className="ri-file-pdf-2-line text-danger fs-3"></i>
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="fw-semibold mb-0 fs-13 text-truncate">{templateFile.name}</p>
                      <p className="text-muted fs-12 mb-0">
                        {isExtractingTemplate ? "Leyendo líneas…" : `${templateLines.length} líneas detectadas · haz clic para cambiar`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <i className="ri-upload-cloud-2-line fs-2 mb-1 d-block text-muted"></i>
                    <p className="fw-semibold mb-1 fs-13">Sube un sílabo base o plantilla modelo</p>
                    <p className="text-muted fs-12 mb-1">El sistema extrae sus secciones para que puedas crear reglas desde ellas</p>
                    <span className="badge bg-light text-muted fs-11">PDF</span>
                  </>
                )}
              </div>
              <input
                type="file"
                accept=".pdf"
                ref={templateInputRef}
                className="d-none"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleTemplateSelect(f); e.target.value = ""; }}
              />

              {templateFile && !isExtractingTemplate && (
                <>
                  {/* Tabs: Preview / Lines */}
                  <div className="d-flex gap-0 mb-2" style={{ borderBottom: "1px solid #e2e8f0" }}>
                    {(["preview", "lines"] as const).map((v) => (
                      <button
                        key={v}
                        className="btn btn-sm"
                        style={{
                          borderRadius: 0,
                          borderBottom: templateView === v ? "2px solid #6366f1" : "2px solid transparent",
                          color: templateView === v ? "#6366f1" : "#64748b",
                          fontWeight: templateView === v ? 600 : 400,
                          fontSize: 12,
                          padding: "4px 12px",
                          background: "none",
                        }}
                        onClick={() => setTemplateView(v)}
                      >
                        {v === "preview" ? "Vista previa" : `Líneas (${templateLines.length})`}
                      </button>
                    ))}
                  </div>

                  {templateView === "preview" && templateUrl ? (
                    <div className="border rounded-3 overflow-hidden" style={{ height: 420 }}>
                      <iframe src={templateUrl} width="100%" height="100%" style={{ border: "none" }} title="Plantilla modelo" />
                    </div>
                  ) : (
                    <div className="border rounded-3 p-2" style={{ height: 420, overflowY: "auto" }}>
                      {templateLines.length === 0 ? (
                        <p className="text-muted fs-12 p-2 mb-0">No se detectó texto seleccionable en el PDF.</p>
                      ) : (
                        <>
                          <p className="text-muted fs-12 px-2 mb-1">
                            Haz clic en una línea para crear una sección de validación a partir de ella.
                          </p>
                          <ul className="list-unstyled mb-0 fs-12">
                            {templateLines.map((line, idx) => (
                              <li
                                key={idx}
                                className="px-2 py-1 rounded-1 d-flex align-items-baseline gap-2"
                                style={{ cursor: "pointer" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#eef2ff")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                onClick={() => handleAddRuleFromLine(line.text)}
                                title="Clic para crear una sección a partir de esta línea"
                              >
                                <span className="text-muted flex-shrink-0" style={{ fontSize: 10 }}>p.{line.page}</span>
                                <span>{line.text}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}

              {isExtractingTemplate && (
                <div className="d-flex align-items-center gap-2 text-muted fs-13 mt-2">
                  <Spinner animation="border" size="sm" />
                  Extrayendo líneas del PDF…
                </div>
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
            <div className="d-flex align-items-center gap-2">
              <span className="fs-13 fw-semibold text-uppercase ls-1 text-muted">
                <i className="ri-flask-line me-1"></i>Probar reglas con un PDF real
              </span>
              {simIsStale && (
                <span className="badge bg-warning-transparent text-warning fs-11">
                  <i className="ri-refresh-line me-1"></i>Resultado desactualizado
                </span>
              )}
            </div>
            <i className={`ri-arrow-${showSimulator ? "up" : "down"}-s-line fs-5`}></i>
          </div>

          {showSimulator && (
            <div className="mt-3">
              {isDirty && (
                <Alert variant="info" className="py-2 fs-13 mb-3">
                  <i className="ri-information-line me-1"></i>
                  El simulador usa las reglas <strong>actuales sin guardar</strong>. Guarda primero si quieres que esto refleje la configuración oficial.
                </Alert>
              )}

              <div
                onClick={() => testInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingTest(true); }}
                onDragLeave={() => setIsDraggingTest(false)}
                onDrop={(e) => { setIsDraggingTest(false); handleDropFile(e, handleTestSelect); }}
                style={{
                  border: `2px dashed ${isDraggingTest ? "#6366f1" : testFile ? "#22c55e" : "#cbd5e1"}`,
                  borderRadius: "12px",
                  padding: "1rem",
                  textAlign: "center",
                  cursor: "pointer",
                  background: isDraggingTest ? "#eef2ff" : testFile ? "#f0fdf4" : "#f8fafc",
                  marginBottom: "1rem",
                  transition: "background-color 0.15s, border-color 0.15s",
                }}
              >
                {testFile ? (
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <i className="ri-file-pdf-2-line text-danger fs-4"></i>
                    <p className="fw-semibold mb-0 fs-13">{testFile.name}</p>
                  </div>
                ) : (
                  <p className="mb-0 fs-13 text-muted">
                    <i className="ri-upload-cloud-2-line me-1"></i>
                    Sube un PDF de un docente para ver qué secciones detectaría el validador con las reglas actuales
                  </p>
                )}
              </div>
              <input
                type="file"
                accept=".pdf"
                ref={testInputRef}
                className="d-none"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleTestSelect(f); e.target.value = ""; }}
              />

              {isTesting ? (
                <div className="d-flex align-items-center gap-2 text-muted fs-13">
                  <Spinner animation="border" size="sm" />
                  Analizando con las reglas actuales…
                </div>
              ) : testResult ? (
                <>
                  <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                    <span className="fs-12 fw-semibold text-muted text-uppercase ls-1">
                      Resultado — {testResult.foundCount}/{testResult.totalCount} secciones encontradas
                    </span>
                    <div className="d-flex align-items-center gap-2">
                      {simIsStale && (
                        <button className="btn btn-sm btn-outline-primary" onClick={handleReRunTest} disabled={isTesting}>
                          <i className="ri-refresh-line me-1"></i>Re-ejecutar
                        </button>
                      )}
                      <span className={`badge ${testResult.structureScore === 100 ? "bg-success-transparent text-success" : testResult.structureScore >= 50 ? "bg-warning-transparent text-warning" : "bg-danger-transparent text-danger"}`}>
                        {testResult.structureScore}% de cobertura
                      </span>
                    </div>
                  </div>
                  <ul className="list-unstyled mb-3 fs-13">
                    {testResult.sections.map((section) => (
                      <li key={section.key} className="d-flex align-items-start gap-2 mb-2 pb-2" style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <i className={`ri-${section.found ? "checkbox-circle-fill text-success" : section.required ? "close-circle-fill text-danger" : "checkbox-blank-circle-line text-muted"} mt-1`}></i>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className={section.found ? "fw-semibold" : ""}>{section.label}</span>
                            {!section.required && (
                              <span className="badge bg-light text-muted fs-11">Opcional</span>
                            )}
                            {section.required && section.weight > 0 && (
                              <span className="badge bg-info-transparent text-info fs-11">{section.weight}%</span>
                            )}
                          </div>
                          {section.found && section.matchedKeyword && (
                            <span className="fs-11 text-muted">
                              Detectado por: <code className="fs-11">{section.matchedKeyword}</code>
                            </span>
                          )}
                          {!section.found && section.keywords.length > 0 && (
                            <span className="fs-11 text-muted">
                              Buscadas: {section.keywords.slice(0, 3).join(", ")}{section.keywords.length > 3 ? "…" : ""}
                            </span>
                          )}
                        </div>
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
