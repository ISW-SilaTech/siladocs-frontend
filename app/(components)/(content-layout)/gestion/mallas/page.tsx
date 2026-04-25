"use client";

import SpkBadge from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge";
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import SpkDropdown from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-dropdown";
import SpkSelect from "@/shared/@spk-reusable-components/reusable-plugins/spk-reactselect";
import SpkTables from "@/shared/@spk-reusable-components/reusable-tables/spk-tables";
// Remove mallaData if fetching from API
// import { mallaData, Projectselectdata, AvatarImages } from "@/shared/data/dashboards/projects/mallalistdata";
import { Projectselectdata } from "@/shared/data/dashboards/projects/mallalistdata"; // Keep if needed
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment, useState, useEffect } from "react"; // 🔹 Import useEffect
import { Modal } from "react-bootstrap";
import { Card, Col, Dropdown, Form, Pagination, Row, Spinner, Alert } from "react-bootstrap"; // 🔹 Import Spinner, Alert
import axios from 'axios'; // 🔹 Import axios

// 🔹 Define interfaces for Curriculum and Career data
interface Curriculum {
    id: number;
    careerId: number;
    careerName?: string; // Optional career name from backend response
    name: string;
    year: number;
    courseCount: number;
    totalCredits: number;
    status: string;
    description?: string; // Make optional if sometimes null
}

interface CareerOption { // Simplified Career for dropdown
    id: number;
    name: string;
}

