'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type ShepherdTour = any;

const STORAGE_KEY = 'siladocs_onboarding_v2';

interface OnboardingModule {
  id: string;
  title: string;
  description: string;
  targetPath: string;
  icon: string;
  color: string;
  steps: ShepherdStep[];
}

interface ShepherdStep {
  attachTo?: { element: string; on: string };
  title: string;
  text: string;
}

const MODULES: OnboardingModule[] = [
  {
    id: 'TC-01',
    title: 'Registro de Sílabo',
    description: 'Carga un PDF y regístralo con hash SHA-256 en blockchain.',
    targetPath: '/gestion/silabos',
    icon: 'ri-file-upload-line',
    color: '#3b82f6',
    steps: [
      {
        title: 'TC-01 — Registro de Sílabo',
        text: 'Aquí se gestionan todos los sílabos de tu institución. Cada documento subido se protege con un hash SHA-256 y se registra en Hyperledger Fabric.',
      },
      {
        attachTo: { element: '#coach-btn-nuevo-silabo', on: 'bottom' },
        title: 'Paso 1 — Abrir formulario',
        text: 'Haz clic en <strong>"Subir Sílabo"</strong> para abrir el formulario de carga.',
      },
      {
        attachTo: { element: '#coach-modal-curso', on: 'bottom' },
        title: 'Paso 2 — Seleccionar curso',
        text: 'Selecciona el curso al que pertenece el sílabo desde el menú desplegable.',
      },
      {
        attachTo: { element: '#coach-modal-file-drop', on: 'top' },
        title: 'Paso 3 — Subir archivo',
        text: 'Arrastra un archivo PDF (máx. 50 MB) o haz clic para seleccionarlo desde tu equipo.',
      },
      {
        attachTo: { element: '#coach-sse-progress', on: 'top' },
        title: 'Paso 4 — Progreso en tiempo real',
        text: 'Observa el proceso en vivo: recepción → hash SHA-256 → almacenamiento Azure → registro en Fabric.',
      },
      {
        attachTo: { element: '#coach-syllabus-table', on: 'top' },
        title: 'Resultado esperado',
        text: 'El sílabo aparece en la tabla con un <strong>Transaction ID</strong> y el hash SHA-256 de 64 caracteres.',
      },
    ],
  },
  {
    id: 'TC-02',
    title: 'Flujo de Aprobación',
    description: 'Aprueba un sílabo y cambia su estado a "Validado".',
    targetPath: '/gestion/silabos',
    icon: 'ri-checkbox-circle-line',
    color: '#10b981',
    steps: [
      {
        title: 'TC-02 — Flujo de Aprobación',
        text: 'Los sílabos pasan por un proceso de aprobación. Solo usuarios autorizados pueden validar documentos.',
      },
      {
        attachTo: { element: '#coach-syllabus-table', on: 'top' },
        title: 'Paso 1 — Lista de sílabos',
        text: 'Identifica un sílabo con estado <strong>Creado</strong> o <strong>Actualizado</strong> en la tabla.',
      },
      {
        attachTo: { element: '.coach-approve-btn', on: 'left' },
        title: 'Paso 2 — Botón Aprobar',
        text: 'Haz clic en el ícono ☑ (botón amarillo). El estado cambiará a <strong>"Validado"</strong> y el botón desaparecerá.',
      },
    ],
  },
  {
    id: 'TC-03',
    title: 'Registro en Blockchain',
    description: 'Verifica que la transacción y metadatos estén en Hyperledger Fabric.',
    targetPath: '/core/blockchain',
    icon: 'ri-links-line',
    color: '#6366f1',
    steps: [
      {
        title: 'TC-03 — Registro en Blockchain',
        text: 'Aquí puedes auditar el historial completo de todos los sílabos registrados en Hyperledger Fabric.',
      },
      {
        attachTo: { element: '#coach-blockchain-search', on: 'bottom' },
        title: 'Paso 1 — Buscar curso',
        text: 'Escribe el nombre o código del curso para filtrar sus sílabos registrados en blockchain.',
      },
      {
        attachTo: { element: '#coach-blockchain-list', on: 'right' },
        title: 'Paso 2 — Seleccionar curso',
        text: 'Haz clic en el curso para ver su historial completo de transacciones en Fabric.',
      },
      {
        attachTo: { element: '#coach-blockchain-history', on: 'top' },
        title: 'Historial de transacciones',
        text: 'Cada entrada muestra: Transaction ID, acción (CREATION/UPDATE), timestamp, y actor. Estado debe ser <strong>"Inmutable"</strong>.',
      },
    ],
  },
  {
    id: 'TC-04',
    title: 'Verificación de Integridad',
    description: 'Comprueba que el hash del archivo coincide con blockchain.',
    targetPath: '/gestion/silabos',
    icon: 'ri-shield-check-line',
    color: '#8b5cf6',
    steps: [
      {
        title: 'TC-04 — Verificación de Integridad',
        text: 'El sistema compara el hash SHA-256 almacenado en la base de datos con el registrado en Hyperledger Fabric.',
      },
      {
        attachTo: { element: '.coach-verify-btn', on: 'left' },
        title: 'Botón Verificar Integridad',
        text: 'Haz clic en el ícono de escudo (botón morado). Si el hash coincide, verás una confirmación verde. Si fue alterado, aparece una alerta.',
      },
    ],
  },
  {
    id: 'TC-05',
    title: 'Acceso No Autorizado',
    description: 'El sistema rechaza acciones sin autenticación válida.',
    targetPath: '/gestion/silabos',
    icon: 'ri-shield-cross-line',
    color: '#ef4444',
    steps: [
      {
        title: 'TC-05 — Seguridad y Acceso',
        text: 'SilaDocs protege todos los endpoints con JWT. Sin un token válido, el sistema rechaza la petición con error 401.',
      },
      {
        title: 'Prueba de acceso sin sesión',
        text: 'Abre una ventana de incógnito e intenta acceder a <code>/gestion/silabos</code>. El sistema te redirigirá automáticamente al login.',
      },
      {
        title: 'Prueba de API sin token',
        text: `Ejecuta en consola del navegador (F12):<br/><pre style="font-size:11px;background:#1e1e1e;color:#4ec9b0;padding:8px;border-radius:4px">fetch('/api/syllabi/1/approve', {
  method: 'PATCH'
}).then(r => console.log(r.status))</pre>Debe retornar <strong>401</strong>.`,
      },
    ],
  },
  {
    id: 'TC-06',
    title: 'Detección de Hash Duplicado',
    description: 'Subir el mismo archivo dos veces no genera nueva transacción.',
    targetPath: '/gestion/silabos',
    icon: 'ri-file-copy-line',
    color: '#f59e0b',
    steps: [
      {
        title: 'TC-06 — Deduplicación de Archivos',
        text: 'Si subes el mismo archivo (mismo contenido) para el mismo curso, el sistema detecta que el hash es idéntico y no genera una nueva transacción en Fabric.',
      },
      {
        attachTo: { element: '#coach-btn-nuevo-silabo', on: 'bottom' },
        title: 'Paso 1 — Primera carga',
        text: 'Sube un archivo PDF para un curso específico. Anota el Transaction ID generado.',
      },
      {
        attachTo: { element: '#coach-sse-progress', on: 'top' },
        title: 'Paso 2 — Segunda carga del mismo archivo',
        text: 'Repite el proceso con <strong>el mismo curso y el mismo archivo</strong>. El sistema debe responder con <strong>"Sin cambios detectados"</strong> sin generar nuevo TxID.',
      },
    ],
  },
  {
    id: 'TC-07',
    title: 'Validación de Formato',
    description: 'Archivos inválidos son rechazados con mensaje de error.',
    targetPath: '/gestion/silabos',
    icon: 'ri-file-forbid-line',
    color: '#ec4899',
    steps: [
      {
        title: 'TC-07 — Validación de Archivos',
        text: 'El sistema valida los archivos antes de enviarlos al servidor. Archivos vacíos, muy grandes o sin curso asignado son rechazados instantáneamente.',
      },
      {
        attachTo: { element: '#coach-modal-file-drop', on: 'top' },
        title: 'Prueba A — Archivo mayor a 50 MB',
        text: 'Intenta subir un archivo mayor a 50 MB. Debe mostrar el error: <em>"El archivo supera el tamaño máximo de 50 MB"</em>.',
      },
      {
        title: 'Prueba B — Sin curso seleccionado',
        text: 'Abre el modal, sube un archivo pero no selecciones ningún curso. Al hacer clic en el botón de registro, debe mostrar: <em>"Seleccione un curso"</em>.',
      },
    ],
  },
  {
    id: 'TC-08',
    title: 'Incremento de Versión',
    description: 'Re-cargar un sílabo actualizado genera una nueva versión.',
    targetPath: '/gestion/silabos',
    icon: 'ri-git-branch-line',
    color: '#14b8a6',
    steps: [
      {
        title: 'TC-08 — Versionamiento de Sílabos',
        text: 'Cuando subes un archivo diferente para el mismo curso, el sistema registra una nueva versión con un nuevo Transaction ID en Fabric.',
      },
      {
        attachTo: { element: '#coach-btn-nuevo-silabo', on: 'bottom' },
        title: 'Paso 1 — Versión 1',
        text: 'Sube un primer archivo PDF para un curso. Anota el Transaction ID.',
      },
      {
        attachTo: { element: '#coach-btn-nuevo-silabo', on: 'bottom' },
        title: 'Paso 2 — Versión 2 (archivo diferente)',
        text: 'Repite el proceso para el <strong>mismo curso</strong> pero con un <strong>archivo diferente</strong>. Se generará un nuevo TxID y la versión interna se incrementará.',
      },
    ],
  },
  {
    id: 'TC-09',
    title: 'URL de Descarga Segura',
    description: 'Genera una URL temporal SAS para descargar el archivo.',
    targetPath: '/gestion/silabos',
    icon: 'ri-download-cloud-line',
    color: '#0ea5e9',
    steps: [
      {
        title: 'TC-09 — Descarga con URL SAS',
        text: 'SilaDocs genera URLs temporales firmadas (Azure SAS) para descargar documentos de forma segura. La URL tiene una expiración corta.',
      },
      {
        attachTo: { element: '.coach-download-btn', on: 'left' },
        title: 'Botón de descarga',
        text: 'Haz clic en el ícono de descarga (verde). El sistema solicita al backend una URL SAS y el navegador inicia la descarga automáticamente.',
      },
      {
        title: 'Resultado esperado',
        text: 'El archivo PDF se descarga correctamente. La notificación muestra <strong>"Descarga iniciada"</strong>. La URL contiene los parámetros <code>sv=</code> y <code>sig=</code> de Azure.',
      },
    ],
  },
  {
    id: 'TC-10',
    title: 'Health Check Blockchain',
    description: 'Verifica la conectividad con Hyperledger Fabric.',
    targetPath: '/core/blockchain',
    icon: 'ri-heart-pulse-line',
    color: '#f97316',
    steps: [
      {
        title: 'TC-10 — Estado de Blockchain',
        text: 'Esta página consulta el estado de Hyperledger Fabric. Si está disponible, carga los registros reales. En modo mock, muestra datos simulados.',
      },
      {
        attachTo: { element: '#coach-blockchain-list', on: 'right' },
        title: 'Verificación visual',
        text: 'Si la lista carga correctamente, confirma que la conexión con Fabric (o modo mock) está activa y respondiendo.',
      },
      {
        title: 'Verificación vía API',
        text: `Accede directamente al endpoint:<br/><pre style="font-size:11px;background:#1e1e1e;color:#4ec9b0;padding:8px;border-radius:4px">GET /api/health/fabric
GET /api/actuator/health</pre>Respuesta esperada: <code>{"status": "UP"}</code>`,
      },
    ],
  },
];

