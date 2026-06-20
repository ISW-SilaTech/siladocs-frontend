"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';

interface SyllabusConfirmationModalProps {
  show: boolean;
  courseName: string;
  courseCode: string;
  syllabusFileName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  analysisResult?: {
    detectedCode: string | null;
    confidence: number;
    isMatch: boolean;
    message: string;
  } | null;
}

const SyllabusConfirmationModal: React.FC<SyllabusConfirmationModalProps> = ({
  show,
  courseName,
  courseCode,
  syllabusFileName,
  onConfirm,
  onCancel,
  isLoading = false,
  analysisResult = null,
}) => {
  const [step, setStep] = useState<'confirm' | 'confirmed'>('confirm');

  useEffect(() => {
    if (show) {
      setStep('confirm');
    }
  }, [show]);

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

            {/* File Analysis Result */}
            {analysisResult && (
              <div className="mb-4">
                <Alert variant={analysisResult.isMatch ? "success" : "warning"} className="mb-0">
                  <div className="d-flex align-items-start gap-2">
                    <div>
                      <i className={`ri-${analysisResult.isMatch ? 'check-line text-success' : 'alert-line text-warning'} me-2`}></i>
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
    </Modal>
  );
};

export default SyllabusConfirmationModal;