const ProjectsList: React.FC = () => { // Removed unused interface prop

    // 🔹 State for curriculums, careers, loading, and errors
    const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
    const [careers, setCareers] = useState<CareerOption[]>([]); // For dropdown
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 🔹 State for the modal and its form fields (matching CurriculumRequest DTO)
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentCurriculumId, setCurrentCurriculumId] = useState<number | null>(null);
    const [curriculumData, setCurriculumData] = useState({
        careerId: "", // ID of the selected career
        name: "",
        year: "",
        courseCount: "",
        totalCredits: "",
        status: "Activo",
        description: "",
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // ⬇️ 1. NUEVA FUNCIÓN: Obtiene el token del navegador
    const getAuthHeaders = () => {
        const token = localStorage.getItem('siladocs_token');
        return {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    };

    // --- Fetching Data ---
    const fetchCareers = async () => {
        try {
            // ⬇️ 2. AGREGAMOS LOS HEADERS AL GET
            const response = await axios.get<CareerOption[]>('http://localhost:8080/api/careers', getAuthHeaders());
            setCareers(response.data.map(c => ({ id: c.id, name: c.name })));
        } catch (err) {
            console.error("Error fetching careers for dropdown:", err);
            setError("Error al cargar las carreras disponibles.");
        }
    };

    const fetchCurriculums = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // ⬇️ 3. AGREGAMOS LOS HEADERS AL GET
            const response = await axios.get<Curriculum[]>('http://localhost:8080/api/curriculums', getAuthHeaders());
            setCurriculums(response.data);
        } catch (err) {
            console.error("Error fetching curriculums:", err);
            setError("Error al cargar las mallas. Intente de nuevo más tarde.");
        } finally {
            setIsLoading(false);
        }
    };

    // 🔹 Fetch both careers (for modal) and curriculums (for table) on mount
    useEffect(() => {
        fetchCareers();
        fetchCurriculums();
    }, []);

    // --- Modal Handling ---
    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        setCurriculumData({
            careerId: careers.length > 0 ? String(careers[0].id) : "",
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

    // 🔹 Handle input changes in the modal form
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurriculumData(prev => ({ ...prev, [name]: value }));
        if (name === 'year' || name === 'courseCount' || name === 'totalCredits') {
            setFormError(null);
        }
    };

    // 🔹 Handle saving (Create or Update)
    const handleSave = async () => {
        setFormError(null);
        setIsSaving(true);

        // Basic Validation
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
            name: name,
            year: yearNum,
            courseCount: courseCountNum,
            totalCredits: totalCreditsNum,
            status: status,
            description: description,
        };

        try {
            if (isEditMode && currentCurriculumId) {
                // --- UPDATE --- (⬇️ 4. AGREGAMOS HEADERS AL PUT)
                await axios.put(`http://localhost:8080/api/curriculums/${currentCurriculumId}`, payload, getAuthHeaders());
            } else {
                // --- CREATE --- (⬇️ 5. AGREGAMOS HEADERS AL POST)
                await axios.post('http://localhost:8080/api/curriculums', payload, getAuthHeaders());
            }
            await fetchCurriculums(); // Refresh the list
            handleCloseModal();

        } catch (err: any) {
            console.error("Error saving curriculum:", err);
             if (axios.isAxiosError(err) && err.response) {
                 if (err.response.status === 409 || err.response.status === 400) {
                     setFormError(err.response.data || "Error de validación al guardar.");
                 } else {
                     setFormError("Ocurrió un error en el servidor.");
                 }
             } else {
                 setFormError("Ocurrió un error al guardar. Intente de nuevo.");
             }
        } finally {
            setIsSaving(false);
        }
    };

    // --- Delete Handling ---
     const handleDelete = async (id: number) => {
         if (window.confirm("¿Está seguro de que desea eliminar esta malla? (Esto podría afectar cursos asociados)")) {
             try {
                 // ⬇️ 6. AGREGAMOS HEADERS AL DELETE
                 await axios.delete(`http://localhost:8080/api/curriculums/${id}`, getAuthHeaders());
                 await fetchCurriculums(); // Refresh list
             } catch (err) {
                 console.error("Error deleting curriculum:", err);
                 setError("Error al eliminar la malla.");
             }
         }
     };

    // --- Badge Mapping ---
    const statusBadgeClass: { [key: string]: string } = { // More type-safe
        "En Revisión": "bg-info-transparent",
        "Activo": "bg-success-transparent",
        "Suspendido": "bg-warning-transparent",
        "Inactivo": "bg-light text-default"
    };

    return (
        <div className="min-vh-100 d-flex flex-column">
            <Fragment>
                <Seo title="Mallas" />
                <Pageheader title="Gestión Académica" subtitle="Mallas" currentpage="Lista de Mallas" activepage="Gestión de Mallas" />

                {/* Search and Add Row */}
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body className="p-3">
                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                    <div className="d-flex flex-wrap gap-1 project-list-main">
                                        <button type="button" className="btn btn-primary me-2" onClick={handleOpenCreateModal}>
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

                {/* Table Row */}
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card overflow-hidden">
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    {isLoading ? (
                                        <div className="text-center p-5"><Spinner animation="border" /></div>
                                    ) : error ? (
                                        <Alert variant="danger" className="m-3">{error}</Alert>
                                    ) : (
                                        <SpkTables tableClass="text-nowrap" header={[{ title: 'Malla' }, { title: "Año" }, { title: 'Nº Cursos' }, { title: 'Créditos' }, { title: 'Estado' }, { title: 'Descripción' }, { title: 'Acciones' }]} >
                                            {/* 🔹 Map over fetched curriculums data */}
                                            {curriculums.map((curriculum) => (
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
                                                    <td>{curriculum.description}</td>
                                                    <td>
                                                        <SpkDropdown toggleas="a" Icon={true} Navigate="#!" Customtoggleclass="btn btn-icon btn-sm btn-light no-caret" IconClass="fe fe-more-vertical">
                                                            <Dropdown.Item href="#!" onClick={() => handleOpenEditModal(curriculum)}><i className="ti ti-edit me-1 d-inline-block"></i>Editar</Dropdown.Item>
                                                            <Dropdown.Item href="#!" onClick={() => handleDelete(curriculum.id)}><i className="ti ti-trash me-1 d-inline-block"></i>Eliminar</Dropdown.Item>
                                                        </SpkDropdown>
                                                    </td>
                                                </tr>
                                            ))}
                                        </SpkTables>
                                    )}
                                </div>
                            </Card.Body>
                            {/* Footer logic (similar to Careers) */}
                            {!isLoading && !error && curriculums.length > 0 && (
                                <Card.Footer className="border-top-0">
                                    {/* ... Pagination ... */}
                                </Card.Footer>
                            )}
                             {!isLoading && !error && curriculums.length === 0 && (
                                 <Card.Body className="text-center">
                                     <p>No se encontraron mallas.</p>
                                 </Card.Body>
                             )}
                        </Card>
                    </Col>
                </Row>

                {/* Modal para crear/editar malla */}
                <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static" keyboard={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>{isEditMode ? 'Editar Malla' : 'Crear Nueva Malla'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {formError && <Alert variant="danger">{formError}</Alert>}
                        <Form>
                            {/* 🔹 Select para Carrera */}
                            <Form.Group className="mb-3">
                                <Form.Label>Carrera <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    name="careerId"
                                    value={curriculumData.careerId}
                                    onChange={handleFormChange}
                                    required
                                    disabled={isSaving || careers.length === 0} // Disable if no careers loaded
                                >
                                     {careers.length === 0 && <option value="" disabled>Cargando carreras...</option>}
                                     {careers.map(career => (
                                         <option key={career.id} value={career.id}>
                                             {career.name}
                                         </option>
                                     ))}
                                </Form.Select>
                                {careers.length === 0 && !isLoading && <small className="text-muted">No hay carreras disponibles para seleccionar.</small>}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Nombre de la Malla <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={curriculumData.name}
                                    onChange={handleFormChange}
                                    placeholder="Ej: Ingeniería de Sistemas - Plan 2023"
                                    required
                                    disabled={isSaving} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Año <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="number"
                                    name="year"
                                    value={curriculumData.year}
                                    onChange={handleFormChange}
                                    placeholder="Ingrese el año (ej: 2023)"
                                    min="1900"
                                    required
                                    disabled={isSaving} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Número Cursos <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="number"
                                    name="courseCount"
                                    value={curriculumData.courseCount}
                                    onChange={handleFormChange}
                                    placeholder="Ingrese la cantidad de cursos"
                                    min="1"
                                    required
                                    disabled={isSaving} />
                            </Form.Group>
                             <Form.Group className="mb-3">
                                <Form.Label>Número Créditos <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="number"
                                    name="totalCredits"
                                    value={curriculumData.totalCredits}
                                    onChange={handleFormChange}
                                    placeholder="Ingrese el total de créditos"
                                    min="1"
                                    required
                                    disabled={isSaving} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Estado</Form.Label>
                                <Form.Select
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
                                <Form.Label>Descripción (Opcional)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="description"
                                    value={curriculumData.description}
                                    onChange={handleFormChange}
                                    placeholder="Ingrese una descripción breve"
                                    disabled={isSaving} />
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

export default ProjectsList;
