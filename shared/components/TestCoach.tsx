'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { safeStorage } from '@/shared/utils/safeStorage';

type TCStatus = 'pending' | 'pass' | 'fail';
type ShepherdTour = any;

const STORAGE_KEY = 'siladocs_tc_status';

interface TCDef {
  id: string;
  title: string;
  description: string;
  targetPath: string;
  icon: string;
  steps: ShepherdStep[];
}

interface ShepherdStep {
  attachTo?: { element: string; on: string };
  title: string;
  text: string;
  buttons?: { text: string; action: string }[];
  showOn?: () => boolean;
}

const TC_LIST: TCDef[] = [
  {
    id: 'TC-01',
    title: 'Registro de Sílabo',
    description: 'Subir un documento PDF y registrarlo con hash SHA-256 en blockchain.',
    targetPath: '/gestion/silabos',
    icon: 'ri-file-upload-line',
    steps: [
      {
        title: '📁 TC-01 — Registro de Sílabo',
        text: 'Este caso verifica que al subir un sílabo se genere un hash SHA-256 y se registre en Hyperledger Fabric. Estás en la página correcta.',
      },
      {
        attachTo: { element: '#coach-btn-nuevo-silabo', on: 'bottom' },
        title: 'Paso 1 — Abrir formulario',
        text: 'Haz clic en este botón para abrir el formulario de carga de un nuevo sílabo.',
      },
      {
        attachTo: { element: '#coach-modal-curso', on: 'bottom' },
        title: 'Paso 2 — Seleccionar curso',
        text: 'Selecciona el curso al que pertenece el sílabo. Cada sílabo debe estar asociado a un curso.',
      },
      {
        attachTo: { element: '#coach-modal-file-drop', on: 'top' },
        title: 'Paso 3 — Subir archivo',
        text: 'Arrastra un archivo PDF (máx. 50 MB) o haz clic para seleccionarlo. Formatos válidos: PDF, DOC, DOCX.',
      },
      {
        attachTo: { element: '#coach-modal-submit', on: 'top' },
        title: 'Paso 4 — Registrar en blockchain',
        text: 'Al hacer clic aquí, el sistema calcula el hash SHA-256 del archivo, lo sube a Azure y registra la transacción en Hyperledger Fabric.',
      },
      {
        attachTo: { element: '#coach-sse-progress', on: 'top' },
        title: 'Paso 5 — Progreso en tiempo real',
        text: 'Observa los pasos en vivo: recepción → hash → almacenamiento → Fabric → confirmación. Cada paso aparece con su estado.',
      },
      {
        attachTo: { element: '#coach-syllabus-table', on: 'top' },
        title: '✅ Resultado esperado',
        text: 'El sílabo aparece en la tabla con un <strong>Transaction ID</strong> y estado "Creado". El hash SHA-256 tiene exactamente 64 caracteres hexadecimales.',
      },
    ],
  },
  {
    id: 'TC-02',
    title: 'Flujo de Aprobación',
    description: 'Coordinador revisa y aprueba un sílabo. Estado cambia a "Validado".',
    targetPath: '/gestion/silabos',
    icon: 'ri-checkbox-circle-line',
    steps: [
      {
        title: '✅ TC-02 — Flujo de Aprobación',
        text: 'Verificaremos que al aprobar un sílabo su estado cambie correctamente a "Validado".',
      },
      {
        attachTo: { element: '#coach-syllabus-table', on: 'top' },
        title: 'Paso 1 — Lista de sílabos',
        text: 'Aquí puedes ver todos los sílabos registrados. Identifica uno con estado <strong>Creado</strong> o <strong>Actualizado</strong>.',
      },
      {
        attachTo: { element: '.coach-approve-btn', on: 'left' },
        title: 'Paso 2 — Botón Aprobar',
        text: 'Este botón amarillo con ícono ☑ aprueba el sílabo. Solo aparece para sílabos que aún no están validados. Haz clic en él.',
      },
      {
        attachTo: { element: '#coach-status-badge', on: 'right' },
        title: '✅ Resultado esperado',
        text: 'El estado debe cambiar a la etiqueta verde <strong>"Validado"</strong> y el botón de aprobación debe desaparecer de esa fila.',
      },
    ],
  },
  {
    id: 'TC-03',
    title: 'Registro en Blockchain',
    description: 'Metadata y hash del sílabo almacenados en Hyperledger Fabric.',
    targetPath: '/core/blockchain',
    icon: 'ri-links-line',
    steps: [
      {
        title: '⛓️ TC-03 — Registro en Blockchain',
        text: 'Verificaremos que la transacción en Fabric esté registrada con los metadatos correctos: hash, timestamp, actor y acción.',
      },
      {
        attachTo: { element: '#coach-blockchain-search', on: 'bottom' },
        title: 'Paso 1 — Buscar curso',
        text: 'Escribe el nombre o código del curso cuyo sílabo subiste en TC-01. El sistema buscará sus registros en blockchain.',
      },
      {
        attachTo: { element: '#coach-blockchain-list', on: 'right' },
        title: 'Paso 2 — Lista de cursos con sílabos',
        text: 'Selecciona el curso de la lista para ver su historial de transacciones registradas en Hyperledger Fabric.',
      },
      {
        attachTo: { element: '#coach-blockchain-history', on: 'top' },
        title: '✅ Resultado esperado',
        text: 'Debe aparecer al menos una entrada con: <strong>Transaction ID</strong>, <strong>Acción</strong> (CREATION/UPDATE), <strong>timestamp</strong> y <strong>email del actor</strong>. Estado: "Inmutable".',
      },
    ],
  },
  {
    id: 'TC-04',
    title: 'Verificación de Integridad',
    description: 'Comparar el hash almacenado con el registro en blockchain.',
    targetPath: '/gestion/silabos',
    icon: 'ri-shield-check-line',
    steps: [
      {
        title: '🛡️ TC-04 — Verificación de Integridad',
        text: 'Verificaremos que el hash SHA-256 del archivo coincide con el Transaction ID registrado en Fabric, garantizando integridad del documento.',
      },
      {
        attachTo: { element: '#coach-syllabus-table', on: 'top' },
        title: 'Paso 1 — Localizar sílabo',
        text: 'Busca un sílabo que tenga un <strong>Transaction ID</strong> visible en la tabla. Asegúrate de que esté registrado en blockchain.',
      },
      {
        attachTo: { element: '.coach-verify-btn', on: 'left' },
        title: 'Paso 2 — Botón Verificar Integridad',
        text: 'Haz clic en este botón morado con ícono 🛡️. El sistema compara el hash almacenado en la base de datos con el registrado en Hyperledger Fabric.',
      },
      {
        title: '✅ Resultado esperado',
        text: 'Debe aparecer una notificación verde con el mensaje: <em>"Integridad verificada ✓ Hash coincide con blockchain. TxID: doc-X-XXXX"</em>. Si el documento fue alterado, aparecería una alerta naranja.',
      },
    ],
  },
  {
    id: 'TC-05',
    title: 'Acceso No Autorizado',
    description: 'Sistema rechaza acciones sin autenticación válida.',
    targetPath: '/gestion/silabos',
    icon: 'ri-shield-cross-line',
    steps: [
      {
        title: '🔒 TC-05 — Acceso No Autorizado',
        text: 'Verificaremos que el sistema rechaza operaciones sin un token JWT válido, retornando error 401 Unauthorized.',
      },
      {
        title: 'Método de prueba',
        text: `Abre una <strong>ventana de incógnito</strong> (Ctrl+Shift+N) e intenta acceder a:<br/><code>https://siladocs-frontend.vercel.app/gestion/silabos</code><br/><br/>El sistema debe redirigirte automáticamente al login.`,
      },
      {
        title: 'Prueba vía API',
        text: `Ejecuta en consola del navegador (F12 → Console):<br/>
<pre style="font-size:11px;background:#1e1e1e;color:#4ec9b0;padding:8px;border-radius:4px">
fetch('/api/syllabi/1/approve', {
  method: 'PATCH'
}).then(r => console.log('Status:', r.status))
</pre>
<br/>Debe retornar <strong>401 o 403</strong>.`,
      },
      {
        title: '✅ Resultado esperado',
        text: 'Sin token: <strong>redirección al login</strong>.<br/>API sin Authorization header: respuesta <strong>HTTP 401 Unauthorized</strong>.<br/>El sistema no debe exponer datos ni ejecutar acciones.',
      },
    ],
  },
  {
    id: 'TC-06',
    title: 'Detección de Hash Duplicado',
    description: 'Subir el mismo archivo dos veces no genera nueva transacción.',
    targetPath: '/gestion/silabos',
    icon: 'ri-file-copy-line',
    steps: [
      {
        title: '🔁 TC-06 — Detección de Hash Duplicado',
        text: 'Verificaremos que si subes exactamente el mismo archivo (mismo contenido), el sistema detecta el duplicado y no genera una nueva transacción en Fabric.',
      },
      {
        attachTo: { element: '#coach-btn-nuevo-silabo', on: 'bottom' },
        title: 'Paso 1 — Primer upload',
        text: 'Sube un archivo PDF para un curso específico. Completa el proceso hasta ver el Transaction ID generado. <strong>Anota ese TxID</strong>.',
      },
      {
        attachTo: { element: '#coach-btn-nuevo-silabo', on: 'bottom' },
        title: 'Paso 2 — Mismo archivo, mismo curso',
        text: 'Ahora haz clic aquí nuevamente. Selecciona el <strong>mismo curso</strong> y el <strong>mismo archivo PDF exacto</strong> (mismo nombre y contenido).',
      },
      {
        attachTo: { element: '#coach-sse-progress', on: 'top' },
        title: '✅ Resultado esperado',
        text: 'La barra de progreso debe completarse rápidamente mostrando <strong>"Sin cambios detectados"</strong>. No se genera un nuevo Transaction ID. El sistema reconoció que el hash es idéntico al ya registrado.',
      },
    ],
  },
  {
    id: 'TC-07',
    title: 'Validación de Formato',
    description: 'Archivos inválidos son rechazados con mensaje de error.',
    targetPath: '/gestion/silabos',
    icon: 'ri-file-forbid-line',
    steps: [
      {
        title: '📋 TC-07 — Validación de Formato',
        text: 'Verificaremos que el sistema valida correctamente los archivos: rechaza archivos vacíos, demasiado grandes, y verifica que se seleccione un curso.',
      },
      {
        attachTo: { element: '#coach-btn-nuevo-silabo', on: 'bottom' },
        title: 'Prueba A — Sin curso seleccionado',
        text: 'Abre el formulario. <strong>No selecciones ningún curso</strong>. Intenta hacer clic en "Registrar en Blockchain". Debe mostrar el error: <em>"Debe seleccionar un curso"</em>.',
      },
      {
        attachTo: { element: '#coach-modal-file-drop', on: 'top' },
        title: 'Prueba B — Archivo mayor a 50MB',
        text: 'Intenta seleccionar un archivo mayor a 50 MB. El sistema debe rechazarlo inmediatamente con el mensaje: <em>"El archivo excede el tamaño máximo de 50 MB"</em>.',
      },
      {
        title: '✅ Resultado esperado',
        text: 'Para cada caso de error:<br/>• Sin curso → alerta de validación<br/>• Archivo vacío → error "Archivo vacío"<br/>• Archivo >50MB → rechazo instantáneo<br/><br/>Ningún error debe llegar al servidor.',
      },
    ],
  },
  {
    id: 'TC-08',
    title: 'Incremento de Versión',
    description: 'Re-cargar un sílabo incrementa el número de versión.',
    targetPath: '/gestion/silabos',
    icon: 'ri-git-branch-line',
    steps: [
      {
        title: '📈 TC-08 — Incremento de Versión',
        text: 'Verificaremos que al actualizar el sílabo de un curso (subir un archivo diferente), el sistema incrementa el número de versión y genera una nueva transacción.',
      },
      {
        attachTo: { element: '#coach-btn-nuevo-silabo', on: 'bottom' },
        title: 'Paso 1 — Upload inicial (Versión 1)',
        text: 'Sube un archivo PDF para un curso. Completa el proceso. Este será el <strong>Sílabo v1</strong>.',
      },
      {
        attachTo: { element: '#coach-btn-nuevo-silabo', on: 'bottom' },
        title: 'Paso 2 — Upload actualizado (Versión 2)',
        text: 'Haz clic aquí nuevamente. Selecciona el <strong>mismo curso</strong> pero sube un <strong>archivo diferente</strong> (diferente contenido, aunque el nombre pueda ser similar).',
      },
      {
        attachTo: { element: '#coach-syllabus-table', on: 'top' },
        title: '✅ Resultado esperado',
        text: 'Se genera un <strong>nuevo Transaction ID</strong> diferente al primero. El sílabo en la tabla muestra el archivo actualizado. El sistema registra internamente versión 2 con acción "update" en Fabric.',
      },
    ],
  },
  {
    id: 'TC-09',
    title: 'URL de Descarga',
    description: 'URL temporal autenticada (SAS) generada para acceder al archivo.',
    targetPath: '/gestion/silabos',
    icon: 'ri-download-cloud-line',
    steps: [
      {
        title: '⬇️ TC-09 — Generación de URL de Descarga',
        text: 'Verificaremos que el sistema genera una URL temporal (SAS token de Azure Blob Storage) que permite descargar el documento de forma segura.',
      },
      {
        attachTo: { element: '#coach-syllabus-table', on: 'top' },
        title: 'Paso 1 — Localizar sílabo',
        text: 'Identifica un sílabo que haya sido subido exitosamente (tiene Transaction ID visible).',
      },
      {
        attachTo: { element: '.coach-download-btn', on: 'left' },
        title: 'Paso 2 — Botón de descarga',
        text: 'Haz clic en este botón verde ⬇️. El sistema solicita al backend una URL SAS (Shared Access Signature) de Azure con tiempo de expiración.',
      },
      {
        title: '✅ Resultado esperado',
        text: 'El navegador inicia la descarga del archivo PDF original. La notificación muestra <strong>"Descarga iniciada"</strong>.<br/><br/>La URL generada internamente contiene parámetros <code>sv=</code> y <code>sig=</code> de Azure Blob Storage.',
      },
    ],
  },
  {
    id: 'TC-10',
    title: 'Health Check Blockchain',
    description: 'Verificar conectividad con Hyperledger Fabric.',
    targetPath: '/core/blockchain',
    icon: 'ri-heart-pulse-line',
    steps: [
      {
        title: '💓 TC-10 — Health Check de Blockchain',
        text: 'Verificaremos que el sistema puede conectarse con Hyperledger Fabric y reportar su estado de conectividad correctamente.',
      },
      {
        attachTo: { element: '#coach-blockchain-search', on: 'bottom' },
        title: 'Paso 1 — Página de Trazabilidad',
        text: 'Esta página consulta el estado de la blockchain. Si Fabric está disponible, cargará los registros de sílabos. Si usa modo mock, mostrará datos simulados.',
      },
      {
        attachTo: { element: '#coach-blockchain-list', on: 'right' },
        title: 'Paso 2 — Lista de registros',
        text: 'Si la lista carga correctamente con registros, confirma que la conexión con Fabric (o modo mock) está activa.',
      },
      {
        title: '✅ Verificación adicional vía API',
        text: `Puedes verificar el health check directamente:<br/>
<pre style="font-size:11px;background:#1e1e1e;color:#4ec9b0;padding:8px;border-radius:4px">GET /api/health/fabric
GET /api/actuator/health</pre>
<br/>Respuesta esperada: <code>{"status": "UP"}</code>`,
      },
    ],
  },
];

