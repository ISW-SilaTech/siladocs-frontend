"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import publicApi from "@/shared/config/axios-public";
import { AzureBlobService } from "@/shared/services/azure-blob.service";
import { SyllabusTrace, SyllabusVersion } from "@/shared/types/ledger";
import Seo from "@/shared/layouts-components/seo/seo";
import { useSearchParams } from "next/navigation";

interface EmbeddedPayload {
  id: string;
  courseName: string;
  courseCode: string;
  career: string;
  versionNumber: number;
  fileHash: string;
  fabricTxId: string | null;
  isOnBlockchain: boolean;
  uploadedBy: string | null;
  createdAt: string;
  fileUrl: string | null;
  channel: string;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-PE", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

// ── Loading ───────────────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
    <div className="text-center">
      <Spinner animation="border" variant="primary" className="mb-3" />
      <p className="text-muted fs-13">Verificando autenticidad del sílabo...</p>
    </div>
  </div>
);

// ── Error ─────────────────────────────────────────────────────────────────────
const ErrorScreen = ({ message }: { message: string }) => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
    <div className="text-center px-4" style={{ maxWidth: 480 }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
        <i className="ri-error-warning-line" style={{ fontSize: 36, color: "#ef4444" }}></i>
      </div>
      <h4 className="fw-bold mb-2 text-danger">Enlace no válido</h4>
      <p className="text-muted fs-13">{message}</p>
    </div>
  </div>
);

