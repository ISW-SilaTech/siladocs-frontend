"use client"

import SpkBadge from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge";
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import SpkDropdown from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-dropdown";
import SpkTables from "@/shared/@spk-reusable-components/reusable-tables/spk-tables";
import { CursosListData } from "@/shared/data/dashboards/jobs/joblistdata";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Link from "next/link";
import React, { Fragment, useState } from "react";
import { Card, Col, Dropdown, Form, Modal, Pagination, Row } from "react-bootstrap";

interface cursosListProps { }

const cursosList: React.FC<cursosListProps> = () => {

    // Estado para el modal y campos del formulario
    const [showModal, setShowModal] = useState(false);
    const [nombre, setNombre] = useState("");
    const [codigo, setCodigo] = useState("");
    const [carrera, setCarrera] = useState("");
    const [facultad, setFacultad] = useState("");
    const [ano, setAno] = useState("");
    const [silabos, setSilabos] = useState("");
    const [estado, setEstado] = useState("Activo");
    const [descripcion, setDescripcion] = useState("");

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const handleSave = () => {
        // Aquí iría la lógica para guardar el curso
        console.log({
            nombre, codigo, carrera, facultad, ano, silabos, estado, descripcion
        });

        // Reset y cerrar modal
        setShowModal(false);
        setNombre("");
        setCodigo("");
        setCarrera("");
        setFacultad("");
        setAno("");
        setSilabos("");
        setEstado("Activo");
        setDescripcion("");
    };

    return (
        <Fragment>
            {/* <!-- Page Header --> */}
            <Seo title="Cursos" />
            <Pageheader title="Dashboards" subtitle="Cursos" currentpage="Lista de Cursos" activepage="Gestión de Cursos" />
            {/* <!-- Page Header Close --> */}

            {/* <!-- Start::row-1 --> */}
            <Row>
                <Col xl={12}>
                    <Card className="custom-card overflow-hidden">
                        <Card.Header className="justify-content-between">
                            <div className="card-title">
                                Lista de Cursos
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                                <SpkButton Customclass="btn btn-primary btn-wave" onClick={handleOpenModal}>
                                    <i className="ri-add-line me-1 align-middle"></i>Crear Curso
                                </SpkButton>
                                <div>
                                    <Form.Control type="text" placeholder="Buscar Curso" aria-label=".form-control-sm example" />
                                </div>
                                <SpkDropdown Customtoggleclass="btn btn-primary btn-wave no-caret" Toggletext="Ordenar por" Arrowicon={true}>
                                    <Dropdown.Item as='li' href="#!">Fecha</Dropdown.Item>
                                    <Dropdown.Item href="#!">Estado</Dropdown.Item>
                                    <Dropdown.Item href="#!">Carrera</Dropdown.Item>
                                    <Dropdown.Item href="#!">Malla</Dropdown.Item>
                                    <Dropdown.Item href="#!">Reciente</Dropdown.Item>
                                    <Dropdown.Item href="#!">Antiguo</Dropdown.Item>
                                </SpkDropdown>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <SpkTables tableClass="table-hover text-nowrap" Customcheckclass="ps-4" header={[{ title: 'Curso' }, { title: 'Carrera' }, { title: 'Facultad' }, { title: 'Nº Sílabos' }, { title: 'Año' }, { title: 'Estado' }, { title: 'Malla' }, { title: 'Publicación' }, { title: 'Acción' }]}>
                                    {CursosListData.map((curso, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="lh-1">
                                                        <span className={`avatar avatar-md avatar-rounded bg-${curso.svgClass}-transparent svg-${curso.svgClass}`}>
                                                            {curso.svgIcon}
                                                        </span>
                                                    </div>
                                                    <div className="ms-2">
                                                        <p className="fw-medium mb-0 d-flex align-items-center">
                                                            <Link scroll={false} href="/dashboards/cursos/curso-details">{curso.curso}</Link>
                                                        </p>
                                                        <p className="fs-12 text-muted mb-0">{curso.codigo}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{curso.carrera}</td>
                                            <td>{curso.facultad}</td>
                                            <td>{curso.silabos}</td>
                                            <td>{curso.ano}</td>
                                            <td>
                                                <SpkBadge variant="" Customclass={`rounded-pill bg-${curso.color}-transparent`}>
                                                    {curso.status}
                                                </SpkBadge>
                                            </td>
                                            <td>{curso.status}</td>
                                            <td>{curso.publicacion}</td>
                                            <td>
                                                <Link scroll={false} href="/dashboards/cursos/curso-details" className="btn btn-icon btn-sm btn-primary-light btn-wave me-1">
                                                    <i className="ri-eye-line"></i>
                                                </Link>
                                                <Link href="#!" scroll={false} className="btn btn-icon btn-sm btn-info-light btn-wave me-1">
                                                    <i className="ri-edit-line"></i>
                                                </Link>
                                                <Link href="#!" scroll={false} className="btn btn-icon btn-sm btn-danger-light btn-wave">
                                                    <i className="ri-delete-bin-line"></i>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </SpkTables>
                            </div>
                        </Card.Body>
                        <Card.Footer className="border-top-0">
                            <div className="d-flex align-items-center flex-wrap overflow-auto">
                                <div className="mb-2 mb-sm-0">
                                    Showing <b>1</b> to <b>8</b> of <b>100</b> entries <i className="bi bi-arrow-right ms-2 fw-medium"></i>
                                </div>
                                <div className="ms-auto">
                                    <Pagination className="mb-0 overflow-auto">
                                        <Pagination.Prev disabled>Previous</Pagination.Prev>
                                        <Pagination.Item active>{1}</Pagination.Item>
                                        <Pagination.Item>{2}</Pagination.Item>
                                        <Pagination.Item>{3}</Pagination.Item>
                                        <Pagination.Item>{4}</Pagination.Item>
                                        <Pagination.Item>{5}</Pagination.Item>
                                        <Pagination.Next>Next</Pagination.Next>
                                    </Pagination>
                                </div>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
            {/* <!--End::row-1 --> */}

            {/* Modal para crear nuevo curso */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Nuevo Curso</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre del Curso</Form.Label>
                            <Form.Control type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ingrese el nombre" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Código</Form.Label>
                            <Form.Control type="text" value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Ingrese el código" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Carrera</Form.Label>
                            <Form.Control type="text" value={carrera} onChange={e => setCarrera(e.target.value)} placeholder="Ingrese la carrera" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Facultad</Form.Label>
                            <Form.Control type="text" value={facultad} onChange={e => setFacultad(e.target.value)} placeholder="Ingrese la facultad" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Año</Form.Label>
                            <Form.Control type="number" value={ano} onChange={e => setAno(e.target.value)} placeholder="Ingrese el año" min="2020" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Nº Sílabos</Form.Label>
                            <Form.Control type="number" value={silabos} onChange={e => setSilabos(e.target.value)} placeholder="Ingrese la cantidad de sílabos" min="1" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Estado</Form.Label>
                            <Form.Select value={estado} onChange={e => setEstado(e.target.value)}>
                                <option value="Activo">Activo</option>
                                <option value="En Revisión">En Revisión</option>
                                <option value="Suspendido">Suspendido</option>
                                <option value="Inactivo">Inactivo</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
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
    )
};

export default cursosList;
