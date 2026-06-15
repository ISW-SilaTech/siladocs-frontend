"use client";

import Spkapexcharts from "@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Link from "next/link";
import React, { Fragment, useEffect, useState } from "react";
import { Card, Col, Row, Spinner, ProgressBar } from "react-bootstrap";
import { useAuth } from "@/shared/contextapi";
import { SyllabiService, Syllabus } from "@/shared/services/syllabi.service";
import { CoursesService, Course } from "@/shared/services/courses.service";
import { CareersService, Career } from "@/shared/services/careers.service";
import { CertificatesService, Certificate } from "@/shared/services/certificates.service";
import { EmissionCreditsService, EmissionCredit } from "@/shared/services/emission-credits.service";

// ── helpers ────────────────────────────────────────────────────────────────────

const fmtDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtRelative = (iso?: string) => {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2) return "ahora mismo";
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `hace ${days}d`;
    return fmtDate(iso);
};

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
    const now = new Date().getMonth();
    return {
        categories: MONTHS.slice(0, now + 1),
        total: counts.slice(0, now + 1),
        confirmed: confirmed.slice(0, now + 1),
    };
};

// ── Skeleton loader ────────────────────────────────────────────────────────────

const Skeleton: React.FC<{ h?: number; w?: string; rounded?: boolean }> = ({
    h = 16, w = "100%", rounded = false,
}) => (
    <div
        style={{
            height: h, width: w, borderRadius: rounded ? 999 : 6,
            background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
        }}
    />
);

const SkeletonKpi: React.FC = () => (
    <Card className="custom-card h-100">
        <Card.Body>
            <div className="d-flex align-items-start gap-3">
                <Skeleton h={48} w="48px" rounded />
                <div className="flex-grow-1 d-flex flex-column gap-2">
                    <Skeleton h={12} w="60%" />
                    <Skeleton h={28} w="45%" />
                    <Skeleton h={11} w="75%" />
                </div>
            </div>
        </Card.Body>
    </Card>
);

