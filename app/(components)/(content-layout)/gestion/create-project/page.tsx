"use client"

import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import SpkSunEditor from "@/shared/@spk-reusable-components/reusable-plugins/spk-suneditor";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import React, { Fragment, useState } from "react";
import { Card, Col, Form, Row, Table } from "react-bootstrap";
import { FilePond } from "react-filepond";

interface Carrera {
    id: number;
    nombre: string;
    descripcion: string;
}

const AcademicManagement: React.FC = () => {
    const [carreras, setCarreras] = useState<Carrera[]>([
        { id: 1, nombre: "Ingeniería de Sistemas", descripcion: "Carrera de Ingeniería de Sistemas" },
        { id: 2, nombre: "Administración de Empresas", descripcion: "Carrera de Administración" }
    ]);

    const [newCarrera, setNewCarrera] = useState<{ nombre: string; descripcion: string }>({ nombre: "", descripcion: "" });
    const [files, setFiles] = useState<File[]>([]);

    const handleAddCarrera = () => {
        if (newCarrera.nombre.trim() === "") return;
        setCarreras((prev) => [
            ...prev,
            { id: prev.length + 1, nombre: newCarrera.nombre, descripcion: newCarrera.descripcion },
        ]);
        setNewCarrera({ nombre: "", descripcion: "" });
        setFiles([]);
    };

    return (
        <Fragment>
            <Seo title="Gestión Académica - Carreras" />
            <Pageheader title="Gestión Académica" subtitle="Dashboard" currentpage="Carreras" activepage="Carreras" />

            <Row>
                <Col xl={12}>
                    <Card className="custom-card">
                        <Card.Header>
                            <SpkButton Customclass="btn btn-primary d-flex align-items-center gap-2">
                                <i className="ri-add-line"></i>
                                Nueva Carrera
                            </SpkButton>
                        </Card.Header>
                        <Card.Body>
                            <Row className="gy-3 mb-3">
                                <Col xl={6}>
                                    <Form.Label className="">Nombre de la Carrera:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newCarrera.nombre}
                                        placeholder="Ingrese nombre de la carrera"
                                        onChange={(e) => setNewCarrera({ ...newCarrera, nombre: e.target.value })}
                                    />
                                </Col>
                                <Col xl={12}>
                                    <Form.Label className="">Descripción:</Form.Label>
                                    <SpkSunEditor
                                        height={"150px"}
                                        defaulContent={newCarrera.descripcion}
                                    />
                                </Col>
                                <Col xl={12}>
                                    <SpkButton
                                        Customclass="btn btn-primary-light btn-wave float-end"
                                    >
                                        Guardar Carrera
                                    </SpkButton>
                                </Col>
                            </Row>

                            {/* Tabla de carreras */}
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Nombre</th>
                                        <th>Descripción</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {carreras.map((carrera) => (
                                        <tr key={carrera.id}>
                                            <td>{carrera.id}</td>
                                            <td>{carrera.nombre}</td>
                                            <td>
                                                <div dangerouslySetInnerHTML={{ __html: carrera.descripcion }} />
                                            </td>
                                            <td>
                                                <SpkButton Customclass="btn btn-warning btn-sm me-2">Editar</SpkButton>
                                                <SpkButton Customclass="btn btn-danger btn-sm">Eliminar</SpkButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Fragment>
    );
};

export default AcademicManagement;
