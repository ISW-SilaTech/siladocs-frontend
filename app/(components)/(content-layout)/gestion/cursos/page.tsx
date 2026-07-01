"use client";

import SpkBadge from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge";
import SpkButton from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons";
import SpkTables from "@/shared/@spk-reusable-components/reusable-tables/spk-tables";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Link from "next/link";
import React, { Fragment, useState, useEffect } from "react";
import { Card, Col, Form, Modal, Row, Spinner, Alert } from "react-bootstrap";
import { CoursesService, Course, CourseRequest } from "@/shared/services/courses.service";
import { CareersService } from "@/shared/services/careers.service";
import { CurriculumsService } from "@/shared/services/curriculums.service";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTableSort, SortTh } from "@/shared/utils/tableSort";

interface CareerOption {
    id: number;
    name: string;
}

interface CurriculumOption {
    id: number;
    name: string;
    careerId: number;
}

// Maps English backend status values to Spanish display labels
const STATUS_LABEL: { [key: string]: string } = {
    Active: 'Activo',
    Closed: 'Cerrado',
    Pending: 'Pendiente',
    Archived: 'Archivado',
};

const CursosList: React.FC = () => {

    const [courses, setCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [careers, setCareers] = useState<CareerOption[]>([]);
    const [allCurriculums, setAllCurriculums] = useState<CurriculumOption[]>([]);
    const [filteredCurriculums, setFilteredCurriculums] = useState<CurriculumOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);
    const [courseData, setCourseData] = useState({
        careerId: "",
        curriculumId: "",
        code: "",
        name: "",
        faculty: "",
        year: "",
        status: "Active",
        publicationDate: "",
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const [careersData, curriculumsData, coursesData] = await Promise.all([
                    CareersService.getAll(),
                    CurriculumsService.getAll(),
                    CoursesService.getAll(),
                ]);
                if (cancelled) return;
                setCareers(careersData.map(c => ({ id: c.id, name: c.name })));
                setAllCurriculums(curriculumsData.map(m => ({ id: m.id, name: m.name, careerId: m.careerId })));
                setCourses(coursesData);
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

    // Filter the curriculum dropdown when the selected career changes.
    // Guard against allCurriculums being empty (initial load race) to avoid
    // incorrectly resetting a valid curriculumId before data arrives.
    useEffect(() => {
        if (!courseData.careerId) {
            setFilteredCurriculums([]);
            return;
        }
        if (allCurriculums.length === 0) return;
        const selectedCareerIdNum = Number(courseData.careerId);
        const filtered = allCurriculums.filter(m => m.careerId === selectedCareerIdNum);
        setFilteredCurriculums(filtered);
        const currentIsValid = filtered.some(m => m.id === Number(courseData.curriculumId));
        if (!currentIsValid) {
            setCourseData(prev => ({ ...prev, curriculumId: "" }));
        }
    }, [courseData.careerId, allCurriculums]);

    const fetchCourses = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await CoursesService.getAll();
            setCourses(data);
        } catch {
            setError("Error al cargar los cursos. Intente de nuevo más tarde.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        const defaultCareerId = careers.length > 0 ? String(careers[0].id) : "";
        setCourseData({
            careerId: defaultCareerId,
            curriculumId: "",
            code: "", name: "", faculty: "",
            year: String(new Date().getFullYear()),
            status: "Active", publicationDate: "",
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
        setCourseData(prev => ({ ...prev, [name]: value }));
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
            code,
            name,
            faculty,
            year: yearNum,
            status,
            publicationDate: publicationDate || null,
        };

        try {
            if (isEditMode && currentCourseId) {
                await CoursesService.update(currentCourseId, payload as CourseRequest);
                toast.success("Curso actualizado correctamente", { position: "top-right", autoClose: 3000 });
            } else {
                await CoursesService.create(payload as CourseRequest);
                toast.success("Curso creado correctamente", { position: "top-right", autoClose: 3000 });
            }
            await fetchCourses();
            setShowModal(false);
            setCourseData({ careerId: "", curriculumId: "", code: "", name: "", faculty: "", year: "", status: "Active", publicationDate: "" });
            setIsEditMode(false);
            setCurrentCourseId(null);
            setFormError(null);
            setFilteredCurriculums([]);
        } catch (err: any) {
            if (err.response?.status === 400 || err.response?.status === 409) {
                const errorMsg = err.response.data?.message || "Error de validación (verifique relaciones o código duplicado).";
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
        if (window.confirm("¿Está seguro de que desea eliminar este curso?")) {
            try {
                await CoursesService.delete(id);
                await fetchCourses();
                toast.success("Curso eliminado correctamente", { position: "top-right", autoClose: 3000 });
            } catch {
                const errorMsg = "Error al eliminar el curso.";
                setError(errorMsg);
                toast.error(errorMsg, { position: "top-right", autoClose: 3000 });
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-success-transparent';
            case 'closed': return 'bg-danger-transparent';
            case 'pending': return 'bg-warning-transparent';
            case 'archived': return 'bg-secondary-transparent';
            default: return 'bg-secondary-transparent';
        }
    };

    const getMallaStatusBadge = (mallaStatus: string | undefined) => {
        switch (mallaStatus?.toLowerCase()) {
            case 'activo': return 'bg-success-transparent';
            case 'inactivo': return 'bg-secondary-transparent';
            case 'suspendido': return 'bg-warning-transparent';
            case 'en revisión': return 'bg-info-transparent';
            default: return 'bg-secondary-transparent';
        }
    };

    const filteredCourses = courses.filter((course) => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return true;
        return course.name?.toLowerCase().includes(q) || course.code?.toLowerCase().includes(q);
    });

    const { sorted: displayCourses, sortKey, sortDir, toggle } = useTableSort(filteredCourses);
    const th = (label: string, field: string) => (
        <SortTh label={label} field={field} sortKey={sortKey as string} sortDir={sortDir} onSort={toggle as (k: string) => void} />
    );

    return (
        <Fragment>
            <ToastContainer />
            <Seo title="Cursos" />
            <Pageheader title="Gestión Académica" subtitle="Cursos" currentpage="Lista de Cursos" activepage="Gestión de Cursos" />

            <Row>
                <Col xl={12}>
                    <Card className="custom-card overflow-hidden">
                        <Card.Body className="p-3">
                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                <button type="button" className="btn btn-primary" onClick={handleOpenCreateModal}>
                                    <i className="ri-add-line me-1 fw-medium align-middle"></i>Crear Curso
                                </button>
                                <Form.Control
                                    style={{ maxWidth: "280px" }}
                                    type="search"
                                    placeholder="Buscar por nombre o código"
                                    aria-label="Buscar curso"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </Card.Body>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                {isLoading ? (
                                    <div className="text-center p-5"><Spinner animation="border" /></div>
                                ) : error ? (
                                    <Alert variant="danger" className="m-3">{error}</Alert>
                                ) : filteredCourses.length === 0 ? (
                                    <div className="text-center p-5 text-muted">
                                        {searchTerm.trim()
                                            ? <p>Sin coincidencias para &ldquo;<strong>{searchTerm.trim()}</strong>&rdquo;.</p>
                                            : <p>No se encontraron cursos.</p>}
                                    </div>
                                ) : (
                                    <SpkTables tableClass="table-hover text-nowrap" Customcheckclass="ps-4" header={[
                                        { title: th('Curso', 'name') },
                                        { title: th('Carrera', 'careerName') },
                                        { title: th('Facultad', 'faculty') },
                                        { title: th('Nº Sílabos', 'syllabusCount') },
                                        { title: th('Año', 'year') },
                                        { title: th('Estado', 'status') },
                                        { title: 'Malla' },
                                        { title: th('Publicación', 'publicationDate') },
                                        { title: 'Acción' },
                                    ]}>
                                        {displayCourses.map((course) => (
                                            <tr key={course.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
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
                                                        {STATUS_LABEL[course.status] ?? course.status}
                                                    </SpkBadge>
                                                </td>
                                                <td>
                                                    <SpkBadge variant="" Customclass={`rounded-pill ${getMallaStatusBadge(course.mallaStatus)}`}>
                                                        {course.mallaStatus ?? 'N/A'}
                                                    </SpkBadge>
                                                </td>
                                                <td>{course.publicationDate ? new Date(course.publicationDate).toLocaleDateString('es-PE') : 'N/A'}</td>
                                                <td>
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
                    </Card>
                </Col>
            </Row>

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
                                    <Form.Label htmlFor="curso-careerId">Carrera <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        id="curso-careerId"
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
                                    <Form.Label htmlFor="curso-curriculumId">Malla Curricular <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        id="curso-curriculumId"
                                        name="curriculumId"
                                        value={courseData.curriculumId}
                                        onChange={handleFormChange}
                                        required
                                        disabled={isSaving || !courseData.careerId || filteredCurriculums.length === 0}
                                    >
                                        <option value="" disabled>
                                            {!courseData.careerId ? "Seleccione una carrera primero" : "Seleccione una malla..."}
                                        </option>
                                        {filteredCurriculums.map(malla => (
                                            <option key={malla.id} value={malla.id}>{malla.name}</option>
                                        ))}
                                    </Form.Select>
                                    {courseData.careerId && filteredCurriculums.length === 0 && (
                                        <small className="text-muted">No hay mallas para la carrera seleccionada.</small>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="curso-code">Código del Curso <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        id="curso-code"
                                        type="text"
                                        name="code"
                                        value={courseData.code}
                                        onChange={handleFormChange}
                                        placeholder="Ej: MAT101"
                                        required
                                        disabled={isSaving}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="curso-name">Nombre del Curso <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        id="curso-name"
                                        type="text"
                                        name="name"
                                        value={courseData.name}
                                        onChange={handleFormChange}
                                        placeholder="Ej: Matemática Básica"
                                        required
                                        disabled={isSaving}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="curso-faculty">Facultad <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        id="curso-faculty"
                                        type="text"
                                        name="faculty"
                                        value={courseData.faculty}
                                        onChange={handleFormChange}
                                        placeholder="Ingrese la facultad"
                                        required
                                        disabled={isSaving}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="curso-year">Año <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        id="curso-year"
                                        type="number"
                                        name="year"
                                        value={courseData.year}
                                        onChange={handleFormChange}
                                        placeholder="Ej: 2024"
                                        min="1900"
                                        required
                                        disabled={isSaving}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="curso-status">Estado</Form.Label>
                                    <Form.Select
                                        id="curso-status"
                                        name="status"
                                        value={courseData.status}
                                        onChange={handleFormChange}
                                        disabled={isSaving}
                                    >
                                        <option value="Active">Activo</option>
                                        <option value="Closed">Cerrado</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="curso-publicationDate">Fecha de Publicación (Opcional)</Form.Label>
                                    <Form.Control
                                        id="curso-publicationDate"
                                        type="date"
                                        name="publicationDate"
                                        value={courseData.publicationDate}
                                        onChange={handleFormChange}
                                        disabled={isSaving}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
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

export default CursosList;
