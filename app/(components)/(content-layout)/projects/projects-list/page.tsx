"use client"

import SpkBadge from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge";
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import SpkDropdown from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-dropdown";
import SpkSelect from "@/shared/@spk-reusable-components/reusable-plugins/spk-reactselect";
import SpkTables from "@/shared/@spk-reusable-components/reusable-tables/spk-tables";
import { AvatarImages, projectData, Projectselectdata } from "@/shared/data/dashboards/projects/projectlistdata";
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
    const [facultad, setFacultad] = useState("");
    const [ciclos, setCiclos] = useState("");
    const [ciclosError, setCiclosError] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [estado, setEstado] = useState("Activo");
    const [directivos, setDirectivos] = useState("");

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);
    const handleSave = () => {
        // Validar que ciclos sea número
        if (ciclos.trim() !== "" && isNaN(Number(ciclos))) {
            setCiclosError("Debe ser un número");
            return;
        }
        setCiclosError("");
        // Aquí puedes agregar la lógica para guardar la carrera
        setShowModal(false);
        setNombre("");
        setFacultad("");
        setCiclos("");
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

                <Seo title="Projects-Projects List" />

                <Pageheader title="Gestión Académica" subtitle="Carreras" currentpage="Lista de Carreras" activepage="Gestión de Carreras" />

                {/* <!-- Page Header Close --> */}

                {/* <!-- Start::row-1 --> */}

                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body className="p-3">
                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                    <div className="d-flex flex-wrap gap-1 project-list-main">
                                        <button type="button" className="btn btn-primary me-2" onClick={handleOpenModal}>
                                            <i className="ri-add-line me-1 fw-medium align-middle"></i>Nueva Carrera
                                        </button>
                                        <SpkSelect name="colors" option={Projectselectdata} mainClass="projects-sort basic-multi-select" menuplacement='auto' classNameprefix="Select2" placeholder="Ordenar por" />
                                    </div>
                                    <div className="avatar-list-stacked">
                                        {AvatarImages.map((src, index) => (
                                            <span className="avatar avatar-sm avatar-rounded" key={index}>
                                                <Image width={28} height={28} src={src} alt={`avatar-${index + 1}`} />
                                            </span>
                                        ))}
                                        <Link scroll={false} className="avatar avatar-sm bg-primary avatar-rounded text-fixed-white" href="#!">
                                            +8
                                        </Link>
                                    </div>
                                    <div className="d-flex" role="search">
                                        <Form.Control className="me-2" type="search" placeholder="Buscar Carrera" aria-label="Search" />
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
                                <div className="table-responsive w-100">
                                    <SpkTables tableClass="text-nowrap" header={[{ title: 'Carrera' }, { title: "Facultad" }, { title: 'Ciclos' }, { title: 'Actualización' }, { title: 'Estado' }, { title: 'Directivos' }, { title: 'Acciones' }]} >
                                        {projectData.map((project, index) => (
                                            <tr key={index}>
                                                <td>{project.carrera}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <div>{project.facultad}</div>
                                                    </div>
                                                </td>
                                                <td>{project.ciclos}</td>
                                                <td>{project.actualización}</td>
                                                <td>
                                                    <SpkBadge variant="" Customclass={`${statusBadgeClass[project.estado]}`}>
                                                        {project.estado}
                                                    </SpkBadge>
                                                </td>
                                                <td>
                                                    <div className="avatar-list-stacked">
                                                        {project.team.map((avatar, idx) => (
                                                            <span key={idx} className="avatar avatar-sm avatar-rounded">
                                                                <Image width={28} height={28} src={avatar} alt="img" />
                                                            </span>
                                                        ))}
                                                        {project.extraTeam > 0 && (
                                                            <Link className="avatar avatar-sm bg-primary avatar-rounded text-fixed-white" href="#!">
                                                                +{project.extraTeam}
                                                            </Link>
                                                        )}
                                                    </div>
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
                        <Modal.Title>Crear Nueva Carrera</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Nombre de la Carrera</Form.Label>
                                <Form.Control type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ingrese el nombre" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Facultad</Form.Label>
                                <Form.Control type="text" value={facultad} onChange={e => setFacultad(e.target.value)} placeholder="Ingrese la facultad" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Ciclos</Form.Label>
                                <Form.Control type="number" value={ciclos} onChange={e => setCiclos(e.target.value)} placeholder="Ingrese los ciclos" min="1" />
                                {ciclosError && <div className="text-danger small mt-1">{ciclosError}</div>}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Descripción <span className="text-secondary small ms-1">(opcional)</span>
                                </Form.Label>
                                <Form.Control as="textarea" rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ingrese la descripción" />
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
                                    Directivos <span className="text-secondary small ms-1">(opcional)</span>
                                </Form.Label>
                                <Form.Control type="text" value={directivos} onChange={e => setDirectivos(e.target.value)} placeholder="Ingrese los directivos" />
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
