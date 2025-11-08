"use client";

import SpkBadge from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge";
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import SpkDropdown from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-dropdown";
import SpkSelect from "@/shared/@spk-reusable-components/reusable-plugins/spk-reactselect";
import SpkTables from "@/shared/@spk-reusable-components/reusable-tables/spk-tables";
// Remove projectData import if not needed elsewhere
// import { AvatarImages, projectData, Projectselectdata } from "@/shared/data/dashboards/projects/projectlistdata";
import { Projectselectdata } from "@/shared/data/dashboards/projects/projectlistdata"; // Keep if needed for sorting dropdown
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment, useState, useEffect } from "react"; // 🔹 Import useEffect
import { Modal } from "react-bootstrap";
import { Card, Col, Dropdown, Form, Pagination, Row, Spinner, Alert } from "react-bootstrap"; // 🔹 Import Spinner, Alert
import axios from 'axios'; // 🔹 Import axios
// 🔹 Importaciones añadidas
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // 🔹 Importa el CSS de toastify

// 🔹 Define an interface for the Career data structure (matches CareerResponse DTO)
interface Career {
    id: number;
    name: string;
    faculty: string;
    cycles: number;
    lastUpdated: string; // Keep as string for display, or use Date
    status: string;
}

const ProjectsList: React.FC = () => { // Removed unused interface prop

    // 🔹 State for careers data, loading, and errors
    const [careers, setCareers] = useState<Career[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 🔹 State for the modal and its form fields (matching CareerRequest DTO)
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false); // To know if modal is for create or edit
    const [currentCareerId, setCurrentCareerId] = useState<number | null>(null); // To store ID when editing
    const [careerData, setCareerData] = useState({
        name: "",
        faculty: "",
        cycles: "", // Keep as string for input, convert on save
        status: "Activo", // Default status
    });
    const [formError, setFormError] = useState<string | null>(null); // Errors inside the modal
    const [isSaving, setIsSaving] = useState(false); // Loading state for save button

    // --- Fetching Data ---
    const fetchCareers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get<Career[]>('http://localhost:8080/api/careers');
            setCareers(response.data);
        } catch (err) {
            console.error("Error fetching careers:", err);
            setError("Error al cargar las carreras. Intente de nuevo más tarde.");
        } finally {
            setIsLoading(false);
        }
    };

    // 🔹 Fetch careers when the component mounts
    useEffect(() => {
        fetchCareers();
    }, []);

    // --- Modal Handling ---
    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        setCareerData({ name: "", faculty: "", cycles: "", status: "Activo" }); // Reset form
        setCurrentCareerId(null);
        setFormError(null);
        setShowModal(true);
    };

    const handleOpenEditModal = (career: Career) => {
        setIsEditMode(true);
        setCareerData({ // Pre-fill form
             name: career.name,
             faculty: career.faculty,
             cycles: career.cycles.toString(), // Convert number to string for input
             status: career.status,
        });
        setCurrentCareerId(career.id);
        setFormError(null);
        setShowModal(true);
    };


    const handleCloseModal = () => {
        if (isSaving) return; // Prevent closing while saving
        setShowModal(false);
        // Reset state just in case
        setCareerData({ name: "", faculty: "", cycles: "", status: "Activo" });
        setIsEditMode(false);
        setCurrentCareerId(null);
        setFormError(null);
    };

    // 🔹 Handle input changes in the modal form
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCareerData(prev => ({ ...prev, [name]: value }));
         // Clear cycles error when user types
        if (name === 'cycles') {
             setFormError(null);
        }
    };

    // 🔹 Handle saving (Create or Update)
    const handleSave = async () => {
        setFormError(null); // Clear previous errors
        setIsSaving(true);

        // Basic Validation
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
            cycles: cyclesNum, // Send as number
            status: careerData.status,
        };

        try {
            if (isEditMode && currentCareerId) {
                // --- UPDATE ---
                await axios.put(`http://localhost:8080/api/careers/${currentCareerId}`, payload);
            } else {
                // --- CREATE ---
                await axios.post('http://localhost:8080/api/careers', payload);
            }
            await fetchCareers(); // Refresh the list after saving
            handleCloseModal(); // Close modal on success

        } catch (err: any) { // Type assertion for error
            console.error("Error saving career:", err);
             // More specific error handling based on response
             if (axios.isAxiosError(err) && err.response) {
                 if (err.response.status === 409 || err.response.status === 400) { // Conflict (duplicate name) or Bad Request
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
         if (window.confirm("¿Está seguro de que desea eliminar esta carrera?")) {
             try {
                 await axios.delete(`http://localhost:8080/api/careers/${id}`);
                 await fetchCareers(); // Refresh list
             } catch (err) {
                 console.error("Error deleting career:", err);
                 // You might want to show an error message to the user here
                  setError("Error al eliminar la carrera.");
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

    const priorityColorClass = {
        High: "text-danger",
        Medium: "text-info",
        Low: "text-primary"
    };

    return (
        <div className="min-vh-100 d-flex flex-column">
            <Fragment>
                <Seo title="Carreras" />
                <Pageheader title="Gestión Académica" subtitle="Carreras" currentpage="Lista de Carreras" activepage="Gestión de Carreras" />

                {/* Search and Add Row */}
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body className="p-3">
                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                    <div className="d-flex flex-wrap gap-1 project-list-main">
                                        {/* 🔹 Use correct handler */}
                                        <button type="button" className="btn btn-primary me-2" onClick={handleOpenCreateModal}>
                                            <i className="ri-add-line me-1 fw-medium align-middle"></i>Nueva Carrera
                                        </button>
                                        <SpkSelect name="colors" option={Projectselectdata} mainClass="projects-sort basic-multi-select" menuplacement='auto' classNameprefix="Select2" placeholder="Ordenar por" />
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

                {/* Table Row */}
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card overflow-hidden">
                            <Card.Body className="p-0">
                                <div className="table-responsive w-100">
                                    {/* 🔹 Show loading or error state */}
                                    {isLoading ? (
                                        <div className="text-center p-5">
                                            <Spinner animation="border" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </Spinner>
                                        </div>
                                    ) : error ? (
                                        <Alert variant="danger" className="m-3">{error}</Alert>
                                    ) : (
                                        <SpkTables tableClass="text-nowrap" header={[{ title: 'Carrera' }, { title: "Facultad" }, { title: 'Ciclos' }, { title: 'Actualización' }, { title: 'Estado' }, { title: 'Acciones' }]} >
                                            {/* 🔹 Map over fetched careers data */}
                                            {careers.map((career) => (
                                                <tr key={career.id}>
                                                    <td>{career.name}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-1">
                                                            <div>{career.faculty}</div>
                                                        </div>
                                                    </td>
                                                    <td>{career.cycles}</td>
                                                    {/* 🔹 Format date if needed */}
                                                    <td>{new Date(career.lastUpdated).toLocaleDateString()}</td>
                                                    <td>
                                                        <SpkBadge variant="" Customclass={`${statusBadgeClass[career.status] ?? 'bg-light text-default'}`}>
                                                            {career.status}
                                                        </SpkBadge>
                                                    </td>
                                                    <td>
                                                        <SpkDropdown toggleas="a" Icon={true} Navigate="#!" Customtoggleclass="btn btn-icon btn-sm btn-light no-caret" IconClass="fe fe-more-vertical">
                                                            {/* Add onClick handlers for Edit and Delete */}
                                                            <Dropdown.Item href="#!" onClick={() => handleOpenEditModal(career)}><i className="ti ti-edit me-1 d-inline-block"></i>Editar</Dropdown.Item>
                                                            <Dropdown.Item href="#!" onClick={() => handleDelete(career.id)}><i className="ti ti-trash me-1 d-inline-block"></i>Eliminar</Dropdown.Item>
                                                        </SpkDropdown>
                                                    </td>
                                                </tr>
                                            ))}
                                        </SpkTables>
                                     )}
                                </div>
                            </Card.Body>
                             {/* Conditionally render footer only if there are careers */}
                            {!isLoading && !error && careers.length > 0 && (
                                <Card.Footer className="border-top-0">
                                    <div className="d-flex align-items-center">
                                        <div> Mostrar Todas las Carreras <i className="bi bi-arrow-right ms-2 fw-semibold"></i> </div>
                                        <div className="ms-auto">
                                            {/* Pagination Logic needs integration if backend supports it */}
                                            <nav aria-label="Page navigation" className="pagination-style-2">
                                                <Pagination className="mb-0 flex-wrap">
                                                    <Pagination.Prev disabled>Anterior</Pagination.Prev>
                                                    <Pagination.Item active>{1}</Pagination.Item>
                                                    {/* ... More pagination items ... */}
                                                    <Pagination.Next linkClassName="text-primary">Siguiente</Pagination.Next>
                                                </Pagination>
                                            </nav>
                                        </div>
                                    </div>
                                </Card.Footer>
                            )}
                             {/* Show message if no careers found */}
                             {!isLoading && !error && careers.length === 0 && (
                                 <Card.Body className="text-center">
                                     <p>No se encontraron carreras.</p>
                                 </Card.Body>
                             )}
                        </Card>
                    </Col>
                </Row>

                {/* Modal para crear/editar carrera */}
                <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static" keyboard={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>{isEditMode ? 'Editar Carrera' : 'Crear Nueva Carrera'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {/* 🔹 Display form error if exists */}
                        {formError && <Alert variant="danger">{formError}</Alert>}
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Nombre de la Carrera <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name" // 🔹 Use name attribute
                                    value={careerData.name}
                                    onChange={handleFormChange}
                                    placeholder="Ingrese el nombre"
                                    required
                                    disabled={isSaving}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Facultad <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="faculty" // 🔹 Use name attribute
                                    value={careerData.faculty}
                                    onChange={handleFormChange}
                                    placeholder="Ingrese la facultad"
                                    required
                                    disabled={isSaving}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Ciclos <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="number" // Use number type
                                    name="cycles" // 🔹 Use name attribute
                                    value={careerData.cycles}
                                    onChange={handleFormChange}
                                    placeholder="Ingrese los ciclos"
                                    min="1"
                                    required
                                    disabled={isSaving}
                                />
                                {/* Simplified error display */}
                                {/* {formError?.includes("Ciclos") && <div className="text-danger small mt-1">{formError}</div>} */}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Estado</Form.Label>
                                <Form.Select
                                    name="status" // 🔹 Use name attribute
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
                            {/* Removed Description and Directivos as they are not in the backend DTO */}
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

export default ProjectsList;
