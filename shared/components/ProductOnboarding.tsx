'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type ShepherdTour = any;

interface TestCase {
  id: string;
  number: string;
  title: string;
  description: string;
  targetPath: string;
  steps: string[];
}

const TEST_CASES: TestCase[] = [
  {
    id: 'TC-01',
    number: '01',
    title: 'Registro de Sílabo',
    description: 'Carga un PDF y regístralo con hash SHA-256 en blockchain.',
    targetPath: '/gestion/silabos',
    steps: [
      'Haz clic en "Subir Sílabo"',
      'Selecciona un curso del menú',
      'Arrastra o selecciona un archivo PDF',
      'El sistema calcula el hash SHA-256',
      'Se sube a Azure Blob Storage',
      'Se registra en Hyperledger Fabric',
      'Recibirás un Transaction ID único',
    ],
  },
  {
    id: 'TC-02',
    number: '02',
    title: 'Flujo de Aprobación',
    description: 'Aprueba un sílabo y cambia su estado a "Validado".',
    targetPath: '/gestion/silabos',
    steps: [
      'Localiza un sílabo con estado "Creado"',
      'Haz clic en el botón Aprobar (ícono ☑)',
      'Confirma la acción en el diálogo',
      'El estado cambia a "Validado"',
      'El botón de aprobación desaparece',
      'Se registra la acción en el ledger',
    ],
  },
  {
    id: 'TC-03',
    number: '03',
    title: 'Registro en Blockchain',
    description: 'Verifica que la transacción y metadatos estén en Hyperledger Fabric.',
    targetPath: '/core/blockchain',
    steps: [
      'Navega a Blockchain → Trazabilidad',
      'Busca el curso en el campo de búsqueda',
      'Selecciona el curso de la lista',
      'Visualiza el historial de transacciones',
      'Verifica Transaction ID, acción y timestamp',
      'Confirma que el estado es "Inmutable"',
      'Revisa el email del actor que registró',
    ],
  },
  {
    id: 'TC-04',
    number: '04',
    title: 'Verificación de Integridad',
    description: 'Comprueba que el hash del archivo coincide con blockchain.',
    targetPath: '/gestion/silabos',
    steps: [
      'Localiza un sílabo en la tabla',
      'Haz clic en el botón Verificar (ícono 🛡)',
      'El sistema compara el hash almacenado',
      'Con el registrado en Hyperledger Fabric',
      'Si coinciden: notificación verde de éxito',
      'Si fue alterado: alerta naranja',
      'Se muestra el Transaction ID en la confirmación',
    ],
  },
  {
    id: 'TC-05',
    number: '05',
    title: 'Acceso No Autorizado',
    description: 'El sistema rechaza acciones sin autenticación válida.',
    targetPath: '/gestion/silabos',
    steps: [
      'Abre una ventana de incógnito',
      'Intenta acceder a /gestion/silabos',
      'El sistema redirige automáticamente al login',
      'Sin token: no se cargan datos protegidos',
      'API sin Authorization: error 401',
      'Las credenciales se validan en cada petición',
      'Los endpoints de modificación requieren JWT válido',
    ],
  },
  {
    id: 'TC-06',
    number: '06',
    title: 'Detección de Hash Duplicado',
    description: 'Subir el mismo archivo dos veces no genera nueva transacción.',
    targetPath: '/gestion/silabos',
    steps: [
      'Sube un archivo PDF para un curso',
      'Espera a que se complete el registro',
      'Anota el Transaction ID generado',
      'Abre nuevamente "Subir Sílabo"',
      'Selecciona el mismo curso',
      'Sube exactamente el mismo archivo',
      'El sistema mostrará "Sin cambios detectados"',
      'No se genera un nuevo Transaction ID',
    ],
  },
  {
    id: 'TC-07',
    number: '07',
    title: 'Validación de Formato',
    description: 'Archivos inválidos son rechazados con mensaje de error.',
    targetPath: '/gestion/silabos',
    steps: [
      'Intenta subir un archivo mayor a 50 MB',
      'El sistema muestra error inmediatamente',
      'Intenta subir sin seleccionar curso',
      'Recibe validación "Seleccione un curso"',
      'Solo se aceptan: PDF, DOC, DOCX',
      'Archivos vacíos son rechazados',
      'Ningún error debe llegar al servidor',
    ],
  },
  {
    id: 'TC-08',
    number: '08',
    title: 'Incremento de Versión',
    description: 'Re-cargar un sílabo actualizado genera una nueva versión.',
    targetPath: '/gestion/silabos',
    steps: [
      'Sube un archivo PDF para un curso (v1)',
      'Anota el Transaction ID generado',
      'Abre nuevamente "Subir Sílabo"',
      'Selecciona el mismo curso',
      'Sube un archivo diferente (v2)',
      'Se genera un nuevo Transaction ID diferente',
      'El sistema registra versión 2 en Fabric',
      'Acción registrada como "UPDATE"',
    ],
  },
  {
    id: 'TC-09',
    number: '09',
    title: 'URL de Descarga Segura',
    description: 'Genera una URL temporal SAS para descargar el archivo.',
    targetPath: '/gestion/silabos',
    steps: [
      'Localiza un sílabo en la tabla',
      'Haz clic en el botón Descargar (ícono ⬇)',
      'El backend genera una URL SAS de Azure',
      'La URL tiene una expiración corta',
      'El navegador inicia la descarga automáticamente',
      'El archivo PDF se abre/descarga correctamente',
      'La URL contiene parámetros sv= y sig=',
    ],
  },
  {
    id: 'TC-10',
    number: '10',
    title: 'Health Check Blockchain',
    description: 'Verifica la conectividad con Hyperledger Fabric.',
    targetPath: '/core/blockchain',
    steps: [
      'Navega a Blockchain → Trazabilidad',
      'La página carga la lista de cursos',
      'Si Fabric está disponible: datos reales',
      'Si está en modo mock: datos simulados',
      'Verifica que la lista responde correctamente',
      'Accede a GET /api/health/fabric',
      'Respuesta esperada: {"status": "UP"}',
    ],
  },
];

