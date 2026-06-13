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
import { CurriculumsService, Curriculum, CurriculumRequest } from "@/shared/services/curriculums.service";
import { CareersService } from "@/shared/services/careers.service";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CareerOption {
    id: number;
    name: string;
}

const MallasList: React.FC = () => {

    const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [careers, setCareers] = useState<CareerOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentCurriculumId, setCurrentCurriculumId] = useState<number | null>(null);
    const [curriculumData, setCurriculumData] = useState({
        careerId: "",
        name: "",
        year: "",
        courseCount: "",
        totalCredits: "",
        status: "Activo",
        description: "",
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const [careersData, curriculumsData] = await Promise.all([
                    CareersService.getAll(),
                    CurriculumsService.getAll(),
                ]);
                if (cancelled) return;
                setCareers(careersData.map(c => ({ id: c.id, name: c.name })));
                setCurriculums(curriculumsData);
            } catch {
                if (!cancelled) setError("Error al cargar los datos. Intente de nuevo más tarde.");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        setIsLoading(true);
        load();
        return () => { cancelled = true; };
    }, []);

    const fetchCurriculums = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await CurriculumsService.getAll();
            setCurriculums(data);
        } catch {
            setError("Error al cargar las mallas. Intente de nuevo más tarde.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        setCurriculumData({
            careerId: "",
            name: "", year: "", courseCount: "", totalCredits: "",
            status: "Activo", description: "",
        });
        setCurrentCurriculumId(null);
        setFormError(null);
        setShowModal(true);
    };

    const handleOpenEditModal = (curriculum: Curriculum) => {
        setIsEditMode(true);
        setCurriculumData({
            careerId: String(curriculum.careerId),
            name: curriculum.name,
            year: String(curriculum.year),
            courseCount: String(curriculum.courseCount),
            totalCredits: String(curriculum.totalCredits),
            status: curriculum.status,
            description: curriculum.description ?? "",
        });
        setCurrentCurriculumId(curriculum.id);
        setFormError(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (isSaving) return;
        setShowModal(false);
        setCurriculumData({ careerId: "", name: "", year: "", courseCount: "", totalCredits: "", status: "Activo", description: "" });
        setIsEditMode(false);
        setCurrentCurriculumId(null);
        setFormError(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurriculumData(prev => ({ ...prev, [name]: value }));
        setFormError(null);
    };

    const handleSave = async () => {
        setFormError(null);
        setIsSaving(true);

        const { careerId, name, year, courseCount, totalCredits, status, description } = curriculumData;
        if (!careerId || !name || !year || !courseCount || !totalCredits) {
            setFormError("Carrera, Nombre, Año, Nº Cursos y Créditos son obligatorios.");
            setIsSaving(false);
            return;
        }
        const yearNum = Number(year);
        const courseCountNum = Number(courseCount);
        const totalCreditsNum = Number(totalCredits);
        const careerIdNum = Number(careerId);

        if (isNaN(yearNum) || yearNum <= 1900) { setFormError("Año inválido."); setIsSaving(false); return; }
        if (isNaN(courseCountNum) || courseCountNum <= 0) { setFormError("Nº Cursos debe ser positivo."); setIsSaving(false); return; }
        if (isNaN(totalCreditsNum) || totalCreditsNum <= 0) { setFormError("Créditos debe ser positivo."); setIsSaving(false); return; }
        if (isNaN(careerIdNum)) { setFormError("Seleccione una Carrera válida."); setIsSaving(false); return; }

        const payload = {
            careerId: careerIdNum,
            name,
            year: yearNum,
            courseCount: courseCountNum,
            totalCredits: totalCreditsNum,
            status,
            description,
        };

        try {
            if (isEditMode && currentCurriculumId) {
                await CurriculumsService.update(currentCurriculumId, payload as CurriculumRequest);
                toast.success("Malla actualizada correctamente", { position: "top-right", autoClose: 3000 });
            } else {
                await CurriculumsService.create(payload as CurriculumRequest);
                toast.success("Malla creada correctamente", { position: "top-right", autoClose: 3000 });
            }
            await fetchCurriculums();
            setShowModal(false);
            setCurriculumData({ careerId: "", name: "", year: "", courseCount: "", totalCredits: "", status: "Activo", description: "" });
            setIsEditMode(false);
            setCurrentCurriculumId(null);
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
        if (window.confirm("¿Está seguro de que desea eliminar esta malla? (Esto podría afectar cursos asociados)")) {
            try {
                await CurriculumsService.delete(id);
                await fetchCurriculums();
                toast.success("Malla eliminada correctamente", { position: "top-right", autoClose: 3000 });
            } catch {
                const errorMsg = "Error al eliminar la malla.";
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

    const filteredCurriculums = curriculums.filter((curriculum) => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return true;
        return curriculum.name?.toLowerCase().includes(q) || curriculum.careerName?.toLowerCase().includes(q);
    });

    return (
        <div className="min-vh-100 d-flex flex-column">
            <Fragment>
                <ToastContainer />
                <Seo title="Mallas" />
                <Pageheader title="Gestión Académica" subtitle="Mallas" currentpage="Lista de Mallas" activepage="Gestión de Mallas" />

                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body className="p-3">
                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                    <button type="button" className="btn btn-primary" onClick={handleOpenCreateModal}>
                                        <i className="ri-add-line me-1 fw-medium align-middle"></i>Nueva Malla
                                    </button>
                                    <Form.Control
                                        style={{ maxWidth: "280px" }}
                                        type="search"
                                        placeholder="Buscar por nombre o carrera"
                                        aria-label="Buscar malla"
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
                                <div className="table-responsive">
                                    {isLoading ? (
                                        <div className="text-center p-5"><Spinner animation="border" /></div>
                                    ) : error ? (
                                        <Alert variant="danger" className="m-3">{error}</Alert>
                                    ) : filteredCurriculums.length === 0 ? (
                                        <div className="text-center p-5 text-muted">
                                            {searchTerm.trim()
                                                ? <p>Sin coincidencias para &ldquo;<strong>{searchTerm.trim()}</strong>&rdquo;.</p>
                                                : <p>No se encontraron mallas.</p>}
                                        </div>
                                    ) : (
                                        <SpkTables tableClass="text-nowrap" header={[{ title: 'Malla' }, { title: "Año" }, { title: 'Nº Cursos' }, { title: 'Créditos' }, { title: 'Estado' }, { title: 'Descripción' }, { title: 'Acciones' }]}>
                                            {filteredCurriculums.map((curriculum) => (
                                                <tr key={curriculum.id}>
                                                    <td>{curriculum.name}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-1">
                                                            <div>{curriculum.year}</div>
                                                        </div>
                                                    </td>
                                                    <td>{curriculum.courseCount}</td>
                                                    <td>{curriculum.totalCredits}</td>
                                                    <td>
                                                        <SpkBadge variant="" Customclass={`${statusBadgeClass[curriculum.status] ?? 'bg-light text-default'}`}>
                                                            {curriculum.status}
                                                        </SpkBadge>
                                                    </td>
                                                    <td>{curriculum.description || "—"}</td>
                                                    <td>
                                                        <SpkDropdown toggleas="a" Icon={true} Navigate="#!" Customtoggleclass="btn btn-icon btn-sm btn-light no-caret" IconClass="fe fe-more-vertical">
                                                            <Dropdown.Item as="button" onClick={() => handleOpenEditModal(curriculum)}><i className="ti ti-edit me-1 d-inline-block"></i>Editar</Dropdown.Item>
                                                            <Dropdown.Item as="button" onClick={() => handleDelete(curriculum.id)}><i className="ti ti-trash me-1 d-inline-block"></i>Eliminar</Dropdown.Item>
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
                        <Modal.Title>{isEditMode ? 'Editar Malla' : 'Crear Nueva Malla'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {formError && <Alert variant="danger">{formError}</Alert>}
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="malla-careerId">Carrera <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    id="malla-careerId"
                                    name="careerId"
                                    value={curriculumData.careerId}
                                    onChange={handleFormChange}
                                    required
                                    disabled={isSaving || careers.length === 0}
                                >
                                    <option value="">
                                        {careers.length === 0 ? "Cargando carreras..." : "Seleccione una carrera..."}
                                    </option>
                                    {careers.map(career => (
                                        <option key={career.id} value={career.id}>
                                            {career.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="malla-name">Nombre de la Malla <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    id="malla-name"
                                    type="text"
                                    name="name"
                                    value={curriculumData.name}
                                    onChange={handleFormChange}
                                    placeholder="Ej: Ingeniería de Sistemas - Plan 2023"
                                    required
                                    disabled={isSaving}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="malla-year">Año <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    id="malla-year"
                                    type="number"
                                    name="year"
                                    value={curriculumData.year}
                                    onChange={handleFormChange}
                                    placeholder="Ingrese el año (ej: 2023)"
                                    min="1900"
                                    required
                                    disabled={isSaving}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="malla-courseCount">Número Cursos <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    id="malla-courseCount"
                                    type="number"
                                    name="courseCount"
                                    value={curriculumData.courseCount}
                                    onChange={handleFormChange}
                                    placeholder="Ingrese la cantidad de cursos"
                                    min="1"
                                    required
                                    disabled={isSaving}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="malla-totalCredits">Número Créditos <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    id="malla-totalCredits"
                                    type="number"
                                    name="totalCredits"
                                    value={curriculumData.totalCredits}
                                    onChange={handleFormChange}
                                    placeholder="Ingrese el total de créditos"
                                    min="1"
                                    required
                                    disabled={isSaving}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="malla-status">Estado</Form.Label>
                                <Form.Select
                                    id="malla-status"
                                    name="status"
                                    value={curriculumData.status}
                                    onChange={handleFormChange}
                                    disabled={isSaving}
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="En Revisión">En Revisión</option>
                                    <option value="Suspendido">Suspendido</option>
                                    <option value="Inactivo">Inactivo</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="malla-description">Descripción (Opcional)</Form.Label>
                                <Form.Control
                                    id="malla-description"
                                    as="textarea"
                                    rows={3}
                                    name="description"
                                    value={curriculumData.description}
                                    onChange={handleFormChange}
                                    placeholder="Ingrese una descripción breve"
                                    disabled={isSaving}
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <SpkButton Customclass="btn btn-secondary" onClick={handleCloseModal} Disabled={isSaving}>Cancelar</SpkButton>
                        <SpkButton Customclass="btn btn-primary" onClick={handleSave} Disabled={isSaving}>
                            {isSaving ? <Spinner as="span" animation="border" size="sm" /> : 'Guardar'}
                        </SpkButton>
                    </Modal.Footer>
                </Modal>
            </Fragment>
        </div>
    );
};

export default MallasList;