const statusConfig = {
  pending: { label: 'Pendiente', color: '#6c757d', bg: 'rgba(108,117,125,0.1)', icon: '⬜' },
  pass: { label: 'Aprobado', color: '#198754', bg: 'rgba(25,135,84,0.1)', icon: '✅' },
  fail: { label: 'Fallido', color: '#dc3545', bg: 'rgba(220,53,69,0.1)', icon: '❌' },
};

export default function TestCoach() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, TCStatus>>({});
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const [pendingTour, setPendingTour] = useState<string | null>(null);
  const tourRef = useRef<ShepherdTour | null>(null);

  // Load saved statuses
  useEffect(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEY);
      if (saved) setStatuses(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const saveStatus = useCallback((tcId: string, status: TCStatus) => {
    setStatuses(prev => {
      const next = { ...prev, [tcId]: status };
      safeStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const cycleStatus = useCallback((tcId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = statuses[tcId] || 'pending';
    const next: TCStatus = current === 'pending' ? 'pass' : current === 'pass' ? 'fail' : 'pending';
    saveStatus(tcId, next);
  }, [statuses, saveStatus]);

  // After navigation, start pending tour
  useEffect(() => {
    if (!pendingTour) return;
    const tc = TC_LIST.find(t => t.id === pendingTour);
    if (!tc) return;
    if (pathname === tc.targetPath) {
      const timer = setTimeout(() => {
        startTourNow(pendingTour);
        setPendingTour(null);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [pathname, pendingTour]);

  const startTourNow = useCallback(async (tcId: string) => {
    const tc = TC_LIST.find(t => t.id === tcId);
    if (!tc) return;

    // Destroy previous
    if (tourRef.current) {
      try { tourRef.current.complete(); } catch { /* ignore */ }
    }

    const Shepherd = (await import('shepherd.js')).default;

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'siladocs-shepherd-step',
        scrollTo: { behavior: 'smooth', block: 'center' },
        cancelIcon: { enabled: true },
        modalOverlayOpeningRadius: 8,
        modalOverlayOpeningPadding: 6,
      },
    });

    tc.steps.forEach((step, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === tc.steps.length - 1;

      const buttons: any[] = [];
      if (!isFirst) buttons.push({ text: '← Anterior', action: () => tour.back(), classes: 'btn btn-sm btn-outline-secondary' });
      if (!isLast) buttons.push({ text: 'Siguiente →', action: () => tour.next(), classes: 'btn btn-sm btn-primary' });
      if (isLast) buttons.push({
        text: '✅ Marcar aprobado', action: () => {
          saveStatus(tcId, 'pass');
          tour.complete();
        }, classes: 'btn btn-sm btn-success'
      });
      buttons.push({ text: 'Salir', action: () => tour.cancel(), classes: 'btn btn-sm btn-outline-danger' });

      const stepConfig: any = {
        id: `${tcId}-step-${idx}`,
        title: step.title,
        text: step.text,
        buttons,
      };

      if (step.attachTo) {
        const el = document.querySelector(step.attachTo.element);
        if (el) stepConfig.attachTo = step.attachTo;
      }

      tour.addStep(stepConfig);
    });

    tour.on('complete', () => { setActiveTour(null); tourRef.current = null; });
    tour.on('cancel', () => { setActiveTour(null); tourRef.current = null; });

    tourRef.current = tour;
    setActiveTour(tcId);
    tour.start();
  }, [saveStatus]);

  const handleStartTour = useCallback((tcId: string) => {
    const tc = TC_LIST.find(t => t.id === tcId);
    if (!tc) return;

    if (pathname !== tc.targetPath) {
      setPendingTour(tcId);
      router.push(tc.targetPath);
    } else {
      startTourNow(tcId);
    }
  }, [pathname, router, startTourNow]);

  const passCount = Object.values(statuses).filter(s => s === 'pass').length;
  const failCount = Object.values(statuses).filter(s => s === 'fail').length;

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', border: 'none', borderRadius: 50,
            width: 56, height: 56, fontSize: 22, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          title="Abrir panel de Casos de Prueba"
        >
          <i className="ri-test-tube-line" />
        </button>
      )}

      {/* Coach Panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9998,
          width: minimized ? 220 : 360,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          border: '1px solid rgba(99,102,241,0.2)',
          fontFamily: 'system-ui, sans-serif',
          overflow: 'hidden',
          transition: 'width 0.3s',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer',
          }} onClick={() => setMinimized(m => !m)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ri-test-tube-line" style={{ color: '#fff', fontSize: 18 }} />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                Guía de Casos de Prueba
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{
                background: 'rgba(255,255,255,0.2)', color: '#fff',
                borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600,
              }}>
                {passCount}/10
              </span>
              <button onClick={(e) => { e.stopPropagation(); setOpen(false); }} style={{
                background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
                borderRadius: 6, width: 24, height: 24, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>×</button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Progress bar */}
              <div style={{ padding: '10px 16px 4px', background: '#f8f9fa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6c757d', marginBottom: 4 }}>
                  <span>✅ {passCount} aprobados</span>
                  <span>❌ {failCount} fallidos</span>
                  <span>⬜ {10 - passCount - failCount} pendientes</span>
                </div>
                <div style={{ background: '#e9ecef', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{
                    width: `${passCount * 10}%`, height: '100%',
                    background: 'linear-gradient(90deg, #198754, #20c997)',
                    transition: 'width 0.4s',
                  }} />
                </div>
              </div>

              {/* TC List */}
              <div style={{ maxHeight: 420, overflowY: 'auto', padding: '8px 0' }}>
                {TC_LIST.map(tc => {
                  const status = statuses[tc.id] || 'pending';
                  const cfg = statusConfig[status];
                  const isActive = activeTour === tc.id;

                  return (
                    <div key={tc.id} style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      background: isActive ? 'rgba(99,102,241,0.05)' : 'transparent',
                      transition: 'background 0.2s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        {/* Icon */}
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: cfg.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16,
                        }}>
                          <i className={tc.icon} style={{ color: cfg.color }} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', letterSpacing: 0.5 }}>
                              {tc.id}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', flex: 1 }}>
                              {tc.title}
                            </span>
                          </div>
                          <p style={{ fontSize: 11, color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                            {tc.description}
                          </p>
                          <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                            {/* Start tour button */}
                            <button
                              onClick={() => handleStartTour(tc.id)}
                              disabled={isActive}
                              style={{
                                background: isActive ? '#e9ecef' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: isActive ? '#6c757d' : '#fff',
                                border: 'none', borderRadius: 6,
                                padding: '4px 10px', fontSize: 11,
                                cursor: isActive ? 'not-allowed' : 'pointer',
                                fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                              }}
                            >
                              <i className={isActive ? 'ri-loader-line' : 'ri-play-fill'} />
                              {isActive ? 'Activo' : 'Iniciar guía'}
                            </button>

                            {/* Status badge - clickable to cycle */}
                            <button
                              onClick={(e) => cycleStatus(tc.id, e)}
                              title="Haz clic para cambiar el estado"
                              style={{
                                background: cfg.bg, color: cfg.color,
                                border: `1px solid ${cfg.color}30`,
                                borderRadius: 6, padding: '4px 8px',
                                fontSize: 10, cursor: 'pointer', fontWeight: 600,
                                display: 'flex', alignItems: 'center', gap: 3,
                              }}
                            >
                              {cfg.icon} {cfg.label}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div style={{
                padding: '8px 16px', background: '#f8f9fa',
                borderTop: '1px solid #e9ecef',
                fontSize: 10, color: '#94a3b8', textAlign: 'center',
              }}>
                Haz clic en el estado para marcarlo ✅ / ❌ / ⬜
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        .siladocs-shepherd-step {
          max-width: 400px !important;
          font-family: system-ui, sans-serif !important;
        }
        .siladocs-shepherd-step .shepherd-header {
          background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
          border-radius: 12px 12px 0 0 !important;
          padding: 12px 16px !important;
        }
        .siladocs-shepherd-step .shepherd-title {
          color: #fff !important;
          font-size: 14px !important;
          font-weight: 700 !important;
        }
        .siladocs-shepherd-step .shepherd-cancel-icon {
          color: rgba(255,255,255,0.8) !important;
        }
        .siladocs-shepherd-step .shepherd-text {
          padding: 14px 16px !important;
          font-size: 13px !important;
          line-height: 1.6 !important;
          color: #374151 !important;
        }
        .siladocs-shepherd-step .shepherd-text pre {
          margin: 8px 0 0 !important;
          border-radius: 6px !important;
          overflow-x: auto !important;
        }
        .siladocs-shepherd-step .shepherd-footer {
          padding: 8px 16px 14px !important;
          gap: 6px !important;
          flex-wrap: wrap !important;
        }
        .siladocs-shepherd-step .shepherd-content {
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important;
          border: 1px solid rgba(99,102,241,0.15) !important;
        }
        .shepherd-modal-overlay-container.shepherd-has-active-tour {
          opacity: 1 !important;
        }
      `}</style>
    </>
  );
}
