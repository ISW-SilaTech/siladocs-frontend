"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import { SyllabiService } from '@/shared/services/syllabi.service';
import { evaluateSyllabusHeuristics, SyllabusHeuristicResult } from '@/shared/utils/syllabusValidation';

interface SyllabusConfirmationModalProps {
  show: boolean;
  courseName: string;
  courseCode: string;
  syllabusFileName: string;
  file?: File | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const SyllabusConfirmationModal: React.FC<SyllabusConfirmationModalProps> = ({
  show,
  courseName,
  courseCode,
  syllabusFileName,
  file = null,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const [step, setStep] = useState<'confirm' | 'confirmed'>('confirm');
  const [analysisResult, setAnalysisResult] = useState<{
    detectedCode: string | null;
    confidence: number;
    isMatch: boolean;
    message: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [heuristics, setHeuristics] = useState<SyllabusHeuristicResult | null>(null);

  useEffect(() => {
    if (show) {
      setStep('confirm');
      setAnalysisResult(null);
      setHeuristics(null);
      // Ejecutar análisis de forma asincrónica dentro del modal
      if (file && courseCode) {
        performAnalysis();
      }
    }
  }, [show]);

  const performAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    let contentAnalysis: { isMatch: boolean; confidence: number } | null = null;
    try {
      console.log('[DEBUG] Analyzing file in modal:', file.name, 'for course:', courseCode);
      const result = await SyllabiService.analyzeFile(file, courseCode);
      console.log('[DEBUG] Analysis result:', result);
      setAnalysisResult({
        detectedCode: result.detectedCode,
        confidence: result.confidence,
        isMatch: result.isMatch,
        message: result.message,
      });
      contentAnalysis = { isMatch: result.isMatch, confidence: result.confidence };
    } catch (err) {
      console.warn('[DEBUG] File analysis failed in modal:', err);
      setAnalysisResult(null);
    } finally {
      // Filtros 1-3: nombre de archivo, contenido (resultado de /syllabi/analyze ya obtenido)
      // y heurística de validez del documento, combinados en un único % de confianza.
      setHeuristics(evaluateSyllabusHeuristics({
        fileName: file.name,
        fileSize: file.size,
        courseCode,
        contentAnalysis,
      }));
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    setStep('confirmed');
    setTimeout(() => {
      onConfirm();
    }, 800);
  };

  const handleCancel = () => {
    setStep('confirm');
    onCancel();
  };

  return (
    <Modal
      show={show}
      onHide={handleCancel}
      centered
      backdrop="static"
      keyboard={false}
      size="lg"
      backdropClassName="syllabus-modal-backdrop"
    >
      <Modal.Header closeButton={!isLoading} className="border-bottom-0 pb-0">
        <Modal.Title className="fs-16 fw-bold">
          {step === 'confirm' ? (
            <>
              <i className="ri-checkbox-circle-blank-line me-2 text-warning"></i>
              Confirmar Sílabo
            </>
          ) : (
            <>
              <i className="ri-checkbox-circle-fill me-2 text-success"></i>
              ¡Confirmado!
            </>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-4">
        {step === 'confirm' ? (
          <div>
            {/* Curso Destino */}
            <div className="mb-4">
              <div className="d-flex align-items-start gap-3 p-3 border rounded-3 bg-light">
                <div className="d-flex align-items-center justify-content-center" style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                  flexShrink: 0,
                }}>
                  <i className="ri-book-open-line text-info" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div className="flex-grow-1">
                  <p className="text-muted fs-12 fw-bold mb-1 text-uppercase ls-1">Curso Destino</p>
                  <p className="fw-bold mb-1" style={{ fontSize: '1.1rem' }}>
                    <code className="bg-white px-2 py-1 rounded">{courseCode}</code>
                  </p>
                  <p className="text-secondary mb-0">{courseName}</p>
                </div>
              </div>
            </div>

            {/* Flecha */}
            <div className="text-center mb-3">
              <i className="ri-arrow-down-line text-primary" style={{ fontSize: '1.5rem' }}></i>
            </div>

            {/* Sílabo a Cargar */}
            <div className="mb-4">
              <div className="d-flex align-items-start gap-3 p-3 border rounded-3 bg-light">
                <div className="d-flex align-items-center justify-content-center" style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                  flexShrink: 0,
                }}>
                  <i className="ri-file-pdf-2-line text-warning" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div className="flex-grow-1">
                  <p className="text-muted fs-12 fw-bold mb-1 text-uppercase ls-1">Sílabo a Cargar</p>
                  <p className="fw-medium mb-2" style={{ wordBreak: 'break-word' }}>{syllabusFileName}</p>
                  <small className="text-muted">Este archivo se registrará como <strong>Draft</strong> hasta confirmar todos los detalles</small>
                </div>
              </div>
            </div>

            {/* Analysis Loading State */}
            {isAnalyzing && (
              <div className="mb-4">
                <Alert variant="info" className="mb-0">
                  <div className="d-flex align-items-center gap-2">
                    <Spinner as="span" animation="border" size="sm" />
                    <span><strong>Analizando archivo...</strong> Detectando código de curso en el documento</span>
                  </div>
                </Alert>
              </div>
            )}

            {/* File Analysis Result */}
            {!isAnalyzing && analysisResult && (
              <div className="mb-4">
                <Alert variant={analysisResult.isMatch ? "success" : "warning"} className="mb-0">
                  <div className="d-flex align-items-start gap-2">
                    <div>
                      <i className={`ri-${analysisResult.isMatch ? 'check-circle-fill text-success' : 'alert-line text-warning'}`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <strong>{analysisResult.message}</strong>
                      {analysisResult.detectedCode && !analysisResult.isMatch && (
                        <p className="mb-0 mt-1 small text-muted">
                          Código esperado: <strong>{courseCode}</strong> | Detectado: <strong>{analysisResult.detectedCode}</strong> ({(analysisResult.confidence * 100).toFixed(0)}% confianza)
                        </p>
                      )}
                    </div>
                  </div>
                </Alert>
              </div>
            )}

            {/* Heuristic validation: 3 filtros + % de confianza */}
            {!isAnalyzing && heuristics && (
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fs-12 fw-semibold text-muted text-uppercase ls-1">
                    <i className="ri-shield-check-line me-1"></i>Validador de Sílabos
                  </span>
                  <span className={`badge ${heuristics.isDraft ? 'bg-warning-transparent text-warning' : 'bg-success-transparent text-success'}`}>
                    {heuristics.isDraft ? 'Se registrará como Borrador' : 'Listo para registrar'}
                  </span>
                </div>

                <ul className="list-unstyled mb-3 fs-13">
                  <li className="d-flex align-items-center gap-2 mb-1">
                    <i className={`ri-${heuristics.filenameHasCourseCode ? 'checkbox-circle-fill text-success' : 'close-circle-fill text-danger'}`}></i>
                    Filtro 1: el código del curso ({courseCode}) {heuristics.filenameHasCourseCode ? 'aparece' : 'no aparece'} en el nombre del archivo
                  </li>
                  <li className="d-flex align-items-center gap-2 mb-1">
                    <i className={`ri-${heuristics.contentHasCourseCode ? 'checkbox-circle-fill text-success' : 'close-circle-fill text-danger'}`}></i>
                    Filtro 2: el código del curso {heuristics.contentHasCourseCode ? 'fue encontrado' : 'no fue encontrado'} dentro del contenido del documento
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <i className={`ri-${heuristics.sizeLooksReasonable ? 'checkbox-circle-fill text-success' : 'close-circle-fill text-danger'}`}></i>
                    Filtro 3: el documento {heuristics.sizeLooksReasonable ? 'parece' : 'no parece'} tener el contenido típico de un sílabo
                  </li>
                </ul>

                <div className="d-flex justify-content-between fs-12 text-muted mb-1">
                  <span>Precisión del validador</span>
                  <span className="fw-semibold" style={{ color: heuristics.aiConfidence >= 60 ? '#198754' : '#f59e0b' }}>
                    {heuristics.aiConfidence}%
                  </span>
                </div>
                <ProgressBar
                  now={heuristics.aiConfidence}
                  variant={heuristics.aiConfidence >= 60 ? 'success' : 'warning'}
                  style={{ height: '6px', borderRadius: '99px' }}
                />
                {heuristics.isDraft && (
                  <p className="text-muted fs-12 mt-2 mb-0">
                    <i className="ri-information-line me-1"></i>
                    Mientras no se cumplan los 3 filtros, el sílabo se marcará como <strong>Borrador</strong> hasta que un administrador lo confirme.
                  </p>
                )}
              </div>
            )}

            {/* Alert */}
            <Alert variant="info" className="mb-0">
              <i className="ri-alert-line me-2"></i>
              <strong>Verifica los datos antes de continuar.</strong> Podrás rectificar o rechazar el sílabo en la siguiente etapa.
            </Alert>
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="mb-3">
              <i className="ri-checkbox-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
            </div>
            <h5 className="text-success fw-bold mb-2">Confirmación Registrada</h5>
            <p className="text-muted mb-0">El sílabo se procesará y se enviará a blockchain...</p>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-top-0 pt-0">
        {step === 'confirm' && (
          <>
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <i className="ri-checkbox-circle-line me-1"></i>
                  Confirmar y Continuar
                </>
              )}
            </Button>
          </>
        )}
      </Modal.Footer>
      <style>{`
        .syllabus-modal-backdrop {
          background-color: rgba(0, 0, 0, 0.5) !important;
          opacity: 1 !important;
        }
      `}</style>
    </Modal>
  );
};

export default SyllabusConfirmationModal;
