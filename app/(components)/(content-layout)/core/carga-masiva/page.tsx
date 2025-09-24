"use client";

import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import React, { Fragment, useState } from "react";
import { Card, Col, Row, Button, Modal, ProgressBar, ListGroup, Table } from "react-bootstrap";
import ExcelJS from "exceljs";

interface Step {
  id: number;
  label: string;
  status: "pending" | "loading" | "success" | "error";
}

interface RecordRow {
  carrera: string;
  malla: string;
  ciclo: string;
  curso: string;
}

const CargaMasiva: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, label: "Cargando registros", status: "pending" },
    { id: 2, label: "Validando carreras", status: "pending" },
    { id: 3, label: "Validando mallas", status: "pending" },
    { id: 4, label: "Validando ciclos", status: "pending" },
    { id: 5, label: "Validando cursos", status: "pending" },
  ]);
  const [progress, setProgress] = useState(0);
  const [finalMessage, setFinalMessage] = useState<string | null>(null);
  const [records, setRecords] = useState<RecordRow[]>([]);

  // 📥 Descargar modelo de Excel
  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("ModeloCarga");

    sheet.columns = [
      { header: "Carrera", key: "carrera", width: 30 },
      { header: "Malla", key: "malla", width: 20 },
      { header: "Ciclo", key: "ciclo", width: 15 },
      { header: "Curso", key: "curso", width: 40 },
    ];

    sheet.addRow({ carrera: "Ingeniería de Sistemas", malla: "2025-I", ciclo: "1", curso: "Matemática Básica" });
    sheet.addRow({ carrera: "Administración", malla: "2025-I", ciclo: "2", curso: "Contabilidad General" });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Modelo_Carga_Masiva.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Por favor selecciona un archivo CSV o Excel.");
      return;
    }

    setShowModal(true);
    setProgress(0);
    setFinalMessage(null);

    let newSteps = [...steps];

    for (let i = 0; i < newSteps.length; i++) {
      newSteps[i].status = "loading";
      setSteps([...newSteps]);
      setProgress(((i + 1) / newSteps.length) * 100);

      await new Promise((resolve) => setTimeout(resolve, 800));

      if (file.name.includes("error") && i === 2) {
        newSteps[i].status = "error";
        setSteps([...newSteps]);
        setFinalMessage("❌ Error en la validación de mallas. Revisa tu archivo.");
        return;
      } else {
        newSteps[i].status = "success";
        setSteps([...newSteps]);
      }
    }

    // ✅ Leer el archivo Excel y mostrar datos en tabla
    const workbook = new ExcelJS.Workbook();
    const data = await file.arrayBuffer();
    await workbook.xlsx.load(data);

    const worksheet = workbook.worksheets[0];
    const loadedRecords: RecordRow[] = [];

    worksheet.eachRow((row, rowIndex) => {
      if (rowIndex === 1) return; // saltar cabecera
      loadedRecords.push({
        carrera: row.getCell(1).text,
        malla: row.getCell(2).text,
        ciclo: row.getCell(3).text,
        curso: row.getCell(4).text,
      });
    });

    setRecords(loadedRecords);
    setFinalMessage("✅ Carga completada con éxito.");
  };

  // 📤 Acción de enviar información al backend (placeholder)
  const handleSubmitData = () => {
    alert(`Se enviaron ${records.length} registros al backend 🚀`);
  };

  return (
    <Fragment>
      {/* Page Header */}
      <Seo title="Carga Masiva" />
      <Pageheader title="Carga Masiva" currentpage="Gestión" activepage="Carga Masiva" />

      {/* Start::row-1 */}
      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <h5 className="mb-0">Carga Masiva de Carreras, Mallas, Ciclos y Cursos</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-3">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  className="form-control"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="d-flex gap-2">
                  <Button variant="primary" onClick={handleUpload}>
                    Cargar Archivo
                  </Button>
                  <Button variant="outline-secondary" onClick={handleDownloadTemplate}>
                    Descargar Modelo
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* End::row-1 */}

      {/* Tabla con los valores cargados */}
      {records.length > 0 && (
        <Row className="mt-4">
          <Col xl={12}>
            <Card className="custom-card">
              <Card.Header>
                <h6 className="mb-0">Registros cargados</h6>
              </Card.Header>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Carrera</th>
                      <th>Malla</th>
                      <th>Ciclo</th>
                      <th>Curso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{rec.carrera}</td>
                        <td>{rec.malla}</td>
                        <td>{rec.ciclo}</td>
                        <td>{rec.curso}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {/* Footer con cantidad y botón */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <span className="fw-semibold">
                    Total registros: {records.length}
                  </span>
                  <Button variant="success" onClick={handleSubmitData}>
                    Cargar Información
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Modal de Progreso */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Procesando archivo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProgressBar now={progress} label={`${Math.round(progress)}%`} className="mb-3" />
          <ListGroup>
            {steps.map((step) => (
              <ListGroup.Item key={step.id} className="d-flex align-items-center gap-2">
                {step.status === "pending" && <i className="bi bi-circle text-muted"></i>}
                {step.status === "loading" && (
                  <div className="spinner-border spinner-border-sm text-primary" role="status" />
                )}
                {step.status === "success" && <i className="bi bi-check-circle-fill text-success"></i>}
                {step.status === "error" && <i className="bi bi-x-circle-fill text-danger"></i>}
                <span>{step.label}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
          {finalMessage && <p className="mt-3 fw-semibold">{finalMessage}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};

export default CargaMasiva;