export default function ProductOnboarding() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const tourRef = useRef<ShepherdTour | null>(null);

  useEffect(() => {
    if (!pendingId) return;
    const mod = MODULES.find(m => m.id === pendingId);
    if (!mod) return;
    if (pathname === mod.targetPath) {
      const t = setTimeout(() => { startTour(pendingId); setPendingId(null); }, 800);
      return () => clearTimeout(t);
    }
  }, [pathname, pendingId]);

  const startTour = useCallback(async (id: string) => {
    const mod = MODULES.find(m => m.id === id);
    if (!mod) return;
    if (tourRef.current) { try { tourRef.current.complete(); } catch { /* ignore */ } }

    const Shepherd = (await import('shepherd.js')).default;
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'siladocs-tour-step',
        scrollTo: { behavior: 'smooth', block: 'center' },
        cancelIcon: { enabled: true },
        modalOverlayOpeningRadius: 8,
        modalOverlayOpeningPadding: 6,
      },
    });

    mod.steps.forEach((step, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === mod.steps.length - 1;
      const buttons: any[] = [];
      if (!isFirst) buttons.push({ text: '← Anterior', action: () => tour.back(), classes: 'btn btn-sm btn-outline-secondary' });
      if (!isLast) buttons.push({ text: 'Siguiente →', action: () => tour.next(), classes: 'btn btn-sm btn-primary' });
      if (isLast) buttons.push({ text: 'Finalizar', action: () => tour.complete(), classes: 'btn btn-sm btn-success' });
      buttons.push({ text: 'Salir', action: () => tour.cancel(), classes: 'btn btn-sm btn-outline-danger' });

      const cfg: any = { id: `${id}-${idx}`, title: step.title, text: step.text, buttons };
      if (step.attachTo && document.querySelector(step.attachTo.element)) {
        cfg.attachTo = step.attachTo;
      }
      tour.addStep(cfg);
    });

    tour.on('complete', () => { setActiveId(null); tourRef.current = null; });
    tour.on('cancel', () => { setActiveId(null); tourRef.current = null; });
    tourRef.current = tour;
    setActiveId(id);
    tour.start();
  }, []);

  const handleStart = useCallback((id: string) => {
    const mod = MODULES.find(m => m.id === id);
    if (!mod) return;
    if (pathname !== mod.targetPath) {
      setPendingId(id);
      router.push(mod.targetPath);
    } else {
      startTour(id);
    }
  }, [pathname, router, startTour]);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            background: '#3b82f6',
            color: '#fff', border: 'none', borderRadius: '50%',
            width: 52, height: 52, fontSize: 20, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title="Guía de casos de prueba"
        >
          <i className="ri-route-line" />
        </button>
      )}

      {open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9998,
          width: minimized ? 220 : 360,
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '1px solid #e5e7eb',
          fontFamily: 'system-ui, sans-serif',
          overflow: 'hidden',
          transition: 'width 0.25s',
        }}>

          {/* Header */}
          <div
            onClick={() => setMinimized(m => !m)}
            style={{
              background: '#1e293b',
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ri-route-line" style={{ color: '#fff', fontSize: 16 }} />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
                Casos de Prueba — SilaDocs
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{
                background: '#3b82f6', color: '#fff',
                borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600,
              }}>
                10 TCs
              </span>
              <button
                onClick={e => { e.stopPropagation(); setOpen(false); }}
                style={{
                  background: '#334155', border: 'none', color: '#fff',
                  borderRadius: 5, width: 22, height: 22, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                }}
              >×</button>
            </div>
          </div>

          {!minimized && (
            <>
              <div style={{ maxHeight: 440, overflowY: 'auto' }}>
                {MODULES.map(mod => (
                  <div key={mod.id} style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid #f1f5f9',
                    background: activeId === mod.id ? '#eff6ff' : '#fff',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                        background: mod.color + '1a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <i className={mod.icon} style={{ color: mod.color, fontSize: 16 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{
                            background: mod.color, color: '#fff',
                            borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700,
                          }}>
                            {mod.id}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
                            {mod.title}
                          </span>
                        </div>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 8px', lineHeight: 1.4 }}>
                          {mod.description}
                        </p>
                        <button
                          onClick={() => handleStart(mod.id)}
                          disabled={activeId === mod.id}
                          style={{
                            background: activeId === mod.id ? '#e2e8f0' : mod.color,
                            color: activeId === mod.id ? '#94a3b8' : '#fff',
                            border: 'none', borderRadius: 6,
                            padding: '5px 10px', fontSize: 11, fontWeight: 600,
                            cursor: activeId === mod.id ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          <i className={activeId === mod.id ? 'ri-loader-line' : 'ri-play-fill'} />
                          {activeId === mod.id ? 'Activo...' : 'Iniciar guía'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                padding: '8px 14px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                fontSize: 11, color: '#94a3b8', textAlign: 'center',
              }}>
                Haz clic en "Iniciar guía" para ver el recorrido interactivo
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        .siladocs-tour-step {
          max-width: 400px !important;
          font-family: system-ui, sans-serif !important;
        }
        .siladocs-tour-step .shepherd-header {
          background: #1e293b !important;
          border-radius: 10px 10px 0 0 !important;
          padding: 12px 16px !important;
        }
        .siladocs-tour-step .shepherd-title {
          color: #fff !important;
          font-size: 14px !important;
          font-weight: 700 !important;
        }
        .siladocs-tour-step .shepherd-cancel-icon {
          color: rgba(255,255,255,0.7) !important;
        }
        .siladocs-tour-step .shepherd-text {
          padding: 14px 16px !important;
          font-size: 13px !important;
          line-height: 1.65 !important;
          color: #374151 !important;
        }
        .siladocs-tour-step .shepherd-text pre {
          margin: 8px 0 0 !important;
          border-radius: 6px !important;
          overflow-x: auto !important;
        }
        .siladocs-tour-step .shepherd-footer {
          padding: 8px 16px 12px !important;
          gap: 6px !important;
          flex-wrap: wrap !important;
        }
        .siladocs-tour-step .shepherd-content {
          border-radius: 10px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
          border: 1px solid #e2e8f0 !important;
        }
      `}</style>
    </>
  );
}
