"use client";

import Spkapexcharts from "@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Link from "next/link";
import React, { Fragment, useEffect, useState } from "react";
import { Card, Col, Row, Spinner, Badge, Alert, ProgressBar } from "react-bootstrap";
import { useAuth } from "@/shared/contextapi";
import { SyllabiService, Syllabus } from "@/shared/services/syllabi.service";
import { CoursesService, Course } from "@/shared/services/courses.service";
import { CareersService, Career } from "@/shared/services/careers.service";
import { CertificatesService, Certificate } from "@/shared/services/certificates.service";
import { EmissionCreditsService, EmissionCredit } from "@/shared/services/emission-credits.service";

// ── helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso?: string) =>
    iso
        ? new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

const formatRelative = (iso?: string) => {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2) return "ahora mismo";
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)}d`;
};

// Group syllabi by month → { "Ene": 3, "Feb": 5, ... }
const groupByMonth = (syllabi: Syllabus[]) => {
    const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const counts = new Array(12).fill(0);
    const confirmed = new Array(12).fill(0);
    syllabi.forEach((s) => {
        if (!s.uploadedAt) return;
        const m = new Date(s.uploadedAt).getMonth();
        counts[m]++;
        if (s.fabricTxId) confirmed[m]++;
    });
    // Return only months up to current month
    const now = new Date().getMonth();
    return {
        categories: MONTHS.slice(0, now + 1),
        total: counts.slice(0, now + 1),
        confirmed: confirmed.slice(0, now + 1),
    };
};

// ── KPI card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
    icon: string;
    iconBg: string;
    iconColor: string;
    label: string;
    value: React.ReactNode;
    sub?: string;
    trend?: { value: string; up: boolean };
    loading?: boolean;
    href?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, iconBg, iconColor, label, value, sub, trend, loading, href }) => (
    <Card className="custom-card h-100">
        <Card.Body>
            <div className="d-flex align-items-start gap-3">
                <div
                    style={{
                        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                        background: iconBg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    <i className={`${icon} fs-4`} style={{ color: iconColor }}></i>
                </div>
                <div className="flex-grow-1 overflow-hidden">
                    <p className="text-muted fs-12 mb-1 fw-medium text-truncate">{label}</p>
                    {loading
                        ? <Spinner animation="border" size="sm" />
                        : <h4 className="mb-0 fw-bold">{value}</h4>
                    }
                    <div className="d-flex align-items-center justify-content-between mt-1 flex-wrap gap-1">
                        {sub && <span className="text-muted fs-11">{sub}</span>}
                        {trend && (
                            <span className={`fs-11 fw-semibold ${trend.up ? "text-success" : "text-danger"}`}>
                                <i className={`ri-arrow-${trend.up ? "up" : "down"}-line`}></i> {trend.value}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Card.Body>
        {href && (
            <Card.Footer className="py-2 text-center border-top-0">
                <Link href={href} className="text-primary fs-11 animated-underline">
                    Ver detalle <i className="ri-arrow-right-line"></i>
                </Link>
            </Card.Footer>
        )}
    </Card>
);

// ── Blockchain badge ──────────────────────────────────────────────────────────

const BlockchainBadge: React.FC<{ syllabus: Syllabus }> = ({ syllabus }) => {
    if (!syllabus.hash) return <span className="badge bg-danger-transparent text-danger">⚠️ Sin registrar</span>;
    if (syllabus.fabricTxId) return <span className="badge bg-success-transparent text-success">⛓ En cadena</span>;
    return <span className="badge bg-warning-transparent text-warning">⏳ Pendiente</span>;
};

// ── Flow step ─────────────────────────────────────────────────────────────────

const FlowStep: React.FC<{ label: string; count: number; color: string; last?: boolean }> = ({ label, count, color, last }) => (
    <div className="d-flex align-items-center gap-2">
        <div className="text-center">
            <div
                className="rounded-3 px-3 py-2 fw-semibold fs-13"
                style={{ background: `${color}20`, color, border: `1px solid ${color}40`, minWidth: 90 }}
            >
                {label}
                <div className="fs-18 fw-bold mt-1">{count}</div>
            </div>
        </div>
        {!last && <i className="ri-arrow-right-line text-muted fs-18"></i>}
    </div>
);

// ── Page ─────────────────────────────────────────────────────────────────────

const School: React.FC = () => {
    const { user, institution } = useAuth();
    const [isClient, setIsClient] = useState(false);

    const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [careers, setCareers] = useState<Career[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [credits, setCredits] = useState<EmissionCredit | null>(null);

    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => { setIsClient(true); }, []);

    useEffect(() => {
        const errs: string[] = [];
        Promise.allSettled([
            SyllabiService.getAll(),
            CoursesService.getAll(),
            CareersService.getAll(),
            CertificatesService.getCertificates(),
            EmissionCreditsService.getCredits(),
        ]).then(([s, c, ca, cert, cr]) => {
            if (s.status === "fulfilled") setSyllabi(s.value);
            else errs.push("sílabos");
            if (c.status === "fulfilled") setCourses(c.value);
            else errs.push("cursos");
            if (ca.status === "fulfilled") setCareers(ca.value);
            else errs.push("carreras");
            if (cert.status === "fulfilled") setCertificates(cert.value);
            // certificates may not be implemented — silently ignore
            if (cr.status === "fulfilled") {
                const list = cr.value;
                if (list.length > 0) setCredits(list[0]);
            }
            // emission-credits may not be implemented — silently ignore
            if (errs.length > 0) setErrors(errs);
        }).finally(() => setLoading(false));
    }, []);

    // ── KPI computations ──────────────────────────────────────────────────────
    const total = syllabi.length;
    const enCadena = syllabi.filter((s) => !!s.fabricTxId).length;
    const pendientes = syllabi.filter((s) => !s.fabricTxId && !!s.hash).length;
    const sinRegistrar = syllabi.filter((s) => !s.hash).length;
    const validados = syllabi.filter((s) => s.status?.toLowerCase() === "validated").length;
    const confirmados = syllabi.filter((s) => s.status?.toLowerCase() === "confirmed").length;
    const cobertura = total > 0 ? Math.round((enCadena / total) * 100) : 0;

    const sorted = [...syllabi].sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    const recentSyllabi = sorted.slice(0, 8);

    const chartData = groupByMonth(syllabi);

    const chartOptions: ApexCharts.ApexOptions = {
        chart: { fontFamily: "'Segoe UI', sans-serif", toolbar: { show: false } },
        stroke: { curve: "smooth", width: [0, 3] },
        colors: ["#4767ed", "#10b981"],
        fill: { type: ["solid", "gradient"], gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
        dataLabels: { enabled: false },
        xaxis: {
            categories: chartData.categories,
            labels: { style: { colors: "#8a92a6", fontSize: "12px" } },
        },
        yaxis: { labels: { style: { colors: "#8a92a6" } } },
        legend: { position: "top", fontSize: "12px" },
        grid: { borderColor: "#f0f0f0" },
        tooltip: { shared: true },
    };

    const chartSeries = [
        { name: "Sílabos subidos", type: "bar", data: chartData.total },
        { name: "Confirmados en Fabric", type: "area", data: chartData.confirmed },
    ];

    // Donut for trazabilidad
    const donutOptions: ApexCharts.ApexOptions = {
        chart: { type: "donut", fontFamily: "'Segoe UI', sans-serif" },
        colors: ["#10b981", "#f59e0b", "#ef4444"],
        labels: ["En cadena", "Pendiente", "Sin registrar"],
        legend: { position: "bottom", fontSize: "11px" },
        dataLabels: { enabled: false },
        plotOptions: { pie: { donut: { size: "65%", labels: { show: true, total: { show: true, label: "Total", color: "#6c757d", fontSize: "12px" } } } } },
    };
    const donutSeries = [enCadena, pendientes, sinRegistrar].filter((_, i) => i < 3);

    return (
        <Fragment>
            <Seo title="Dashboard Institucional" />
            <Pageheader title="Dashboard Institucional" currentpage="Dashboard" activepage="Dashboard" />

            {/* ── Banner de institución ── */}
            <Card className="custom-card mb-4" style={{ background: "linear-gradient(135deg, #4767ed 0%, #6366f1 100%)", border: "none" }}>
                <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3 py-3">
                    <div className="d-flex align-items-center gap-3">
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="ri-building-line fs-4 text-white"></i>
                        </div>
                        <div>
                            <h5 className="mb-0 fw-semibold text-white">{institution?.name ?? "Institución"}</h5>
                            <p className="mb-0 text-white-50 fs-12">
                                {user?.email} · <span className="text-white-75">{user?.role || "—"}</span>
                            </p>
                        </div>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                        <Link href="/gestion/silabos" className="btn btn-sm" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
                            <i className="ri-upload-cloud-2-line me-1"></i>Gestión de Sílabos
                        </Link>
                        <Link href="/core/blockchain" className="btn btn-sm" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
                            <i className="ri-links-line me-1"></i>Trazabilidad
                        </Link>
                        <Link href="/gestion/carreras" className="btn btn-sm" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
                            <i className="ri-book-open-line me-1"></i>Gestión Académica
                        </Link>
                    </div>
                </Card.Body>
            </Card>

            {errors.length > 0 && (
                <Alert variant="warning" className="fs-12 py-2 mb-3">
                    <i className="ri-error-warning-line me-1"></i>
                    No se pudieron cargar algunos datos ({errors.join(", ")}). El resto del dashboard muestra información disponible.
                </Alert>
            )}

            {/* ── Row 1: KPIs principales ── */}
            <Row className="g-3 mb-4">
                <Col xl={3} md={6}>
                    <KpiCard
                        icon="ri-file-list-3-line" iconBg="#4767ed1a" iconColor="#4767ed"
                        label="Total Sílabos" value={total}
                        sub={`${courses.length} cursos · ${careers.length} carreras`}
                        loading={loading} href="/gestion/silabos"
                    />
                </Col>
                <Col xl={3} md={6}>
                    <KpiCard
                        icon="ri-links-line" iconBg="#10b9811a" iconColor="#10b981"
                        label="Sílabos en Blockchain" value={enCadena}
                        sub={`de ${total} registrados`}
                        trend={{ value: `${cobertura}% cobertura`, up: cobertura >= 80 }}
                        loading={loading} href="/core/blockchain"
                    />
                </Col>
                <Col xl={3} md={6}>
                    <KpiCard
                        icon="ri-pie-chart-line" iconBg="#6366f11a" iconColor="#6366f1"
                        label="Trazabilidad" value={`${cobertura}%`}
                        sub="sílabos con fabricTxId"
                        loading={loading}
                    />
                </Col>
                <Col xl={3} md={6}>
                    <KpiCard
                        icon="ri-hourglass-line" iconBg="#f59e0b1a" iconColor="#f59e0b"
                        label="Pendientes de Validación" value={pendientes}
                        sub="sin confirmación en Fabric"
                        loading={loading} href="/gestion/silabos"
                    />
                </Col>
            </Row>

            {/* ── Row 2: Cursos, carreras, créditos ── */}
            <Row className="g-3 mb-4">
                <Col xl={2} md={4} sm={6}>
                    <KpiCard
                        icon="ri-book-2-line" iconBg="#0ea5e91a" iconColor="#0ea5e9"
                        label="Cursos" value={courses.length}
                        sub="registrados" loading={loading}
                    />
                </Col>
                <Col xl={2} md={4} sm={6}>
                    <KpiCard
                        icon="ri-graduation-cap-line" iconBg="#8b5cf61a" iconColor="#8b5cf6"
                        label="Carreras" value={careers.length}
                        sub="activas" loading={loading}
                    />
                </Col>
                <Col xl={2} md={4} sm={6}>
                    <KpiCard
                        icon="ri-checkbox-circle-line" iconBg="#22c55e1a" iconColor="#22c55e"
                        label="Validados" value={validados}
                        sub="aprobados" loading={loading}
                    />
                </Col>
                <Col xl={2} md={4} sm={6}>
                    <KpiCard
                        icon="ri-shield-check-line" iconBg="#10b9811a" iconColor="#10b981"
                        label="Confirmados" value={confirmados}
                        sub="en Fabric" loading={loading}
                    />
                </Col>
                {credits && (
                    <>
                        <Col xl={2} md={4} sm={6}>
                            <KpiCard
                                icon="ri-coins-line" iconBg="#f59e0b1a" iconColor="#f59e0b"
                                label="Créditos disponibles" value={credits.availableCredits}
                                sub={`de ${credits.totalCredits} comprados`} loading={loading}
                            />
                        </Col>
                        <Col xl={2} md={4} sm={6}>
                            <KpiCard
                                icon="ri-award-line" iconBg="#ef44441a" iconColor="#ef4444"
                                label="Créditos usados" value={credits.usedCredits}
                                sub={`${Math.round((credits.usedCredits / credits.totalCredits) * 100)}% utilizado`} loading={loading}
                            />
                        </Col>
                    </>
                )}
                {certificates.length > 0 && (
                    <Col xl={credits ? 12 : 4} md={4} sm={6}>
                        <KpiCard
                            icon="ri-medal-line" iconBg="#6366f11a" iconColor="#6366f1"
                            label="Certificados emitidos" value={certificates.filter(c => c.status === "issued").length}
                            sub={`${certificates.filter(c => c.status === "pending").length} pendientes`} loading={loading}
                        />
                    </Col>
                )}
            </Row>

            {/* ── Row 3: Gráfico + Donut + Flujo de estados ── */}
            <Row className="g-3 mb-4">
                {/* Gráfico evolución por mes */}
                <Col xl={7}>
                    <Card className="custom-card h-100">
                        <Card.Header>
                            <div className="card-title d-flex align-items-center gap-2">
                                <i className="ri-bar-chart-2-line text-primary"></i>
                                Cronología de Sílabos y Trazabilidad
                            </div>
                            <div className="d-flex gap-2 ms-auto fs-12 text-muted">
                                <span><i className="ri-circle-fill me-1" style={{ color: "#4767ed" }}></i>Subidos</span>
                                <span><i className="ri-circle-fill me-1" style={{ color: "#10b981" }}></i>En Fabric</span>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {loading ? (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: 260 }}>
                                    <Spinner animation="border" />
                                </div>
                            ) : total === 0 ? (
                                <div className="text-center text-muted py-5">
                                    <i className="ri-file-unknow-line fs-1 d-block mb-2"></i>
                                    <p className="mb-0">No hay sílabos registrados aún.</p>
                                </div>
                            ) : isClient && (
                                <Spkapexcharts
                                    chartOptions={chartOptions}
                                    chartSeries={chartSeries}
                                    type="line"
                                    width="100%"
                                    height={260}
                                />
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Donut trazabilidad + flujo */}
                <Col xl={5}>
                    <Row className="g-3 h-100">
                        <Col xl={12}>
                            <Card className="custom-card">
                                <Card.Header>
                                    <div className="card-title d-flex align-items-center gap-2">
                                        <i className="ri-donut-chart-line text-primary"></i>
                                        Estado de Trazabilidad
                                    </div>
                                </Card.Header>
                                <Card.Body className="d-flex align-items-center justify-content-center">
                                    {loading ? <Spinner animation="border" /> : total === 0 ? (
                                        <p className="text-muted fs-13 mb-0">Sin datos</p>
                                    ) : isClient && (
                                        <Spkapexcharts
                                            chartOptions={donutOptions}
                                            chartSeries={donutSeries}
                                            type="donut"
                                            width="100%"
                                            height={200}
                                        />
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xl={12}>
                            <Card className="custom-card">
                                <Card.Header>
                                    <div className="card-title d-flex align-items-center gap-2">
                                        <i className="ri-flow-chart text-primary"></i>
                                        Flujo de Estados
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <div className="d-flex align-items-center flex-wrap gap-2 justify-content-center">
                                        <FlowStep label="Subidos" count={total} color="#4767ed" />
                                        <FlowStep label="Confirmados" count={confirmados} color="#10b981" />
                                        <FlowStep label="Validados" count={validados} color="#6366f1" />
                                        <FlowStep label="En Cadena" count={enCadena} color="#0ea5e9" last />
                                    </div>
                                    {total > 0 && (
                                        <div className="mt-3">
                                            <ProgressBar style={{ height: 6 }}>
                                                <ProgressBar now={(enCadena / total) * 100} style={{ background: "#10b981" }} key={1} />
                                                <ProgressBar now={(pendientes / total) * 100} style={{ background: "#f59e0b" }} key={2} />
                                                <ProgressBar now={(sinRegistrar / total) * 100} style={{ background: "#ef4444" }} key={3} />
                                            </ProgressBar>
                                            <div className="d-flex justify-content-between fs-11 text-muted mt-1">
                                                <span style={{ color: "#10b981" }}>En cadena {cobertura}%</span>
                                                <span style={{ color: "#f59e0b" }}>Pendiente {total > 0 ? Math.round((pendientes / total) * 100) : 0}%</span>
                                                <span style={{ color: "#ef4444" }}>Sin registrar {total > 0 ? Math.round((sinRegistrar / total) * 100) : 0}%</span>
                                            </div>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {/* ── Row 4: Red Fabric + Actividad reciente ── */}
            <Row className="g-3 mb-4">
                {/* Estado de red Fabric */}
                <Col xl={4}>
                    <Card className="custom-card h-100">
                        <Card.Header>
                            <div className="card-title d-flex align-items-center gap-2">
                                <i className="ri-cpu-line text-primary"></i>
                                Estado de Red Hyperledger Fabric
                            </div>
                            <span className="badge bg-success-transparent text-success ms-auto fs-11">
                                <i className="ri-radio-button-line me-1"></i>Activa
                            </span>
                        </Card.Header>
                        <Card.Body>
                            {[
                                { label: "Red", value: "Hyperledger Fabric", icon: "ri-server-line", color: "#4767ed" },
                                { label: "Canal", value: "silabos-channel", icon: "ri-git-branch-line", color: "#6366f1" },
                                { label: "Bloque actual", value: loading ? "—" : `#${syllabi.reduce((m, s: any) => Math.max(m, s.blockNumber ?? 0), 0)}`, icon: "ri-stack-line", color: "#10b981" },
                                { label: "Sílabos en ledger", value: enCadena, icon: "ri-shield-check-line", color: "#0ea5e9" },
                                { label: "Cobertura total", value: `${cobertura}%`, icon: "ri-pie-chart-line", color: "#f59e0b" },
                                { label: "Último registro", value: loading ? "—" : formatRelative(sorted[0]?.uploadedAt), icon: "ri-time-line", color: "#8b5cf6" },
                            ].map((item) => (
                                <div key={item.label} className="d-flex align-items-center justify-content-between py-2" style={{ borderBottom: "1px solid #f5f5f5" }}>
                                    <div className="d-flex align-items-center gap-2 text-muted fs-13">
                                        <i className={item.icon} style={{ color: item.color, width: 16 }}></i>
                                        {item.label}
                                    </div>
                                    <span className="fw-semibold fs-13">{item.value}</span>
                                </div>
                            ))}
                        </Card.Body>
                        <Card.Footer className="text-center">
                            <Link href="/core/blockchain" className="text-primary fs-12 animated-underline">
                                <i className="ri-external-link-line me-1"></i>Ver ledger completo
                            </Link>
                        </Card.Footer>
                    </Card>
                </Col>

                {/* Actividad reciente */}
                <Col xl={8}>
                    <Card className="custom-card h-100">
                        <Card.Header className="d-flex align-items-center justify-content-between">
                            <div className="card-title d-flex align-items-center gap-2">
                                <i className="ri-history-line text-primary"></i>
                                Actividad Reciente — Sílabos
                            </div>
                            <Link href="/gestion/silabos" className="btn btn-primary btn-sm">
                                <i className="ri-upload-cloud-2-line me-1"></i>Subir Sílabo
                            </Link>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="text-center py-5"><Spinner animation="border" /></div>
                            ) : recentSyllabi.length === 0 ? (
                                <div className="text-center text-muted py-5">
                                    <i className="ri-file-unknow-line fs-1 d-block mb-2"></i>
                                    <p className="mb-0 fs-13">No hay sílabos registrados. Sube el primero.</p>
                                    <Link href="/gestion/silabos" className="btn btn-primary btn-sm mt-3">
                                        <i className="ri-upload-cloud-2-line me-1"></i>Subir Sílabo
                                    </Link>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="ps-3 fs-12 fw-semibold">Archivo</th>
                                                <th className="fs-12 fw-semibold">Curso</th>
                                                <th className="fs-12 fw-semibold">Hash SHA-256</th>
                                                <th className="fs-12 fw-semibold">Blockchain</th>
                                                <th className="fs-12 fw-semibold">Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentSyllabi.map((s) => (
                                                <tr key={s.id}>
                                                    <td className="ps-3">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <i className={`fs-4 ${s.fileName?.endsWith(".pdf") ? "ri-file-pdf-2-line text-danger" : "ri-file-word-line text-primary"}`}></i>
                                                            <div>
                                                                <div className="fw-medium fs-12 text-truncate" style={{ maxWidth: 160 }}>{s.fileName || "—"}</div>
                                                                <div className="text-muted fs-11">{formatRelative(s.uploadedAt)}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="fw-medium fs-12">{s.courseName}</div>
                                                        <div className="text-muted fs-11">{s.courseCode}</div>
                                                    </td>
                                                    <td>
                                                        <code className="text-muted fs-11">{s.hash ? `${s.hash.substring(0, 14)}...` : "—"}</code>
                                                    </td>
                                                    <td><BlockchainBadge syllabus={s} /></td>
                                                    <td className="fs-12 text-muted">{formatDate(s.uploadedAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card.Body>
                        {recentSyllabi.length > 0 && (
                            <Card.Footer className="text-center py-2">
                                <Link href="/gestion/silabos" className="text-primary fs-12 animated-underline">
                                    <i className="ri-arrow-right-line me-1"></i>Ver todos los sílabos
                                </Link>
                            </Card.Footer>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* ── Row 5: Certificados (solo si el backend los tiene) ── */}
            {certificates.length > 0 && (
                <Row className="g-3">
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Header className="d-flex align-items-center justify-content-between">
                                <div className="card-title d-flex align-items-center gap-2">
                                    <i className="ri-medal-line text-primary"></i>
                                    Historial de Certificados
                                    <Badge bg="primary" className="fs-11 ms-1">{certificates.length}</Badge>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="ps-3 fs-12 fw-semibold">Estudiante</th>
                                                <th className="fs-12 fw-semibold">Correo</th>
                                                <th className="fs-12 fw-semibold">Curso</th>
                                                <th className="fs-12 fw-semibold">Fecha</th>
                                                <th className="fs-12 fw-semibold">TX Blockchain</th>
                                                <th className="fs-12 fw-semibold">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {certificates.slice(0, 10).map((cert) => (
                                                <tr key={cert.id}>
                                                    <td className="ps-3 fw-medium fs-13">{cert.studentName}</td>
                                                    <td className="text-muted fs-12">{cert.studentEmail}</td>
                                                    <td className="fs-12">{cert.courseName}<br /><small className="text-muted">{cert.courseCode}</small></td>
                                                    <td className="fs-12 text-muted">{formatDate(cert.issuedDate)}</td>
                                                    <td>
                                                        {cert.fabricTxId ? (
                                                            <Link href={`/core/blockchain?tx=${cert.fabricTxId}`} className="text-primary fs-11">
                                                                <code>{cert.fabricTxId.substring(0, 14)}...</code>
                                                            </Link>
                                                        ) : <span className="text-muted fs-12">—</span>}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${cert.status === "issued" ? "bg-success-transparent text-success" : cert.status === "pending" ? "bg-warning-transparent text-warning" : "bg-danger-transparent text-danger"}`}>
                                                            {cert.status === "issued" ? "Emitido" : cert.status === "pending" ? "Pendiente" : "Revocado"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Fragment>
    );
};

export default School;