// ── Main content ──────────────────────────────────────────────────────────────
const PublicVerifyContent: React.FC = () => {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");
  const syllabusId = searchParams.get("id");
  const versionParam = searchParams.get("version");

  const [payload, setPayload] = useState<EmbeddedPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfFailed, setPdfFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);

      // ── New format: ?data=<base64> ──────────────────────────────────────
      if (dataParam) {
        try {
          const decoded: EmbeddedPayload = JSON.parse(
            decodeURIComponent(escape(atob(dataParam)))
          );
          setPayload(decoded);
        } catch {
          setError("El enlace de verificación no es válido o está dañado.");
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // ── Legacy format: ?id=&version= ───────────────────────────────────
      if (!syllabusId) {
        setError("No se proporcionaron datos de verificación en el enlace.");
        setIsLoading(false);
        return;
      }
      try {
        const res = await publicApi.get<any>(`/syllabi/${syllabusId}`);
        const s = res.data;
        let versions: SyllabusVersion[] = [];
        try {
          const vr = await publicApi.get<SyllabusVersion[]>(`/syllabi/${syllabusId}/versions`);
          versions = vr.data || [];
        } catch { /* ignore */ }

        const targetVersion = versionParam
          ? versions.find(v => v.versionNumber === parseInt(versionParam, 10))
          : versions[0];

        setPayload({
          id: String(s.id),
          courseName: s.courseName ?? "—",
          courseCode: s.courseCode ?? "—",
          career: s.careerName ?? "—",
          versionNumber: targetVersion?.versionNumber ?? 1,
          fileHash: targetVersion?.fileHash ?? s.currentHash ?? s.hash ?? "",
          fabricTxId: targetVersion?.fabricTxId ?? s.fabricTxId ?? null,
          isOnBlockchain: targetVersion?.isOnBlockchain ?? !!s.fabricTxId,
          uploadedBy: targetVersion?.uploadedBy ?? s.uploaderEmail ?? null,
          createdAt: targetVersion?.createdAt ?? s.uploadedAt ?? new Date().toISOString(),
          fileUrl: targetVersion?.fileUrl ?? s.fileUrl ?? null,
          channel: s.channelName ?? "silabos-channel",
        });
      } catch {
        setError("No se encontró el sílabo o el enlace expiró. Solicita un nuevo código QR.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [dataParam, syllabusId, versionParam]);

  const copyUrl = async () => {
    const url = window.location.href;
    try { await navigator.clipboard.writeText(url); } catch {
      const t = document.createElement("textarea");
      t.value = url; document.body.appendChild(t); t.select();
      document.execCommand("copy"); document.body.removeChild(t);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return <LoadingScreen />;
  if (error || !payload) return <ErrorScreen message={error ?? "Sílabo no encontrado."} />;

  const isVerified = payload.isOnBlockchain && !!payload.fabricTxId;

  return (
    <>
      <Seo title={`Verificación — ${payload.courseName}`} />
      <style>{`
        body { background: #f1f5f9 !important; }
        .verify-card { border-radius: 16px; overflow: hidden; box-shadow: 0 4px 32px rgba(0,0,0,0.08); }
        .hash-box { font-family: 'Courier New', monospace; font-size: 12px; word-break: break-all;
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; color: #334155; }
        .info-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0;
          border-bottom: 1px solid #f1f5f9; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.05em; color: #94a3b8; min-width: 120px; padding-top: 2px; }
        .info-value { font-size: 13px; color: #1e293b; font-weight: 500; flex: 1; }
        .badge-verified { background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0;
          padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 600;
          display: inline-flex; align-items: center; gap: 6px; }
        .badge-pending { background: #fef9c3; color: #ca8a04; border: 1px solid #fde68a;
          padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 600;
          display: inline-flex; align-items: center; gap: 6px; }
        .pdf-frame { width: 100%; height: 520px; border: none; border-radius: 0 0 8px 8px; display: block; }
        .btn-copy { background: #f1f5f9; border: 1px solid #e2e8f0; color: #475569;
          border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: background 0.15s; display: inline-flex; align-items: center; gap: 6px; }
        .btn-copy:hover { background: #e2e8f0; }
        .btn-download { background: #3b82f6; border: none; color: #fff;
          border-radius: 8px; padding: 8px 20px; font-size: 13px; font-weight: 600;
          cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
        .btn-download:hover { background: #2563eb; }
        .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.06em; color: #94a3b8; margin-bottom: 12px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f1f5f9", paddingTop: 40, paddingBottom: 60 }}>
        <Container style={{ maxWidth: 720 }}>

          {/* ── Header brand ── */}
          <div className="text-center mb-4">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 999, padding: "6px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: 8 }}>
              <i className="ri-links-line" style={{ color: "#3b82f6" }}></i>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>SilaDocs · Verificación Blockchain</span>
            </div>
          </div>

          {/* ── Verification status card ── */}
          <div className="verify-card bg-white mb-4">
            {/* Status banner */}
            <div style={{
              background: isVerified
                ? "linear-gradient(135deg, #059669 0%, #10b981 100%)"
                : "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
              padding: "32px 40px", textAlign: "center", position: "relative", overflow: "hidden"
            }}>
              <div style={{ position: "absolute", right: -30, top: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
              <div style={{ position: "absolute", right: 40, top: 20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
              <div style={{
                width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px"
              }}>
                <i className={isVerified ? "ri-shield-check-fill" : "ri-shield-line"} style={{ fontSize: 36, color: "#fff" }}></i>
              </div>
              <h2 style={{ color: "#fff", fontWeight: 700, marginBottom: 8, fontSize: 22 }}>
                {isVerified ? "Documento Verificado" : "Pendiente de Registro"}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, marginBottom: 16 }}>
                {isVerified
                  ? "Este sílabo está registrado de forma inmutable en Hyperledger Fabric"
                  : "Este sílabo aún no ha sido confirmado en la red blockchain"}
              </p>
              <span className={isVerified ? "badge-verified" : "badge-pending"}>
                <i className={isVerified ? "ri-checkbox-circle-fill" : "ri-time-line"}></i>
                {isVerified ? "Inmutable · En Blockchain" : "Pendiente de confirmación"}
              </span>
            </div>

            {/* Course info */}
            <div style={{ padding: "28px 40px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: 4, color: "#0f172a" }}>{payload.courseName}</h4>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, color: "#64748b" }}>
                      <i className="ri-code-s-line me-1"></i>
                      <strong>{payload.courseCode}</strong>
                    </span>
                    {payload.career && payload.career !== "—" && (
                      <span style={{ fontSize: 13, color: "#64748b" }}>
                        <i className="ri-graduation-cap-line me-1"></i>{payload.career}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Versión</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#3b82f6", lineHeight: 1 }}>v{payload.versionNumber}</div>
                </div>
              </div>
            </div>

            {/* Blockchain details */}
            <div style={{ padding: "24px 40px", borderBottom: "1px solid #f1f5f9" }}>
              <p className="section-title">Registro Blockchain</p>
              <div>
                <div className="info-row">
                  <span className="info-label">Fecha de registro</span>
                  <span className="info-value">{fmtDate(payload.createdAt)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Subido por</span>
                  <span className="info-value">{payload.uploadedBy ?? "Sistema"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Canal Fabric</span>
                  <span className="info-value">{payload.channel}</span>
                </div>
                {payload.fabricTxId && (
                  <div className="info-row">
                    <span className="info-label">Transaction ID</span>
                    <span className="info-value">
                      <span className="hash-box" style={{ fontSize: 11, color: "#059669" }}>{payload.fabricTxId}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Hash */}
            <div style={{ padding: "24px 40px", borderBottom: "1px solid #f1f5f9" }}>
              <p className="section-title">Huella Digital SHA-256</p>
              <div className="hash-box">{payload.fileHash}</div>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 8, marginBottom: 0 }}>
                Este hash identifica de forma única el contenido exacto del documento.
                Cualquier modificación al archivo produce un hash completamente diferente.
              </p>
            </div>

            {/* PDF preview */}
            {payload.fileUrl && (
              <div style={{ padding: "24px 40px 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <p className="section-title mb-0">Documento</p>
                  <a href={payload.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-download">
                    <i className="ri-download-2-line"></i>Descargar PDF
                  </a>
                </div>
                {!pdfFailed ? (
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                    <iframe
                      src={`${payload.fileUrl}#toolbar=0`}
                      className="pdf-frame"
                      title="Vista previa del sílabo"
                      onError={() => setPdfFailed(true)}
                    />
                  </div>
                ) : (
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "32px 24px", textAlign: "center" }}>
                    <i className="ri-file-pdf-line" style={{ fontSize: 40, color: "#cbd5e1", display: "block", marginBottom: 8 }}></i>
                    <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                      La vista previa no está disponible en este navegador.
                    </p>
                    <a href={payload.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-download">
                      <i className="ri-external-link-line"></i>Abrir PDF en nueva pestaña
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Footer actions */}
            <div style={{ padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                <i className="ri-lock-line me-1"></i>
                Verificación proporcionada por SilaDocs · Hyperledger Fabric
              </span>
              <button className="btn-copy" onClick={copyUrl}>
                <i className={copied ? "ri-check-line" : "ri-share-line"}></i>
                {copied ? "¡Copiado!" : "Compartir enlace"}
              </button>
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
            © {new Date().getFullYear()} SilaDocs · Sistema de Gestión de Sílabos con Blockchain
          </p>
        </Container>
      </div>
    </>
  );
};

const PublicVerify: React.FC = () => (
  <Suspense fallback={<LoadingScreen />}>
    <PublicVerifyContent />
  </Suspense>
);

export default PublicVerify;
