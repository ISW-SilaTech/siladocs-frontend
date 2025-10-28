"use client"

import SpkBadge from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge";
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import SpkDropdown from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-dropdown";
import SpkSelect from "@/shared/@spk-reusable-components/reusable-plugins/spk-reactselect";
import SpkTables from "@/shared/@spk-reusable-components/reusable-tables/spk-tables";
import { mallaData, Projectselectdata, AvatarImages } from "@/shared/data/dashboards/projects/mallalistdata";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment, useState } from "react";
import { Modal } from "react-bootstrap";
import { Card, Col, Dropdown, Form, Pagination, Row } from "react-bootstrap";

interface ProjectsListProps { }

const ProjectsList: React.FC<ProjectsListProps> = () => {

    // Estado para el modal y los campos
    const [showModal, setShowModal] = useState(false);
    const [nombre, setNombre] = useState("");
    const [ano, setAno] = useState("");
    const [cursos, setCursos] = useState("");
    const [creditos, setCreditos] = useState("");
    const [cursosError, setCursosError] = useState("");
    const [creditosError, setCreditosError] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [estado, setEstado] = useState("Activo");
    const [directivos, setDirectivos] = useState("");

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);
    const handleSave = () => {
        // Validar que ciclos sea número
        if (cursos.trim() !== "" && isNaN(Number(cursos))) {
            setCursosError("Debe ser un número");
            return;
        }
        setCursosError("");
        // Aquí puedes agregar la lógica para guardar la carrera
        setShowModal(false);
        setNombre("");
        setAno("");
        setCursos("");
        setDescripcion("");
        setEstado("Activo");
        setDirectivos("");
    };

    const statusBadgeClass: any = {
        "En Revisión": "bg-info-transparent",
        "Activo": "bg-success-transparent",
        "Suspendido": "bg-warning-transparent",
        "Inactivo": "bg-light text-default"
    };

    const priorityColorClass = {
        High: "text-danger",
        Medium: "text-info",
        Low: "text-primary"
    };

    return (

        <div className="min-vh-100 d-flex flex-column">
            <Fragment>

                {/* <!-- Page Header --> */}

                <Seo title="Mallas" />

                <Pageheader title="Gestión Académica" subtitle="Mallas" currentpage="Lista de Mallas" activepage="Gestión de Mallas" />

                {/* <!-- Page Header Close --> */}

                {/* <!-- Start::row-1 --> */}

                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body className="p-3">
                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                    <div className="d-flex flex-wrap gap-1 project-list-main">
                                        <button type="button" className="btn btn-primary me-2" onClick={handleOpenModal}>
                                            <i className="ri-add-line me-1 fw-medium align-middle"></i>Nueva Malla
                                        </button>
                                        <SpkSelect name="colors" option={Projectselectdata} mainClass="projects-sort basic-multi-select" menuplacement='auto' classNameprefix="Select2" placeholder="Ordenar por" />
                                    </div>

                                    <div className="d-flex" role="search">
                                        <Form.Control className="me-2" type="search" placeholder="Buscar Malla" aria-label="Search" />
                                        <SpkButton Buttonvariant="light" Customclass="btn" Buttontype="submit">Buscar</SpkButton>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* <!-- End::row-1 --> */}

                {/* <!-- Start::row-2 --> */}

                <Row>
                    <Col xl={12}>
                        <Card className="custom-card overflow-hidden">
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <SpkTables tableClass="text-nowrap" header={[{ title: 'Malla' }, { title: "Año" }, { title: 'Nº Cursos' }, { title: 'Créditos' }, { title: 'Estado' }, { title: 'Descripción' }, { title: 'Acciones' }]} >
                                        {mallaData.map((project, index) => (
                                            <tr key={index}>
                                                <td>{project.malla}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <div>{project.año}</div>
                                                    </div>
                                                </td>
                                                <td>{project.cursos}</td>
                                                <td>{project.creditos}</td>
                                                <td>
                                                    <SpkBadge variant="" Customclass={`${statusBadgeClass[project.estado]}`}>
                                                        {project.estado}
                                                    </SpkBadge>
                                                </td>
                                                <td>
                                                    {project.descripción}
                                                </td>
                                                <td>
                                                    <SpkDropdown toggleas="a" Icon={true} Navigate="#!" Customtoggleclass="btn btn-icon btn-sm btn-light no-caret" IconClass="fe fe-more-vertical">
                                                        <Dropdown.Item href="#!"><i className="ti ti-eye me-1 d-inline-block"></i>View</Dropdown.Item>
                                                        <Dropdown.Item href="#!"><i className="ti ti-edit me-1 d-inline-block"></i>Edit</Dropdown.Item>
                                                        <Dropdown.Item href="#!"><i className="ti ti-trash me-1 d-inline-block"></i>Delete</Dropdown.Item>
                                                    </SpkDropdown>
                                                </td>
                                            </tr>
                                        ))}
                                    </SpkTables>
                                </div>
                            </Card.Body>
                            <Card.Footer className="border-top-0">
                                <div className="d-flex align-items-center">
                                    <div> Mostrar Todas las Carreras <i className="bi bi-arrow-right ms-2 fw-semibold"></i> </div>
                                    <div className="ms-auto">
                                        <nav aria-label="Page navigation" className="pagination-style-2">
                                            <Pagination className="mb-0 flex-wrap">
                                                <Pagination.Prev disabled>Anterior</Pagination.Prev>
                                                <Pagination.Item>1</Pagination.Item>
                                                <Pagination.Item active>2</Pagination.Item>
                                                <Pagination.Ellipsis />
                                                <Pagination.Item>10</Pagination.Item>
                                                <Pagination.Next linkClassName="text-primary">Siguiente</Pagination.Next>
                                            </Pagination>
                                        </nav>
                                    </div>
                                </div>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>

                {/* <!-- End::row-2 --> */}
                {/* Modal para crear nueva carrera */}
                <Modal show={showModal} onHide={handleCloseModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Crear Nueva Malla</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Nombre de la Malla</Form.Label>
                                <Form.Control type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ingrese el nombre" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Año</Form.Label>
                                <Form.Control type="number" value={ano} onChange={e => setAno(e.target.value)} placeholder="Ingrese el año" min="2020" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Número Cursos</Form.Label>
                                <Form.Control type="number" value={cursos} onChange={e => setCursos(e.target.value)} placeholder="Ingrese la cantidad de cursos" min="1" />
                                {cursosError && <div className="text-danger small mt-1">{cursosError}</div>}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Número Créditos</Form.Label>
                                <Form.Control type="number" value={creditos} onChange={e => setCreditos(e.target.value)} placeholder="Ingrese la cantidad de cursos" min="1" />
                                {creditosError && <div className="text-danger small mt-1">{creditosError}</div>}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Estado <span className="text-secondary small ms-1">(opcional)</span>
                                </Form.Label>
                                <Form.Select value={estado} onChange={e => setEstado(e.target.value)}>
                                    <option value="Activo">Activo</option>
                                    <option value="En Revisión">En Revisión</option>
                                    <option value="Suspendido">Suspendido</option>
                                    <option value="Inactivo">Inactivo</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Descripción <span className="text-secondary small ms-1">(opcional)</span>
                                </Form.Label>
                                <Form.Control as="textarea" rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ingrese la descripción" />
                            </Form.Group>

                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <SpkButton Customclass="btn btn-secondary" onClick={handleCloseModal}>Cancelar</SpkButton>
                        <SpkButton Customclass="btn btn-primary" onClick={handleSave}>Guardar</SpkButton>
                    </Modal.Footer>
                </Modal>
            </Fragment>
        </div>
    )
};

export default ProjectsList;
