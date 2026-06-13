"use client";

import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import React, { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { Card, Col, Row, Spinner, Alert, Badge } from "react-bootstrap";
import { SyllabiService, Syllabus } from "@/shared/services/syllabi.service";

// ── helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso?: string) =>
    iso
        ? new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

const formatRelative = (iso?: string) => {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)}d`;
};

// ── blockchain badge ──────────────────────────────────────────────────────────

const BlockchainBadge: React.FC<{ syllabus: Syllabus }> = ({ syllabus }) => {
    if (!syllabus.hash) {
        return <span className="badge bg-danger-transparent text-danger">⚠️ Sin registrar</span>;
    }
    if (syllabus.fabricTxId) {
        return <span className="badge bg-success-transparent text-success">⛓ En cadena</span>;
    }
    return <span className="badge bg-warning-transparent text-warning">⏳ Pendiente</span>;
};

// ── KPI card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
    icon: string;
    iconColor: string;
    label: string;
    value: string | number;
    sub?: string;
    loading?: boolean;
}
const KpiCard: React.FC<KpiCardProps> = ({ icon, iconColor, label, value, sub, loading }) => (
    <Card className="custom-card h-100">
        <Card.Body>
            <div className="d-flex align-items-center gap-3">
                <div
                    style={{
                        width: 52, height: 52, borderRadius: 12,
                        background: `${iconColor}1a`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}
                >
                    <i className={`${icon} fs-4`} style={{ color: iconColor }}></i>
                </div>
                <div>
                    <p className="text-muted fs-12 mb-1 fw-medium">{label}</p>
                    {loading
                        ? <Spinner animation="border" size="sm" />
                        : <h4 className="mb-0 fw-bold">{value}</h4>
                    }
                    {sub && <span className="text-muted fs-11">{sub}</span>}
                </div>
            </div>
        </Card.Body>
    </Card>
);

// ── page ──────────────────────────────────────────────────────────────────────

const DashboardGestion: React.FC = () => {
    const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        SyllabiService.getAll()
            .then(setSyllabi)
            .catch(() => setError("No se pudieron cargar los datos del dashboard."))
            .finally(() => setLoading(false));
    }, []);

    // ── KPI computations ──────────────────────────────────────────────────────
    const total = syllabi.length;
    const enCadena = syllabi.filter((s) => !!s.fabricTxId).length;
    const pendientes = syllabi.filter((s) => !s.fabricTxId && !!s.hash).length;
    const cobertura = total > 0 ? Math.round((enCadena / total) * 100) : 0;

    const sorted = [...syllabi].sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    const lastActivity = sorted[0];
    const recentSyllabi = sorted.slice(0, 5);

    // Fabric "network" info derived from data
    const maxBlock = syllabi.reduce((m, s: any) => Math.max(m, s.blockNumber ?? 0), 0);

    return (
        <Fragment>
            <Seo title="Dashboard" />
            <Pageheader
                title="Gestión Académica"
                subtitle="Dashboard"
                currentpage="Dashboard"
                activepage="Inicio"
            />

            {error && <Alert variant="danger">{error}</Alert>}

            {/* ── Row 1: KPIs ── */}
            <Row className="g-3 mb-3">
                <Col xl={3} md={6}>
                    <KpiCard
                        icon="ri-file-list-3-line"
                        iconColor="#4767ed"
                        label="Total sílabos"
                        value={total}
                        sub="registrados en el sistema"
                        loading={loading}
                    />
                </Col>
                <Col xl={3} md={6}>
                    <KpiCard
                        icon="ri-links-line"
                        iconColor="#10b981"
                        label="En blockchain"
                        value={`${enCadena} / ${total}`}
                        sub={`${cobertura}% cobertura de trazabilidad`}
                        loading={loading}
                    />
                </Col>
                <Col xl={3} md={6}>
                    <KpiCard
                        icon="ri-time-line"
                        iconColor="#f59e0b"
                        label="Última actividad"
                        value={loading ? "—" : formatRelative(lastActivity?.uploadedAt)}
                        sub={loading ? "" : lastActivity?.fileName ?? "Sin registros"}
                        loading={false}
                    />
                </Col>
                <Col xl={3} md={6}>
                    <KpiCard
                        icon="ri-hourglass-line"
                        iconColor="#ef4444"
                        label="Pendientes de validación"
                        value={pendientes}
                        sub="sin confirmación en Fabric"
                        loading={loading}
                    />
                </Col>
            </Row>

            {/* ── Row 2: Fabric network + Recent activity ── */}
            <Row className="g-3 mb-3">
                {/* Fabric network widget */}
                <Col xl={4}>
                    <Card className="custom-card h-100">
                        <Card.Header>
                            <div className="card-title d-flex align-items-center gap-2">
                                <i className="ri-cpu-line text-primary"></i>
                                Estado de Red Fabric
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {loading ? (
                                <div className="text-center py-3"><Spinner animation="border" /></div>
                            ) : (
                                <ul className="list-unstyled mb-0">
                                    {[
                                        { label: "Canal", value: "silabos-channel", icon: "ri-git-branch-line", color: "#4767ed" },
                                        { label: "Bloque actual", value: maxBlock > 0 ? `#${maxBlock}` : "—", icon: "ri-stack-line", color: "#10b981" },
                                        { label: "Sílabos en ledger", value: enCadena, icon: "ri-shield-check-line", color: "#6366f1" },
                                        { label: "Cobertura", value: `${cobertura}%`, icon: "ri-pie-chart-line", color: "#f59e0b" },
                                    ].map((item) => (
                                        <li key={item.label} className="d-flex align-items-center justify-content-between py-2" style={{ borderBottom: "1px solid #f0f0f0" }}>
                                            <div className="d-flex align-items-center gap-2 text-muted fs-13">
                                                <i className={`${item.icon}`} style={{ color: item.color }}></i>
                                                {item.label}
                                            </div>
                                            <span className="fw-semibold fs-13">{item.value}</span>
                                        </li>
                                    ))}
                                    <li className="d-flex align-items-center justify-content-between py-2">
                                        <div className="d-flex align-items-center gap-2 text-muted fs-13">
                                            <i className="ri-radio-button-line text-success"></i>
                                            Estado de red
                                        </div>
                                        <span className="badge bg-success-transparent text-success fs-11">Activa</span>
                                    </li>
                                </ul>
                            )}
                        </Card.Body>
                        <Card.Footer className="text-center">
                            <Link href="/core/blockchain" className="text-primary fs-12 animated-underline">
                                <i className="ri-link-m me-1"></i>Ver trazabilidad completa
                            </Link>
                        </Card.Footer>
                    </Card>
                </Col>

                {/* Cobertura visual */}
                <Col xl={4}>
                    <Card className="custom-card h-100">
                        <Card.Header>
                            <div className="card-title d-flex align-items-center gap-2">
                                <i className="ri-pie-chart-line text-primary"></i>
                                Cobertura de Trazabilidad
                            </div>
                        </Card.Header>
                        <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                            {loading ? <Spinner animation="border" /> : (
                                <>
                                    <div
                                        style={{
                                            width: 120, height: 120, borderRadius: "50%",
                                            background: `conic-gradient(#10b981 0% ${cobertura}%, #e9ecef ${cobertura}% 100%)`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            margin: "0 auto 1rem",
                                        }}
                                    >
                                        <div style={{ width: 84, height: 84, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                                            <span className="fw-bold fs-5" style={{ color: "#10b981" }}>{cobertura}%</span>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-4 fs-12 text-muted">
                                        <div className="d-flex align-items-center gap-1">
                                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                                            En cadena ({enCadena})
                                        </div>
                                        <div className="d-flex align-items-center gap-1">
                                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#e9ecef", display: "inline-block" }}></span>
                                            Pendiente ({total - enCadena})
                                        </div>
                                    </div>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Recent activity */}
                <Col xl={4}>
                    <Card className="custom-card h-100">
                        <Card.Header>
                            <div className="card-title d-flex align-items-center gap-2">
                                <i className="ri-history-line text-primary"></i>
                                Actividad Reciente
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="text-center py-4"><Spinner animation="border" /></div>
                            ) : recentSyllabi.length === 0 ? (
                                <div className="text-center text-muted py-4 fs-13">Sin actividad registrada.</div>
                            ) : (
                                <ul className="list-unstyled mb-0">
                                    {recentSyllabi.map((s) => (
                                        <li key={s.id} className="px-3 py-2 d-flex align-items-center gap-2" style={{ borderBottom: "1px solid #f5f5f5" }}>
                                            <i className={`fs-4 flex-shrink-0 ${s.fileName?.endsWith(".pdf") ? "ri-file-pdf-2-line text-danger" : "ri-file-word-line text-primary"}`}></i>
                                            <div className="flex-grow-1 overflow-hidden">
                                                <p className="mb-0 fw-medium fs-12 text-truncate">{s.fileName || "—"}</p>
                                                <p className="mb-0 text-muted fs-11">{s.courseName} · {formatRelative(s.uploadedAt)}</p>
                                            </div>
                                            <BlockchainBadge syllabus={s} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card.Body>
                        <Card.Footer className="text-center">
                            <Link href="/gestion/silabos" className="text-primary fs-12 animated-underline">
                                <i className="ri-arrow-right-line me-1"></i>Ver todos los sílabos
                            </Link>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            {/* ── Row 3: Pending validation table ── */}
            {!loading && pendientes > 0 && (
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Header>
                                <div className="card-title d-flex align-items-center gap-2">
                                    <i className="ri-hourglass-line text-warning"></i>
                                    Sílabos Pendientes de Validación Blockchain
                                    <Badge bg="warning" text="dark" className="ms-1">{pendientes}</Badge>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <table className="table text-nowrap mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="fs-12 fw-semibold">Archivo</th>
                                                <th className="fs-12 fw-semibold">Curso</th>
                                                <th className="fs-12 fw-semibold">Hash SHA-256</th>
                                                <th className="fs-12 fw-semibold">Fecha</th>
                                                <th className="fs-12 fw-semibold">Estado Fabric</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {syllabi
                                                .filter((s) => !s.fabricTxId && !!s.hash)
                                                .map((s) => (
                                                    <tr key={s.id}>
                                                        <td>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <i className={`fs-4 ${s.fileName?.endsWith(".pdf") ? "ri-file-pdf-2-line text-danger" : "ri-file-word-line text-primary"}`}></i>
                                                                <span className="fw-medium fs-13">{s.fileName || "—"}</span>
                                                            </div>
                                                        </td>
                                                        <td className="fs-13">{s.courseName}<br /><small className="text-muted">{s.courseCode}</small></td>
                                                        <td><code className="fs-11 text-muted">{s.hash ? `${s.hash.substring(0, 16)}...` : "—"}</code></td>
                                                        <td className="fs-13">{formatDate(s.uploadedAt)}</td>
                                                        <td><BlockchainBadge syllabus={s} /></td>
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

export default DashboardGestion;