export default function ProductOnboarding() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [selectedTC, setSelectedTC] = useState<TestCase | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const tourRef = useRef<ShepherdTour | null>(null);

  useEffect(() => {
    if (!pendingId) return;
    const tc = TEST_CASES.find(t => t.id === pendingId);
    if (!tc) return;
    if (pathname === tc.targetPath) {
      const t = setTimeout(() => { startTour(pendingId); setPendingId(null); }, 800);
      return () => clearTimeout(t);
    }
  }, [pathname, pendingId]);

  const startTour = useCallback(async (id: string) => {
    const tc = TEST_CASES.find(t => t.id === id);
    if (!tc) return;
    if (tourRef.current) { try { tourRef.current.complete(); } catch { /* ignore */ } }

    const Shepherd = (await import('shepherd.js')).default;
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'siladocs-bw-tour',
        scrollTo: { behavior: 'smooth', block: 'center' },
        cancelIcon: { enabled: true },
        modalOverlayOpeningRadius: 8,
        modalOverlayOpeningPadding: 6,
      },
    });

    tc.steps.forEach((text, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === tc.steps.length - 1;
      const buttons: any[] = [];
      if (!isFirst) buttons.push({ text: '← Atrás', action: () => tour.back(), classes: 'btn btn-sm btn-outline-secondary' });
      if (!isLast) buttons.push({ text: 'Siguiente →', action: () => tour.next(), classes: 'btn btn-sm btn-dark' });
      if (isLast) buttons.push({ text: '✓ Completar', action: () => tour.complete(), classes: 'btn btn-sm btn-dark' });
      buttons.push({ text: 'Salir', action: () => tour.cancel(), classes: 'btn btn-sm btn-outline-secondary' });

      tour.addStep({
        id: `${id}-${idx}`,
        title: `${tc.id} — Paso ${idx + 1}`,
        text: text,
        buttons,
      });
    });

    tour.on('complete', () => { setActiveId(null); setSelectedTC(null); tourRef.current = null; });
    tour.on('cancel', () => { setActiveId(null); tourRef.current = null; });
    tourRef.current = tour;
    setActiveId(id);
    tour.start();
  }, []);

  const handleStart = useCallback((id: string) => {
    const tc = TEST_CASES.find(t => t.id === id);
    if (!tc) return;
    if (pathname !== tc.targetPath) {
      setPendingId(id);
      router.push(tc.targetPath);
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
            background: '#000',
            color: '#fff', border: 'none', borderRadius: '6px',
            padding: '10px 14px', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            fontSize: 12, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
          title="Casos de prueba"
        >
          <i className="ri-list-check-2" style={{ fontSize: 14 }} />
          <span>Pruebas</span>
        </button>
      )}

      {open && !selectedTC && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9998,
          width: 340,
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          border: '1px solid #e5e7eb',
          fontFamily: 'system-ui, sans-serif',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ background: '#000', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>10 Casos de Prueba</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none', border: 'none', color: '#fff',
                cursor: 'pointer', fontSize: 16, padding: 0,
              }}
            >×</button>
          </div>

          {/* List */}
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {TEST_CASES.map((tc, idx) => (
              <button
                key={tc.id}
                onClick={() => setSelectedTC(tc)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 14px',
                  borderBottom: '1px solid #e5e7eb',
                  background: idx % 2 === 0 ? '#f9f9f9' : '#fff',
                  border: 'none', cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onHover={{}}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    background: '#000', color: '#fff',
                    width: 28, height: 28, borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>
                    {tc.number}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: '#000', marginBottom: 2 }}>
                      {tc.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#666', lineHeight: 1.4 }}>
                      {tc.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTC && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9998,
          width: 360,
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          border: '1px solid #e5e7eb',
          fontFamily: 'system-ui, sans-serif',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ background: '#000', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#999', fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
                TC-{selectedTC.number}
              </div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                {selectedTC.title}
              </div>
            </div>
            <button
              onClick={() => setSelectedTC(null)}
              style={{
                background: 'none', border: 'none', color: '#fff',
                cursor: 'pointer', fontSize: 16, padding: 0, marginTop: -4,
              }}
            >←</button>
          </div>

          {/* Content */}
          <div style={{ padding: '12px 16px' }}>
            <p style={{ fontSize: 12, color: '#666', marginBottom: 12, lineHeight: 1.5 }}>
              {selectedTC.description}
            </p>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#000', marginBottom: 8, letterSpacing: 0.5 }}>
                PASOS A SEGUIR
              </div>
              <ol style={{ margin: 0, paddingLeft: 16, fontSize: 11, lineHeight: 1.7, color: '#555' }}>
                {selectedTC.steps.map((step, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{step}</li>
                ))}
              </ol>
            </div>

            <button
              onClick={() => handleStart(selectedTC.id)}
              disabled={activeId === selectedTC.id}
              style={{
                width: '100%',
                background: activeId === selectedTC.id ? '#e5e5e5' : '#000',
                color: activeId === selectedTC.id ? '#999' : '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '10px',
                fontSize: 12,
                fontWeight: 600,
                cursor: activeId === selectedTC.id ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <i className={activeId === selectedTC.id ? 'ri-loader-line' : 'ri-play-fill'} />
              {activeId === selectedTC.id ? 'En progreso...' : 'Iniciar tour interactivo'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .siladocs-bw-tour {
          max-width: 420px !important;
          font-family: system-ui, sans-serif !important;
        }
        .siladocs-bw-tour .shepherd-header {
          background: #000 !important;
          border-radius: 8px 8px 0 0 !important;
          padding: 12px 16px !important;
        }
        .siladocs-bw-tour .shepherd-title {
          color: #fff !important;
          font-size: 13px !important;
          font-weight: 700 !important;
        }
        .siladocs-bw-tour .shepherd-cancel-icon {
          color: rgba(255,255,255,0.6) !important;
        }
        .siladocs-bw-tour .shepherd-text {
          padding: 12px 16px !important;
          font-size: 12px !important;
          line-height: 1.6 !important;
          color: #555 !important;
        }
        .siladocs-bw-tour .shepherd-footer {
          padding: 8px 16px 12px !important;
          gap: 6px !important;
          flex-wrap: wrap !important;
        }
        .siladocs-bw-tour .shepherd-content {
          border-radius: 8px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
          border: 1px solid #e5e7eb !important;
        }
        .siladocs-bw-tour .btn-dark {
          background: #000 !important;
          color: #fff !important;
          border: none !important;
        }
      `}</style>
    </>
  );
}
