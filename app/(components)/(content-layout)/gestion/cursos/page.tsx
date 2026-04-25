"use client";

import SpkBadge from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge";
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import SpkDropdown from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-dropdown";
import SpkTables from "@/shared/@spk-reusable-components/reusable-tables/spk-tables";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Link from "next/link";
import React, { Fragment, useState, useEffect } from "react";
import { Card, Col, Dropdown, Form, Modal, Pagination, Row, Spinner, Alert } from "react-bootstrap";
import { CoursesService, Course, CourseRequest } from "@/shared/services/courses.service";
import { CareersService } from "@/shared/services/careers.service";
import { CurriculumsService } from "@/shared/services/curriculums.service";

interface CareerOption {
    id: number;
    name: string;
}

interface CurriculumOption {
    id: number;
    name: string;
    careerId: number;
}


const CursosList: React.FC = () => { // Renamed component for clarity

    // 🔹 State Management
    const [courses, setCourses] = useState<Course[]>([]);
    const [careers, setCareers] = useState<CareerOption[]>([]); // For modal dropdown
    const [allCurriculums, setAllCurriculums] = useState<CurriculumOption[]>([]); // All curriculums for filtering
    const [filteredCurriculums, setFilteredCurriculums] = useState<CurriculumOption[]>([]); // Curriculums filtered by selected career
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);
    const [courseData, setCourseData] = useState({
        careerId: "", // Selected Career ID (string for select)
        curriculumId: "", // Selected Curriculum ID (string for select)
        code: "",
        name: "",
        faculty: "", // Can be auto-filled based on Career?
        // syllabusCount: "0", // Usually managed by backend
        year: "",
        status: "Active",
        publicationDate: "", // Date input or string
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // --- Data Fetching ---
    const fetchCareers = async () => {
        try {
            const data = await CareersService.getAll();
            setCareers(data.map(c => ({ id: c.id, name: c.name })));
        } catch (err) {
            console.error("Error fetching careers:", err);
            setError("Error al cargar carreras.");
        }
    };

    const fetchCurriculums = async () => {
        try {
            const data = await CurriculumsService.getAll();
            setAllCurriculums(data.map(m => ({ id: m.id, name: m.name, careerId: m.careerId })));
        } catch (err) {
            console.error("Error fetching curriculums:", err);
            setError("Error al cargar mallas.");
        }
    };

    const fetchCourses = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await CoursesService.getAll();
            setCourses(data);
        } catch (err) {
            console.error("Error fetching courses:", err);
            setError("Error al cargar los cursos. Intente de nuevo más tarde.");
        } finally {
            setIsLoading(false);
        }
    };

    // 🔹 Fetch all necessary data on mount
    useEffect(() => {
        const loadData = async () => {
            await fetchCareers();
            await fetchCurriculums();
            await fetchCourses();
        };
        loadData();
    }, []);

    // 🔹 Effect to filter curriculums when selected career changes in the modal
    useEffect(() => {
        if (courseData.careerId) {
            const selectedCareerIdNum = Number(courseData.careerId);
            setFilteredCurriculums(allCurriculums.filter(m => m.careerId === selectedCareerIdNum));
             const currentCurriculumIsValid = allCurriculums.some(m => m.id === Number(courseData.curriculumId) && m.careerId === selectedCareerIdNum);
             if (!currentCurriculumIsValid) {
                 setCourseData(prev => ({ ...prev, curriculumId: "" })); 
             }
        } else {
            setFilteredCurriculums([]); 
            setCourseData(prev => ({ ...prev, curriculumId: "" })); 
        }
    }, [courseData.careerId, allCurriculums]); 

    // --- Modal Handling ---
    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        const defaultCareerId = careers.length > 0 ? String(careers[0].id) : "";
        setCourseData({ 
            careerId: defaultCareerId,
            curriculumId: "", 
            code: "", name: "", faculty: "", 
            year: String(new Date().getFullYear()), 
            status: "Active", publicationDate: ""
        });
         if (defaultCareerId) {
            setFilteredCurriculums(allCurriculums.filter(m => m.careerId === Number(defaultCareerId)));
         } else {
             setFilteredCurriculums([]);
         }

        setCurrentCourseId(null);
        setFormError(null);
        setShowModal(true);
    };

    const handleOpenEditModal = (course: Course) => {
        setIsEditMode(true);
        const careerIdStr = String(course.careerId);
        setCourseData({ 
            careerId: careerIdStr,
            curriculumId: String(course.curriculumId),
            code: course.code,
            name: course.name,
            faculty: course.faculty,
            year: String(course.year),
            status: course.status,
            publicationDate: course.publicationDate ? new Date(course.publicationDate).toISOString().split('T')[0] : "", 
        });
         setFilteredCurriculums(allCurriculums.filter(m => m.careerId === course.careerId));
        setCurrentCourseId(course.id);
        setFormError(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (isSaving) return;
        setShowModal(false);
        setCourseData({ careerId: "", curriculumId: "", code: "", name: "", faculty: "", year: "", status: "Active", publicationDate: "" });
        setIsEditMode(false);
        setCurrentCourseId(null);
        setFormError(null);
        setFilteredCurriculums([]);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCourseData(prev => {
            const newState = { ...prev, [name]: value };
             if (name === 'careerId' && value) {
                 // Lógica opcional para auto-llenar facultad
             }
             return newState;
        });
        setFormError(null);
    };


    const handleSave = async () => {
        setFormError(null);
        setIsSaving(true);

        const { careerId, curriculumId, code, name, faculty, year, status, publicationDate } = courseData;
        if (!careerId || !curriculumId || !code || !name || !faculty || !year) {
            setFormError("Carrera, Malla, Código, Nombre, Facultad y Año son obligatorios.");
            setIsSaving(false);
            return;
        }
        const yearNum = Number(year);
        const careerIdNum = Number(careerId);
        const curriculumIdNum = Number(curriculumId);

        if (isNaN(yearNum) || yearNum <= 1900) { setFormError("Año inválido."); setIsSaving(false); return; }
        if (isNaN(careerIdNum)) { setFormError("Seleccione una Carrera válida."); setIsSaving(false); return; }
        if (isNaN(curriculumIdNum)) { setFormError("Seleccione una Malla válida."); setIsSaving(false); return; }

        const payload = {
            careerId: careerIdNum,
            curriculumId: curriculumIdNum,
            code: code,
            name: name,
            faculty: faculty, 
            year: yearNum,
            status: status,
            publicationDate: publicationDate || null,
        };

        try {
            if (isEditMode && currentCourseId) {
                await CoursesService.update(currentCourseId, payload as CourseRequest);
            } else {
                await CoursesService.create(payload as CourseRequest);
            }
            await fetchCourses();
            // Close directly — handleCloseModal checks isSaving which is still true here
            setShowModal(false);
            setCourseData({ careerId: "", curriculumId: "", code: "", name: "", faculty: "", year: "", status: "Active", publicationDate: "" });
            setIsEditMode(false);
            setCurrentCourseId(null);
            setFormError(null);
            setFilteredCurriculums([]);
        } catch (err: any) {
            console.error("Error saving course:", err);
            if (err.response?.status === 400 || err.response?.status === 409) {
                setFormError(err.response.data?.message || "Error de validación (verifique relaciones o código duplicado).");
            } else {
                setFormError("Ocurrió un error al guardar. Intente de nuevo.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    // --- Delete Handling ---
    const handleDelete = async (id: number) => {
        if (window.confirm("¿Está seguro de que desea eliminar este curso?")) {
            try {
                await CoursesService.delete(id);
                await fetchCourses();
            } catch (err) {
                console.error("Error deleting course:", err);
                setError("Error al eliminar el curso.");
            }
        }
    };

    // --- Badge Mapping (Combined Status) ---
    const getStatusBadge = (courseStatus: string) => {
        // Simple mapping for course status
        switch (courseStatus?.toLowerCase()) {
            case 'active': return 'bg-success-transparent';
            case 'closed': return 'bg-danger-transparent'; // Example for 'Closed'
            default: return 'bg-light text-default';
        }
    };
     const getMallaStatusBadge = (mallaStatus: string | undefined) => {
         // Simple mapping for malla status
         switch (mallaStatus?.toLowerCase()) {
             case 'activo': return 'bg-success-transparent';
             case 'inactivo': return 'bg-secondary-transparent';
             default: return 'bg-light text-default';
         }
     };


    return (
        <Fragment>
            <Seo title="Cursos" />
            <Pageheader title="Gestión Académica" subtitle="Cursos" currentpage="Lista de Cursos" activepage="Gestión de Cursos" />

            <Row>
                <Col xl={12}>
                    <Card className="custom-card overflow-hidden">
                        <Card.Header className="justify-content-between">
                            <div className="card-title">Lista de Cursos</div>
                            <div className="d-flex flex-wrap gap-2">
                                <SpkButton Customclass="btn btn-primary btn-wave" onClick={handleOpenCreateModal}>
                                    <i className="ri-add-line me-1 align-middle"></i>Crear Curso
                                </SpkButton>
                                {/* Search and Sort controls */}
                                <div><Form.Control type="text" placeholder="Buscar Curso" /></div>
                                <SpkDropdown Customtoggleclass="btn btn-primary btn-wave no-caret" Toggletext="Ordenar por" Arrowicon={true}>
                                    {/* ... Dropdown items ... */}
                                </SpkDropdown>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                {isLoading ? (
                                    <div className="text-center p-5"><Spinner animation="border" /></div>
                                ) : error ? (
                                    <Alert variant="danger" className="m-3">{error}</Alert>
                                ) : (
                                    <SpkTables tableClass="table-hover text-nowrap" Customcheckclass="ps-4" header={[{ title: 'Curso' }, { title: 'Carrera' }, { title: 'Facultad' }, { title: 'Nº Sílabos' }, { title: 'Año' }, { title: 'Estado' }, { title: 'Malla' }, { title: 'Publicación' }, { title: 'Acción' }]}>
                                        {courses.map((course) => (
                                            <tr key={course.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {/* Icon can be dynamic if needed */}
                                                        {/* <div className="lh-1"><span className={`avatar avatar-md avatar-rounded bg-primary-transparent svg-primary`}>...</span></div> */}
                                                        <div className="ms-2">
                                                            <p className="fw-medium mb-0 d-flex align-items-center">
                                                                <Link scroll={false} href="#">{course.name}</Link>
                                                            </p>
                                                            <p className="fs-12 text-muted mb-0">{course.code}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{course.careerName ?? 'N/A'}</td>
                                                <td>{course.faculty}</td>
                                                <td>{course.syllabusCount}</td>
                                                <td>{course.year}</td>
                                                <td>
                                                    <SpkBadge variant="" Customclass={`rounded-pill ${getStatusBadge(course.status)}`}>
                                                        {course.status}
                                                    </SpkBadge>
                                                </td>
                                                 <td> {/* Malla Status */}
                                                     <SpkBadge variant="" Customclass={`rounded-pill ${getMallaStatusBadge(course.mallaStatus)}`}>
                                                         {course.mallaStatus ?? 'N/A'}
                                                     </SpkBadge>
                                                 </td>
                                                <td>{course.publicationDate ? new Date(course.publicationDate).toLocaleDateString() : 'N/A'}</td>
                                                <td>
                                                    {/* Action Buttons */}
                                                    <SpkButton onClick={() => handleOpenEditModal(course)} Buttonvariant="info-light" Size="sm" Customclass="btn-icon me-1">
                                                        <i className="ri-edit-line"></i>
                                                    </SpkButton>
                                                    <SpkButton onClick={() => handleDelete(course.id)} Buttonvariant="danger-light" Size="sm" Customclass="btn-icon">
                                                        <i className="ri-delete-bin-line"></i>
                                                    </SpkButton>
                                                </td>
                                            </tr>
                                        ))}
                                    </SpkTables>
                                )}
                            </div>
                        </Card.Body>
                         {/* Footer and Pagination */}
                        {!isLoading && !error && courses.length > 0 && (
                             <Card.Footer className="border-top-0">
                                {/* ... Pagination logic ... */}
                             </Card.Footer>
                         )}
                         {!isLoading && !error && courses.length === 0 && (
                              <Card.Body className="text-center"><p>No se encontraron cursos.</p></Card.Body>
                         )}
                    </Card>
                </Col>
            </Row>

            {/* Modal para crear/editar curso */}
            <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static" keyboard={false} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? 'Editar Curso' : 'Crear Nuevo Curso'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {formError && <Alert variant="danger">{formError}</Alert>}
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Carrera <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        name="careerId"
                                        value={courseData.careerId}
                                        onChange={handleFormChange}
                                        required
                                        disabled={isSaving || careers.length === 0}
                                    >
                                        <option value="" disabled>Seleccione una carrera...</option>
                                        {careers.map(career => (
                                            <option key={career.id} value={career.id}>{career.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Malla Curricular <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        name="curriculumId"
                                        value={courseData.curriculumId}
                                        onChange={handleFormChange}
                                        required
                                        disabled={isSaving || !courseData.careerId || filteredCurriculums.length === 0} // Disable if no career selected or no matching curriculums
                                    >
                                        <option value="" disabled>
                                            {!courseData.careerId ? "Seleccione una carrera primero" : "Seleccione una malla..."}
                                         </option>
                                        {filteredCurriculums.map(malla => (
                                            <option key={malla.id} value={malla.id}>{malla.name}</option>
                                        ))}
                                    </Form.Select>
                                     {!courseData.careerId && <small className="text-muted">Debe seleccionar una carrera para ver las mallas.</small>}
                                     {courseData.careerId && filteredCurriculums.length === 0 && <small className="text-muted">No hay mallas para la carrera seleccionada.</small>}
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                             <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Código del Curso <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="code"
                                        value={courseData.code}
                                        onChange={handleFormChange}
                                        placeholder="Ej: MAT101"
                                        required
                                        disabled={isSaving} />
                                </Form.Group>
                            </Col>
                             <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre del Curso <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={courseData.name}
                                        onChange={handleFormChange}
                                        placeholder="Ej: Matemática Básica"
                                        required
                                        disabled={isSaving} />
                                </Form.Group>
                            </Col>
                        </Row>
                         <Row>
                             <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Facultad <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="faculty"
                                        value={courseData.faculty}
                                        onChange={handleFormChange}
                                        placeholder="Ingrese la facultad (o se auto-llenará)"
                                        required
                                        disabled={isSaving} />
                                </Form.Group>
                             </Col>
                             <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Año <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="year"
                                        value={courseData.year}
                                        onChange={handleFormChange}
                                        placeholder="Ej: 2024"
                                        min="1900"
                                        required
                                        disabled={isSaving} />
                                </Form.Group>
                             </Col>
                         </Row>
                        <Row>
                             <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={courseData.status}
                                        onChange={handleFormChange}
                                        disabled={isSaving}
                                    >
                                        <option value="Active">Activo</option>
                                        <option value="Closed">Cerrado</option>
                                        {/* Add other relevant statuses */}
                                    </Form.Select>
                                </Form.Group>
                             </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha de Publicación (Opcional)</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="publicationDate"
                                        value={courseData.publicationDate}
                                        onChange={handleFormChange}
                                        disabled={isSaving} />
                                </Form.Group>
                            </Col>
                        </Row>
                         {/* Removed Silabos Count and Description from modal as they are less common to edit directly */}

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
    );
};

export default CursosList; // Renamed component export