// ── KPI card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
    icon: string;
    iconBg: string;
    iconColor: string;
    label: string;
    value: React.ReactNode;
    sub?: string;
    badge?: { label: string; color: string };
    href?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, iconBg, iconColor, label, value, sub, badge, href }) => (
    <Card className="custom-card h-100" style={{ transition: "box-shadow 0.2s" }}>
        <Card.Body>
            <div className="d-flex align-items-start gap-3">
                <div
                    style={{
                        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                        background: iconBg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    <i className={`${icon} fs-3`} style={{ color: iconColor }}></i>
                </div>
                <div className="flex-grow-1 overflow-hidden">
                    <p className="text-muted fs-12 mb-1 fw-medium text-uppercase" style={{ letterSpacing: "0.04em" }}>
                        {label}
                    </p>
                    <h3 className="mb-1 fw-bold" style={{ lineHeight: 1.1 }}>{value}</h3>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        {sub && <span className="text-muted fs-11">{sub}</span>}
                        {badge && (
                            <span
                                className="badge fs-10 fw-semibold"
                                style={{ background: `${badge.color}1a`, color: badge.color, border: `1px solid ${badge.color}30` }}
                            >
                                {badge.label}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Card.Body>
        {href && (
            <Card.Footer className="border-top-0 pt-0 pb-3 px-4">
                <Link href={href} className="fs-11 fw-medium animated-underline" style={{ color: iconColor }}>
                    Ver detalle <i className="ri-arrow-right-line"></i>
                </Link>
            </Card.Footer>
        )}
    </Card>
);

// ── Blockchain badge ──────────────────────────────────────────────────────────

const BlockchainBadge: React.FC<{ syllabus: Syllabus }> = ({ syllabus }) => {
    if (!syllabus.hash)
        return <span className="badge bg-danger-transparent text-danger" style={{ fontSize: "0.7rem" }}>⚠ Sin registrar</span>;
    if (syllabus.fabricTxId)
        return <span className="badge bg-success-transparent text-success" style={{ fontSize: "0.7rem" }}>⛓ En cadena</span>;
    return <span className="badge bg-warning-transparent text-warning" style={{ fontSize: "0.7rem" }}>⏳ Pendiente</span>;
};

// ── Empty state ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ icon: string; message: string; cta?: React.ReactNode }> = ({ icon, message, cta }) => (
    <div className="text-center py-5 px-3">
        <div
            style={{
                width: 64, height: 64, borderRadius: "50%", background: "#f0f4ff",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1rem",
            }}
        >
            <i className={`${icon} fs-2 text-primary`}></i>
        </div>
        <p className="text-muted fs-13 mb-0">{message}</p>
        {cta && <div className="mt-3">{cta}</div>}
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

    useEffect(() => { setIsClient(true); }, []);

    useEffect(() => {
        Promise.allSettled([
            SyllabiService.getAll(),
            CoursesService.getAll(),
            CareersService.getAll(),
            CertificatesService.getCertificates(),
            EmissionCreditsService.getCredits(),
        ]).then(([s, c, ca, cert, cr]) => {
            if (s.status === "fulfilled") setSyllabi(s.value);
            if (c.status === "fulfilled") setCourses(c.value);
            if (ca.status === "fulfilled") setCareers(ca.value);
            if (cert.status === "fulfilled") setCertificates(cert.value);
            if (cr.status === "fulfilled" && cr.value.length > 0) setCredits(cr.value[0]);
        }).finally(() => setLoading(false));
    }, []);

    // ── Derived metrics ───────────────────────────────────────────────────────
    const total = syllabi.length;
    const enCadena = syllabi.filter((s) => !!s.fabricTxId).length;
    const pendientes = syllabi.filter((s) => !s.fabricTxId && !!s.hash).length;
    const sinRegistrar = syllabi.filter((s) => !s.hash).length;
    const validados = syllabi.filter((s) => s.status?.toLowerCase() === "validated").length;
    const cobertura = total > 0 ? Math.round((enCadena / total) * 100) : 0;

    const sorted = [...syllabi].sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    const recentSyllabi = sorted.slice(0, 6);
    const chartData = groupByMonth(syllabi);
    const maxBlock = syllabi.reduce((m, s: any) => Math.max(m, s.blockNumber ?? 0), 0);

    // ── Chart config ──────────────────────────────────────────────────────────
    const mixedChartOptions = {
        chart: {
            fontFamily: "'Segoe UI', sans-serif",
            toolbar: { show: false },
            animations: { enabled: true, easing: "easeinout", speed: 600 },
        },
        colors: ["#4767ed", "#10b981"],
        stroke: { curve: "smooth", width: [0, 3] },
        fill: {
            type: ["solid", "gradient"],
            gradient: { type: "vertical", gradientToColors: ["#10b981"], opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 90] },
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: chartData.categories,
            labels: { style: { colors: "#9ca3af", fontSize: "11px" } },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: { labels: { style: { colors: "#9ca3af", fontSize: "11px" } } },
        legend: { show: false },
        grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
        tooltip: {
            shared: true,
            intersect: false,
            y: { formatter: (v: number) => `${v} sílabo${v !== 1 ? "s" : ""}` },
        },
        plotOptions: { bar: { borderRadius: 4, columnWidth: "45%" } },
    };

    const mixedSeries = [
        { name: "Sílabos subidos", type: "bar", data: chartData.total },
        { name: "Confirmados en Fabric", type: "area", data: chartData.confirmed },
    ];

    const donutOptions = {
        chart: { type: "donut", fontFamily: "'Segoe UI', sans-serif", animations: { enabled: true } },
        colors: ["#10b981", "#f59e0b", "#ef4444"],
        labels: ["En cadena", "Pendientes", "Sin registrar"],
        legend: { show: false },
        dataLabels: { enabled: false },
        plotOptions: {
            pie: {
                donut: {
                    size: "72%",
                    labels: {
                        show: true,
                        total: {
                            show: true, label: "Cobertura", color: "#6b7280", fontSize: "11px",
                            formatter: () => `${cobertura}%`,
                        },
                        value: { fontSize: "20px", fontWeight: "700", color: "#111827" },
                    },
                },
            },
        },
    };

    const safeDonutSeries = total > 0 ? [enCadena, pendientes, sinRegistrar] : [0, 0, 1];

    // ── Fabric health color ───────────────────────────────────────────────────
    const healthColor = cobertura >= 80 ? "#10b981" : cobertura >= 50 ? "#f59e0b" : "#ef4444";
    const healthLabel = cobertura >= 80 ? "Óptimo" : cobertura >= 50 ? "Parcial" : "Bajo";

    return (
        <Fragment>
            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                .kpi-card-link:hover { box-shadow: 0 4px 20px rgba(71,103,237,0.12) !important; }
                .activity-row:hover { background: #fafbff; }
                .stat-pill {
                    display: inline-flex; align-items: center; gap: 4px;
                    padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600;
                }
            `}</style>
            <Seo title="Dashboard Institucional" />
            <Pageheader title="Dashboard" currentpage="Dashboard" activepage="Inicio" />

            {/* ── Banner institucional ── */}
            <Card
                className="custom-card mb-4"
                style={{
                    background: "linear-gradient(135deg, #4767ed 0%, #5b6ef5 50%, #6366f1 100%)",
                    border: "none", overflow: "hidden", position: "relative",
                }}
            >
                {/* decorative circles */}
                <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
                <div style={{ position: "absolute", right: 60, top: 40, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3" style={{ padding: "1.1rem 1.5rem" }}>
                    <div className="d-flex align-items-center gap-3">
                        <div
                            style={{
                                width: 52, height: 52, borderRadius: 14,
                                background: "rgba(255,255,255,0.18)",
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}
                        >
                            <i className="ri-building-line fs-3 text-white"></i>
                        </div>
                        <div>
                            <h5 className="mb-0 fw-bold text-white" style={{ letterSpacing: "-0.01em" }}>
                                {institution?.name ?? "Institución"}
                            </h5>
                            <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
                                <span className="text-white-50 fs-12">{user?.email}</span>
                                <span
                                    className="stat-pill"
                                    style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
                                >
                                    <i className="ri-shield-user-line"></i>{user?.role || "—"}
                                </span>
                                {!loading && total > 0 && (
                                    <span
                                        className="stat-pill"
                                        style={{ background: `${healthColor}30`, color: "#fff", border: `1px solid ${healthColor}50` }}
                                    >
                                        <i className="ri-radio-button-line"></i>Trazabilidad {healthLabel}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                        <Link
                            href="/gestion/silabos"
                            className="btn btn-sm fw-medium"
                            style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(4px)" }}
                        >
                            <i className="ri-upload-cloud-2-line me-1"></i>Subir Sílabo
                        </Link>
                        <Link
                            href="/core/blockchain"
                            className="btn btn-sm fw-medium"
                            style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
                        >
                            <i className="ri-links-line me-1"></i>Ver Trazabilidad
                        </Link>
                    </div>
                </Card.Body>
            </Card>

            {/* ── Row 1: KPIs principales (4 cols iguales) ── */}
            <Row className="g-3 mb-4">
                {loading ? (
                    [0, 1, 2, 3].map((i) => (
                        <Col xl={3} md={6} key={i}><SkeletonKpi /></Col>
                    ))
                ) : (
                    <>
                        <Col xl={3} md={6}>
                            <KpiCard
                                icon="ri-file-text-line" iconBg="#4767ed18" iconColor="#4767ed"
                                label="Total Sílabos"
                                value={total}
                                sub={`${courses.length} cursos en ${careers.length} carreras`}
                                href="/gestion/silabos"
                            />
                        </Col>
                        <Col xl={3} md={6}>
                            <KpiCard
                                icon="ri-links-line" iconBg="#10b98118" iconColor="#10b981"
                                label="Registrados en Blockchain"
                                value={enCadena}
                                sub={total > 0 ? `${total - enCadena} aún no registrados` : "Sin datos"}
                                badge={total > 0 ? { label: `${cobertura}% cobertura`, color: "#10b981" } : undefined}
                                href="/core/blockchain"
                            />
                        </Col>
                        <Col xl={3} md={6}>
                            <KpiCard
                                icon="ri-shield-check-line" iconBg="#6366f118" iconColor="#6366f1"
                                label="Trazabilidad"
                                value={`${cobertura}%`}
                                sub="del total en Hyperledger Fabric"
                                badge={cobertura >= 80
                                    ? { label: "Óptimo", color: "#10b981" }
                                    : cobertura >= 50
                                    ? { label: "Parcial", color: "#f59e0b" }
                                    : { label: "Bajo", color: "#ef4444" }
                                }
                            />
                        </Col>
                        <Col xl={3} md={6}>
                            <KpiCard
                                icon="ri-hourglass-2-line" iconBg="#f59e0b18" iconColor="#f59e0b"
                                label="Pendientes de Registro"
                                value={pendientes}
                                sub={validados > 0 ? `${validados} validados · ${sinRegistrar} sin hash` : "sin confirmación en Fabric"}
                                badge={pendientes > 0 ? { label: "Requieren atención", color: "#f59e0b" } : { label: "Todo al día", color: "#10b981" }}
                                href="/gestion/silabos"
                            />
                        </Col>
                    </>
                )}
            </Row>

            {/* ── Row 2: Gráfico principal + panel derecho ── */}
            <Row className="g-3 mb-4">
                {/* Gráfico mixto bar + area */}
                <Col xl={8}>
                    <Card className="custom-card h-100">
                        <Card.Header className="d-flex align-items-center justify-content-between">
                            <div className="card-title d-flex align-items-center gap-2">
                                <i className="ri-bar-chart-grouped-line text-primary"></i>
                                Cronología de Sílabos y Trazabilidad
                            </div>
                            <div className="d-flex align-items-center gap-3 fs-12 text-muted">
                                <span className="d-flex align-items-center gap-1">
                                    <span style={{ width: 10, height: 10, borderRadius: 2, background: "#4767ed", display: "inline-block" }}></span>
                                    Subidos
                                </span>
                                <span className="d-flex align-items-center gap-1">
                                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                                    En Fabric
                                </span>
                            </div>
                        </Card.Header>
                        <Card.Body className="pb-2">
                            {loading ? (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: 400 }}>
                                    <Spinner animation="border" variant="primary" />
                                </div>
                            ) : total === 0 ? (
                                <EmptyState
                                    icon="ri-bar-chart-2-line"
                                    message="No hay sílabos para mostrar en el gráfico."
                                    cta={<Link href="/gestion/silabos" className="btn btn-primary btn-sm"><i className="ri-upload-cloud-2-line me-1"></i>Subir primer sílabo</Link>}
                                />
                            ) : isClient && (
                                <Spkapexcharts
                                    chartOptions={mixedChartOptions}
                                    chartSeries={mixedSeries}
                                    type="bar"
                                    width="100%"
                                    height={400}
                                />
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Panel derecho: donut + fabric status */}
                <Col xl={4}>
                    <Row className="g-3 h-100">
                        {/* Donut */}
                        <Col xl={12} md={6}>
                            <Card className="custom-card h-100">
                                <Card.Header>
                                    <div className="card-title d-flex align-items-center gap-2">
                                        <i className="ri-donut-chart-line text-primary"></i>
                                        Estado de Trazabilidad
                                    </div>
                                </Card.Header>
                                <Card.Body className="py-2">
                                    {loading ? (
                                        <div className="text-center py-3"><Spinner animation="border" variant="primary" /></div>
                                    ) : isClient && (
                                        <>
                                            <Spkapexcharts
                                                chartOptions={donutOptions}
                                                chartSeries={safeDonutSeries}
                                                type="donut"
                                                width="100%"
                                                height={180}
                                            />
                                            {total > 0 && (
                                                <div className="d-flex justify-content-around mt-1 pb-1">
                                                    {[
                                                        { label: "En cadena", count: enCadena, color: "#10b981" },
                                                        { label: "Pendiente", count: pendientes, color: "#f59e0b" },
                                                        { label: "Sin hash", count: sinRegistrar, color: "#ef4444" },
                                                    ].map((item) => (
                                                        <div key={item.label} className="text-center">
                                                            <div className="fw-bold fs-15" style={{ color: item.color }}>{item.count}</div>
                                                            <div className="text-muted fs-10">{item.label}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Red Fabric status */}
                        <Col xl={12} md={6}>
                            <Card className="custom-card h-100">
                                <Card.Header className="d-flex align-items-center justify-content-between">
                                    <div className="card-title d-flex align-items-center gap-2">
                                        <i className="ri-cpu-line text-primary"></i>
                                        Red Hyperledger Fabric
                                    </div>
                                    <span
                                        className="stat-pill"
                                        style={{ background: "#10b98115", color: "#10b981", border: "1px solid #10b98130" }}
                                    >
                                        <i className="ri-radio-button-line"></i>Activa
                                    </span>
                                </Card.Header>
                                <Card.Body className="py-2">
                                    {[
                                        { label: "Canal", value: "silabos-channel", icon: "ri-git-branch-line", color: "#6366f1" },
                                        { label: "Bloque", value: loading ? "…" : (maxBlock > 0 ? `#${maxBlock}` : "—"), icon: "ri-stack-line", color: "#10b981" },
                                        { label: "En ledger", value: loading ? "…" : enCadena, icon: "ri-shield-check-line", color: "#4767ed" },
                                        { label: "Último", value: loading ? "…" : fmtRelative(sorted[0]?.uploadedAt), icon: "ri-time-line", color: "#8b5cf6" },
                                    ].map((item, i, arr) => (
                                        <div
                                            key={item.label}
                                            className="d-flex align-items-center justify-content-between py-2"
                                            style={{ borderBottom: i < arr.length - 1 ? "1px solid #f5f5f5" : "none" }}
                                        >
                                            <div className="d-flex align-items-center gap-2 text-muted fs-12">
                                                <i className={item.icon} style={{ color: item.color, fontSize: 14 }}></i>
                                                {item.label}
                                            </div>
                                            <span className="fw-semibold fs-12">{item.value}</span>
                                        </div>
                                    ))}
                                    <div className="mt-2 pt-2" style={{ borderTop: "1px solid #f5f5f5" }}>
                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                            <span className="text-muted fs-11">Cobertura blockchain</span>
                                            <span className="fw-semibold fs-11" style={{ color: healthColor }}>{cobertura}%</span>
                                        </div>
                                        <ProgressBar style={{ height: 5, borderRadius: 99 }}>
                                            <ProgressBar now={cobertura} style={{ background: healthColor }} />
                                        </ProgressBar>
                                    </div>
                                </Card.Body>
                                <Card.Footer className="py-2 text-center">
                                    <Link href="/core/blockchain" className="text-primary fs-11 animated-underline fw-medium">
                                        Ver ledger completo <i className="ri-arrow-right-line"></i>
                                    </Link>
                                </Card.Footer>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {/* ── Row 3: Flujo de estados + Métricas académicas ── */}
            <Row className="g-3 mb-4">
                {/* Flujo */}
                <Col xl={8}>
                    <Card className="custom-card">
                        <Card.Header>
                            <div className="card-title d-flex align-items-center gap-2">
                                <i className="ri-flow-chart text-primary"></i>
                                Flujo de Registro en Blockchain
                            </div>
                            <span className="text-muted fs-11 ms-auto">
                                {total > 0 ? `${total} sílabos en el sistema` : "Sin sílabos"}
                            </span>
                        </Card.Header>
                        <Card.Body>
                            {/* Steps */}
                            <div className="d-flex align-items-stretch gap-0 mb-3" style={{ overflow: "hidden", borderRadius: 10 }}>
                                {[
                                    { label: "Subidos", count: total, color: "#4767ed", pct: 100 },
                                    { label: "Con hash", count: total - sinRegistrar, color: "#6366f1", pct: total > 0 ? Math.round(((total - sinRegistrar) / total) * 100) : 0 },
                                    { label: "En Fabric", count: enCadena, color: "#10b981", pct: cobertura },
                                    { label: "Validados", count: validados, color: "#0ea5e9", pct: total > 0 ? Math.round((validados / total) * 100) : 0 },
                                ].map((step, i, arr) => (
                                    <div
                                        key={step.label}
                                        style={{
                                            flex: 1,
                                            background: `${step.color}0d`,
                                            borderLeft: i > 0 ? `1px solid ${step.color}20` : "none",
                                            padding: "12px 16px",
                                            position: "relative",
                                        }}
                                    >
                                        <div className="d-flex align-items-center gap-1 mb-1">
                                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: step.color }}></div>
                                            <span className="fs-11 text-muted fw-medium">{step.label}</span>
                                        </div>
                                        <div className="fw-bold fs-22" style={{ color: step.color, lineHeight: 1 }}>
                                            {loading ? "—" : step.count}
                                        </div>
                                        <div className="text-muted fs-10 mt-1">{loading ? "" : `${step.pct}% del total`}</div>
                                        {i < arr.length - 1 && (
                                            <div style={{
                                                position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)",
                                                width: 16, height: 16, borderRadius: "50%",
                                                background: "#fff", border: `1px solid ${step.color}40`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                zIndex: 1, fontSize: 10, color: step.color,
                                            }}>
                                                <i className="ri-arrow-right-s-line"></i>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {/* Progress bar total */}
                            {total > 0 && (
                                <>
                                    <ProgressBar style={{ height: 6, borderRadius: 99 }}>
                                        <ProgressBar now={(enCadena / total) * 100} style={{ background: "#10b981" }} key={1} />
                                        <ProgressBar now={(pendientes / total) * 100} style={{ background: "#f59e0b" }} key={2} />
                                        <ProgressBar now={(sinRegistrar / total) * 100} style={{ background: "#ef4444" }} key={3} />
                                    </ProgressBar>
                                    <div className="d-flex justify-content-between fs-10 text-muted mt-1">
                                        <span style={{ color: "#10b981" }}>⛓ En cadena {cobertura}%</span>
                                        <span style={{ color: "#f59e0b" }}>⏳ Pendiente {total > 0 ? Math.round((pendientes / total) * 100) : 0}%</span>
                                        <span style={{ color: "#ef4444" }}>⚠ Sin registrar {total > 0 ? Math.round((sinRegistrar / total) * 100) : 0}%</span>
                                    </div>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Métricas académicas */}
                <Col xl={4}>
                    <Card className="custom-card h-100">
                        <Card.Header>
                            <div className="card-title d-flex align-items-center gap-2">
                                <i className="ri-graduation-cap-line text-primary"></i>
                                Estructura Académica
                            </div>
                        </Card.Header>
                        <Card.Body className="py-2">
                            {[
                                { label: "Carreras activas", value: careers.length, icon: "ri-graduation-cap-line", color: "#8b5cf6", href: "/gestion/carreras" },
                                { label: "Cursos registrados", value: courses.length, icon: "ri-book-2-line", color: "#0ea5e9", href: "/gestion/cursos" },
                                { label: "Sílabos subidos", value: total, icon: "ri-file-text-line", color: "#4767ed", href: "/gestion/silabos" },
                                { label: "Sílabos validados", value: validados, icon: "ri-checkbox-circle-line", color: "#10b981", href: "/gestion/silabos" },
                                ...(credits ? [
                                    { label: "Créditos disponibles", value: credits.availableCredits, icon: "ri-coins-line", color: "#f59e0b", href: undefined },
                                ] : []),
                                ...(certificates.length > 0 ? [
                                    { label: "Certificados emitidos", value: certificates.filter(c => c.status === "issued").length, icon: "ri-medal-line", color: "#6366f1", href: undefined },
                                ] : []),
                            ].map((item, i, arr) => (
                                <div
                                    key={item.label}
                                    className="d-flex align-items-center justify-content-between py-2"
                                    style={{ borderBottom: i < arr.length - 1 ? "1px solid #f8f8f8" : "none" }}
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        <div
                                            style={{
                                                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                                                background: `${item.color}15`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}
                                        >
                                            <i className={item.icon} style={{ color: item.color, fontSize: 14 }}></i>
                                        </div>
                                        <span className="fs-13 text-muted">{item.label}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="fw-bold fs-16" style={{ color: item.color }}>
                                            {loading ? "—" : item.value}
                                        </span>
                                        {item.href && (
                                            <Link href={item.href} className="text-muted" style={{ lineHeight: 1 }}>
                                                <i className="ri-arrow-right-line fs-12"></i>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* ── Row 4: Actividad reciente ── */}
            <Row className="g-3 mb-4">
                <Col xl={12}>
                    <Card className="custom-card">
                        <Card.Header className="d-flex align-items-center justify-content-between">
                            <div className="card-title d-flex align-items-center gap-2">
                                <i className="ri-history-line text-primary"></i>
                                Actividad Reciente
                                {!loading && recentSyllabi.length > 0 && (
                                    <span
                                        className="badge ms-1 fs-10"
                                        style={{ background: "#4767ed18", color: "#4767ed", border: "1px solid #4767ed30" }}
                                    >
                                        Últimos {recentSyllabi.length}
                                    </span>
                                )}
                            </div>
                            <Link href="/gestion/silabos" className="btn btn-primary btn-sm">
                                <i className="ri-upload-cloud-2-line me-1"></i>Subir Sílabo
                            </Link>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="p-4 d-flex flex-column gap-3">
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} className="d-flex align-items-center gap-3">
                                            <Skeleton h={36} w="36px" />
                                            <div className="flex-grow-1 d-flex flex-column gap-2">
                                                <Skeleton h={12} w="40%" />
                                                <Skeleton h={11} w="60%" />
                                            </div>
                                            <Skeleton h={22} w="80px" rounded />
                                        </div>
                                    ))}
                                </div>
                            ) : recentSyllabi.length === 0 ? (
                                <EmptyState
                                    icon="ri-file-list-3-line"
                                    message="Aún no hay sílabos registrados en el sistema."
                                    cta={
                                        <Link href="/gestion/silabos" className="btn btn-primary btn-sm">
                                            <i className="ri-upload-cloud-2-line me-1"></i>Subir el primer sílabo
                                        </Link>
                                    }
                                />
                            ) : (
                                <div className="table-responsive">
                                    <table className="table mb-0" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                                        <thead>
                                            <tr style={{ background: "#f9fafb" }}>
                                                <th className="ps-4 py-3 fs-11 fw-semibold text-uppercase text-muted" style={{ letterSpacing: "0.05em", borderBottom: "1px solid #f0f0f0" }}>Sílabo</th>
                                                <th className="py-3 fs-11 fw-semibold text-uppercase text-muted" style={{ letterSpacing: "0.05em", borderBottom: "1px solid #f0f0f0" }}>Curso</th>
                                                <th className="py-3 fs-11 fw-semibold text-uppercase text-muted" style={{ letterSpacing: "0.05em", borderBottom: "1px solid #f0f0f0" }}>Estado Fabric</th>
                                                <th className="py-3 fs-11 fw-semibold text-uppercase text-muted" style={{ letterSpacing: "0.05em", borderBottom: "1px solid #f0f0f0" }}>Fecha</th>
                                                <th className="py-3 pe-4 fs-11 fw-semibold text-uppercase text-muted" style={{ letterSpacing: "0.05em", borderBottom: "1px solid #f0f0f0" }}>Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentSyllabi.map((s, idx) => (
                                                <tr
                                                    key={s.id}
                                                    className="activity-row"
                                                    style={{ borderBottom: idx < recentSyllabi.length - 1 ? "1px solid #f5f5f5" : "none", transition: "background 0.15s" }}
                                                >
                                                    <td className="ps-4 py-3">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div
                                                                style={{
                                                                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                                                                    background: s.fileName?.endsWith(".pdf") ? "#fef2f2" : "#eff6ff",
                                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                                }}
                                                            >
                                                                <i className={`${s.fileName?.endsWith(".pdf") ? "ri-file-pdf-2-line text-danger" : "ri-file-word-line text-primary"} fs-5`}></i>
                                                            </div>
                                                            <div>
                                                                <div className="fw-semibold fs-13 text-truncate" style={{ maxWidth: 200 }}>
                                                                    {s.fileName || "Sin nombre"}
                                                                </div>
                                                                <div className="text-muted fs-11">{fmtRelative(s.uploadedAt)}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="fw-medium fs-13">{s.courseName || "—"}</div>
                                                        <div className="text-muted fs-11">{s.courseCode}</div>
                                                    </td>
                                                    <td className="py-3">
                                                        <BlockchainBadge syllabus={s} />
                                                        {s.fabricTxId && (
                                                            <div className="mt-1">
                                                                <code className="fs-10 text-muted">{s.fabricTxId.substring(0, 12)}…</code>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 fs-12 text-muted">{fmtDate(s.uploadedAt)}</td>
                                                    <td className="py-3 pe-4">
                                                        {s.fabricTxId ? (
                                                            <Link
                                                                href={`/core/blockchain`}
                                                                className="btn btn-sm fs-11 fw-medium"
                                                                style={{ background: "#6366f118", color: "#6366f1", border: "1px solid #6366f130", borderRadius: 6 }}
                                                            >
                                                                <i className="ri-links-line me-1"></i>Ver TX
                                                            </Link>
                                                        ) : (
                                                            <Link
                                                                href="/gestion/silabos"
                                                                className="btn btn-sm fs-11 fw-medium"
                                                                style={{ background: "#f59e0b18", color: "#f59e0b", border: "1px solid #f59e0b30", borderRadius: 6 }}
                                                            >
                                                                <i className="ri-refresh-line me-1"></i>Verificar
                                                            </Link>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card.Body>
                        {recentSyllabi.length > 0 && (
                            <Card.Footer className="d-flex align-items-center justify-content-between py-2 px-4">
                                <span className="text-muted fs-12">Mostrando {recentSyllabi.length} de {total} sílabos</span>
                                <Link href="/gestion/silabos" className="text-primary fs-12 fw-medium animated-underline">
                                    Ver todos <i className="ri-arrow-right-line"></i>
                                </Link>
                            </Card.Footer>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* ── Row 5: Certificados (condicional) ── */}
            {certificates.length > 0 && (
                <Row className="g-3">
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Header className="d-flex align-items-center justify-content-between">
                                <div className="card-title d-flex align-items-center gap-2">
                                    <i className="ri-medal-line text-primary"></i>
                                    Historial de Certificados
                                </div>
                                <span className="badge bg-primary-transparent text-primary fs-11">{certificates.length} emitidos</span>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <table className="table mb-0">
                                        <thead style={{ background: "#f9fafb" }}>
                                            <tr>
                                                {["Estudiante", "Curso", "Fecha", "TX Blockchain", "Estado"].map((h) => (
                                                    <th key={h} className={`py-3 ${h === "Estudiante" ? "ps-4" : ""} fs-11 fw-semibold text-uppercase text-muted`} style={{ letterSpacing: "0.05em", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {certificates.slice(0, 8).map((cert, idx, arr) => (
                                                <tr key={cert.id} style={{ borderBottom: idx < arr.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                                                    <td className="ps-4 py-3">
                                                        <div className="fw-semibold fs-13">{cert.studentName}</div>
                                                        <div className="text-muted fs-11">{cert.studentEmail}</div>
                                                    </td>
                                                    <td className="py-3 fs-13">{cert.courseName}<br /><small className="text-muted">{cert.courseCode}</small></td>
                                                    <td className="py-3 fs-12 text-muted">{fmtDate(cert.issuedDate)}</td>
                                                    <td className="py-3">
                                                        {cert.fabricTxId ? (
                                                            <Link href={`/core/blockchain?tx=${cert.fabricTxId}`} className="text-primary fs-11">
                                                                <code>{cert.fabricTxId.substring(0, 16)}…</code>
                                                            </Link>
                                                        ) : <span className="text-muted fs-12">—</span>}
                                                    </td>
                                                    <td className="py-3">
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
