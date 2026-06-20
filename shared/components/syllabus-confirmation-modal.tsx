"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import styles from './syllabus-confirmation-modal.module.css';

interface SyllabusConfirmationModalProps {
  show: boolean;
  courseName: string;
  courseCode: string;
  syllabusFileName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const SyllabusConfirmationModal: React.FC<SyllabusConfirmationModalProps> = ({
  show,
  courseName,
  courseCode,
  syllabusFileName,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const [step, setStep] = useState<'confirm' | 'confirmed'>('confirm');
  const [animateElements, setAnimateElements] = useState(false);

  useEffect(() => {
    if (show) {
      setStep('confirm');
      setAnimateElements(false);
      // Trigger animation after modal is shown
      const timer = setTimeout(() => setAnimateElements(true), 100);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleConfirm = () => {
    setStep('confirmed');
    // Show confirmed state for 1 second then call onConfirm
    setTimeout(() => {
      onConfirm();
    }, 800);
  };

  const handleCancel = () => {
    setStep('confirm');
    setAnimateElements(false);
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
      className={styles.confirmationModal}
    >
      <Modal.Header closeButton={!isLoading} className={styles.header}>
        <Modal.Title className={styles.title}>
          {step === 'confirm' ? (
            <>
              <i className="ri-checkbox-circle-blank-line me-2 text-warning"></i>
              Confirmación de Sílabo
            </>
          ) : (
            <>
              <i className="ri-checkbox-circle-fill me-2 text-success"></i>
              ¡Confirmado!
            </>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.body}>
        {step === 'confirm' ? (
          <div className={styles.confirmContent}>
            <div className={`${styles.animationContainer} ${animateElements ? styles.animate : ''}`}>
              {/* Course Section */}
              <div className={`${styles.infoSection} ${animateElements ? styles.slideIn : ''}`} style={{ animationDelay: '0s' }}>
                <div className={styles.sectionIcon}>
                  <i className="ri-book-open-line"></i>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.label}>Curso Destino</p>
                  <p className={styles.courseName}>{courseCode}</p>
                  <p className={styles.courseFullName}>{courseName}</p>
                </div>
              </div>

              {/* Arrow */}
              <div className={`${styles.arrow} ${animateElements ? styles.fadeIn : ''}`} style={{ animationDelay: '0.3s' }}>
                <i className="ri-arrow-down-line"></i>
              </div>

              {/* Syllabus Section */}
              <div className={`${styles.infoSection} ${animateElements ? styles.slideIn : ''}`} style={{ animationDelay: '0.6s' }}>
                <div className={styles.sectionIcon}>
                  <i className="ri-file-pdf-2-line"></i>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.label}>Sílabo a Cargar</p>
                  <p className={styles.fileName}>{syllabusFileName}</p>
                  <p className={styles.fileInfo}>Este archivo se registrará como Draft hasta confirmar todos los detalles</p>
                </div>
              </div>
            </div>

            <Alert variant="info" className={`mt-4 ${animateElements ? styles.fadeIn : ''}`} style={{ animationDelay: '0.9s' }}>
              <i className="ri-alert-line me-2"></i>
              <strong>Verifica los datos antes de continuar.</strong> Podrás rectificar o rechazar el sílabo en la siguiente etapa.
            </Alert>
          </div>
        ) : (
          <div className={styles.confirmedContent}>
            <div className={styles.successAnimation}>
              <div className={styles.checkmark}>
                <i className="ri-checkbox-circle-fill"></i>
              </div>
              <h5 className="mt-3">Confirmación Registrada</h5>
              <p className="text-muted">El sílabo se procesará y se enviará a blockchain...</p>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className={styles.footer}>
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
              className={styles.confirmButton}
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
