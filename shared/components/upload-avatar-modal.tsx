"use client";

import React, { useRef, useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import Image from "next/image";
import { ProfileService } from "@/shared/services/profile.service";
import { useAuth } from "@/shared/contextapi";
import { toast } from "react-toastify";

interface UploadAvatarModalProps {
  show: boolean;
  onHide: () => void;
  currentAvatarUrl?: string;
}

export const UploadAvatarModal: React.FC<UploadAvatarModalProps> = ({
  show,
  onHide,
  currentAvatarUrl,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateUserAvatar } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        setError("Por favor selecciona un archivo de imagen válido");
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("El archivo no debe superar 5MB");
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Por favor selecciona una imagen");
      return;
    }

    setLoading(true);
    try {
      const response = await ProfileService.uploadAvatar(selectedFile);
      updateUserAvatar(response.avatarUrl);
      toast.success("Foto de perfil actualizada exitosamente");
      resetModal();
      onHide();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "Error al subir la foto";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetModal();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop={loading ? "static" : true}>
      <Modal.Header closeButton={!loading} className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center gap-2">
          <i className="ri-image-edit-line text-primary fs-5"></i>
          Cambiar Foto de Perfil
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="text-center mb-4">
          {preview ? (
            <div className="position-relative d-inline-block">
              <Image
                src={preview}
                alt="Preview"
                width={150}
                height={150}
                className="rounded-circle border border-3 border-primary"
                style={{ objectFit: "cover" }}
              />
            </div>
          ) : currentAvatarUrl ? (
            <div className="position-relative d-inline-block">
              <Image
                src={currentAvatarUrl}
                alt="Avatar actual"
                width={150}
                height={150}
                className="rounded-circle border border-3 border-secondary"
                style={{ objectFit: "cover" }}
              />
            </div>
          ) : (
            <div
              className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto"
              style={{
                width: "150px",
                height: "150px",
                fontSize: "48px",
                color: "#ccc",
              }}
            >
              <i className="ri-user-fill"></i>
            </div>
          )}
        </div>

        <Form.Group className="mb-3">
          <Form.Label className="fw-bold">Seleccionar Imagen</Form.Label>
          <Form.Control
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            disabled={loading}
            className="py-2"
          />
          <Form.Text className="text-muted d-block mt-2">
            <small>
              <i className="ri-information-line me-1"></i>
              Formatos: JPG, PNG, GIF (máx. 5MB)
            </small>
          </Form.Text>
        </Form.Group>

        {preview && (
          <Button
            variant="outline-secondary"
            size="sm"
            className="w-100"
            onClick={() => {
              setPreview(null);
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            disabled={loading}
          >
            Cambiar Imagen
          </Button>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button
          variant="light"
          onClick={handleClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className="d-flex align-items-center gap-2"
        >
          {loading && <Spinner size="sm" />}
          {loading ? "Subiendo..." : "Guardar Foto"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UploadAvatarModal;
