"use client";

import SpkBadge from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge";
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import SpkDropdown from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-dropdown";
import SpkTables from "@/shared/@spk-reusable-components/reusable-tables/spk-tables";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import React, { Fragment, useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Card, Col, Dropdown, Form, Row, Spinner, Alert } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CareersService, Career, CareerRequest } from "@/shared/services/careers.service";

const CarrerasList: React.FC = () => {

    const [careers, setCareers] = useState<Career[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentCareerId, setCurrentCareerId] = useState<number | null>(null);
    const [careerData, setCareerData] = useState({
        name: "",
        faculty: "",
        cycles: "",
        status: "Activo",
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setError(null);
        CareersService.getAll()
            .then(data => { if (!cancelled) setCareers(data); })
            .catch(() => { if (!cancelled) setError("Error al cargar las carreras. Intente de nuevo más tarde."); })
            .finally(() => { if (!cancelled) setIsLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const fetchCareers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await CareersService.getAll();
            setCareers(data);
        } catch {
            setError("Error al cargar las carreras. Intente de nuevo más tarde.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        setCareerData({ name: "", faculty: "", cycles: "", status: "Activo" });
        setCurrentCareerId(null);
        setFormError(null);
        setShowModal(true);
    };

    const handleOpenEditModal = (career: Career) => {
        setIsEditMode(true);
        setCareerData({
            name: career.name,
            faculty: career.faculty,
            cycles: career.cycles.toString(),
            status: career.status,
        });
        setCurrentCareerId(career.id);
        setFormError(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (isSaving) return;
        setShowModal(false);
        setCareerData({ name: "", faculty: "", cycles: "", status: "Activo" });
        setIsEditMode(false);
        setCurrentCareerId(null);
        setFormError(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCareerData(prev => ({ ...prev, [name]: value }));
        setFormError(null);
    };

    const handleSave = async () => {
        setFormError(null);
        setIsSaving(true);

        if (!careerData.name || !careerData.faculty || !careerData.cycles) {
            setFormError("Nombre, Facultad y Ciclos son obligatorios.");
            setIsSaving(false);
            return;
        }
        const cyclesNum = Number(careerData.cycles);
        if (isNaN(cyclesNum) || cyclesNum <= 0) {
            setFormError("Ciclos debe ser un número positivo.");
            setIsSaving(false);
            return;
        }

        const payload = {
            name: careerData.name,
            faculty: careerData.faculty,
            cycles: cyclesNum,
            status: careerData.status,
        };

        try {
            if (isEditMode && currentCareerId) {
                await CareersService.update(currentCareerId, payload as CareerRequest);
                toast.success("Carrera actualizada correctamente", { position: "top-right", autoClose: 3000 });
            } else {
                await CareersService.create(payload as CareerRequest);
                toast.success("Carrera creada correctamente", { position: "top-right", autoClose: 3000 });
            }
            await fetchCareers();
            setShowModal(false);
            setCareerData({ name: "", faculty: "", cycles: "", status: "Activo" });
            setIsEditMode(false);
            setCurrentCareerId(null);
            setFormError(null);
        } catch (err: any) {
            if (err.response?.status === 409 || err.response?.status === 400) {
                const errorMsg = err.response.data?.message || "Error de validación al guardar.";
                setFormError(errorMsg);
                toast.error(errorMsg, { position: "top-right", autoClose: 3000 });
            } else {
                const errorMsg = "Ocurrió un error al guardar. Intente de nuevo.";
                setFormError(errorMsg);
                toast.error(errorMsg, { position: "top-right", autoClose: 3000 });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("¿Está seguro de que desea eliminar esta carrera?")) {
            try {
                await CareersService.delete(id);
                await fetchCareers();
                toast.success("Carrera eliminada correctamente", { position: "top-right", autoClose: 3000 });
            } catch {
                const errorMsg = "Error al eliminar la carrera.";
                setError(errorMsg);
                toast.error(errorMsg, { position: "top-right", autoClose: 3000 });
            }
        }
    };

    const statusBadgeClass: { [key: string]: string } = {
        "En Revisión": "bg-info-transparent",
        "Activo": "bg-success-transparent",
        "Suspendido": "bg-warning-transparent",
        "Inactivo": "bg-light text-default",
    };

    const filteredCareers = careers.filter((career) => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return true;
        return career.name?.toLowerCase().includes(q) || career.faculty?.toLowerCase().includes(q);
    });

    return (
        <div className="min-vh-100 d-flex flex-column">
            <Fragment>
                <ToastContainer />
                <Seo title="Carreras" />
                <Pageheader title="Gestión Académica" subtitle="Carreras" currentpage="Lista de Carreras" activepage="Gestión de Carreras" />

                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body className="p-3">
                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                    <button type="button" className="btn btn-primary" onClick={handleOpenCreateModal}>
                                        <i className="ri-add-line me-1 fw-medium align-middle"></i>Nueva Carrera
                                    </button>
                                    <Form.Control
                                        style={{ maxWidth: "280px" }}
                                        type="search"
                                        placeholder="Buscar por nombre o facultad"
                                        aria-label="Buscar carrera"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    <Col xl={12}>
                        <Card className="custom-card overflow-hidden">
                            <Card.Body className="p-0">
                                <div className="table-responsive w-100">
                                    {isLoading ? (
                                        <div className="text-center p-5">
                                            <Spinner animation="border" role="status">
                                                <span className="visually-hidden">Cargando...</span>
                                            </Spinner>
                                        </div>
                                    ) : error ? (
                                        <Alert variant="danger" className="m-3">{error}</Alert>
                                    ) : filteredCareers.length === 0 ? (
                                        <div className="text-center p-5 text-muted">
                                            {searchTerm.trim()
                                                ? <p>Sin coincidencias para &ldquo;<strong>{searchTerm.trim()}</strong>&rdquo;.</p>
                                                : <p>No se encontraron carreras.</p>}
                                        </div>
                                    ) : (
                                        <SpkTables tableClass="text-nowrap" header={[{ title: 'Carrera' }, { title: "Facultad" }, { title: 'Ciclos' }, { title: 'Actualización' }, { title: 'Estado' }, { title: 'Acciones' }]}>
                                            {filteredCareers.map((career) => (
                                                <tr key={career.id}>
                                                    <td>{career.name}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-1">
                                                            <div>{career.faculty}</div>
                                                        </div>
                                                    </td>
                                                    <td>{career.cycles}</td>
                                                    <td>{career.lastUpdated ? new Date(career.lastUpdated).toLocaleDateString('es-PE') : '—'}</td>
                                                    <td>
                                                        <SpkBadge variant="" Customclass={`${statusBadgeClass[career.status] ?? 'bg-light text-default'}`}>
                                                            {career.status}
                                                        </SpkBadge>
                                                    </td>
                                                    <td>
                                                        <SpkDropdown toggleas="a" Icon={true} Navigate="#!" Customtoggleclass="btn btn-icon btn-sm btn-light no-caret" IconClass="fe fe-more-vertical">
                                                            <Dropdown.Item as="button" onClick={() => handleOpenEditModal(career)}><i className="ti ti-edit me-1 d-inline-block"></i>Editar</Dropdown.Item>
                                                            <Dropdown.Item as="button" onClick={() => handleDelete(career.id)}><i className="ti ti-trash me-1 d-inline-block"></i>Eliminar</Dropdown.Item>
                                                        </SpkDropdown>
                                                    </td>
                                                </tr>
                                            ))}
                                        </SpkTables>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static" keyboard={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>{isEditMode ? 'Editar Carrera' : 'Crear Nueva Carrera'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {formError && <Alert variant="danger">{formError}</Alert>}
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="career-name">Nombre de la Carrera <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    id="career-name"
                                    type="text"
                                    name="name"
                                    value={careerData.name}
                                    onChange={handleFormChange}
                                    placeholder="Ingrese el nombre"
                                    required
                                    disabled={isSaving}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="career-faculty">Facultad <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    id="career-faculty"
                                    type="text"
                                    name="faculty"
                                    value={careerData.faculty}
                                    onChange={handleFormChange}
                                    placeholder="Ingrese la facultad"
                                    required
                                    disabled={isSaving}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="career-cycles">Ciclos <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    id="career-cycles"
                                    type="number"
                                    name="cycles"
                                    value={careerData.cycles}
                                    onChange={handleFormChange}
                                    placeholder="Ingrese los ciclos"
                                    min="1"
                                    required
                                    disabled={isSaving}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="career-status">Estado</Form.Label>
                                <Form.Select
                                    id="career-status"
                                    name="status"
                                    value={careerData.status}
                                    onChange={handleFormChange}
                                    disabled={isSaving}
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="En Revisión">En Revisión</option>
                                    <option value="Suspendido">Suspendido</option>
                                    <option value="Inactivo">Inactivo</option>
                                </Form.Select>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <SpkButton Customclass="btn btn-secondary" onClick={handleCloseModal} Disabled={isSaving}>Cancelar</SpkButton>
                        <SpkButton Customclass="btn btn-primary" onClick={handleSave} Disabled={isSaving}>
                            {isSaving ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Guardar'}
                        </SpkButton>
                    </Modal.Footer>
                </Modal>
            </Fragment>
        </div>
    );
};

export default CarrerasList;
