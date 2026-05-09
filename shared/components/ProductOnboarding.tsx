'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type OnboardingStatus = 'not_started' | 'in_progress' | 'completed';
type ShepherdTour = any;

const STORAGE_KEY = 'siladocs_onboarding_status';

interface OnboardingModule {
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
}

const ONBOARDING_MODULES: OnboardingModule[] = [
  {
    id: 'dashboard',
    title: 'Dashboard — Inicio',
    description: 'Conoce tu espacio principal con métricas de créditos y certificados.',
    targetPath: '/dashboards/general',
    icon: 'ri-dashboard-2-line',
    steps: [
      {
        title: '📊 Bienvenido a SilaDocs',
        text: 'Esta es tu página principal. Aquí verás un resumen de créditos de emisión y certificados emitidos.',
      },
      {
        title: 'Métricas principales',
        text: 'En el dashboard puedes ver estadísticas de tu institución, cursos activos y documentos en blockchain.',
      },
      {
        title: '✅ Dashboard completado',
        text: 'Ahora vamos a crear la estructura académica. Haz clic en "Siguiente" para continuar.',
      },
    ],
  },
  {
    id: 'carreras',
    title: 'Carreras — Programas Académicos',
    description: 'Define los programas de estudio (Ingeniería, Administración, etc.).',
    targetPath: '/gestion/carreras',
    icon: 'ri-graduation-cap-2-line',
    steps: [
      {
        title: '🎓 Carreras Académicas',
        text: 'Las carreras son los programas de estudio. Ejemplo: Ingeniería en Sistemas, Administración de Empresas.',
      },
      {
        title: 'Crear una carrera',
        text: 'Haz clic en "+ Nueva Carrera" para registrar un nuevo programa académico en tu institución.',
      },
      {
        title: 'Información requerida',
        text: 'Necesitarás: nombre de la carrera, código único, duración estimada, y descripción.',
      },
      {
        title: '✅ Carreras configuradas',
        text: 'Una vez tengas carreras, crearás "mallas curriculares" que organicen los semestres y cursos.',
      },
    ],
  },
  {
    id: 'mallas',
    title: 'Mallas Curriculares — Estructura de Semestres',
    description: 'Organiza los semestres y cursos dentro de cada carrera.',
    targetPath: '/gestion/mallas',
    icon: 'ri-layout-grid-line',
    steps: [
      {
        title: '📋 Mallas Curriculares',
        text: 'Una malla curricular organiza los cursos por semestres. Ejemplo: semestre 1, semestre 2, etc.',
      },
      {
        title: 'Relación carrera → malla',
        text: 'Cada malla pertenece a una carrera. Una carrera puede tener múltiples versiones de mallas.',
      },
      {
        title: '✅ Malla creada',
        text: 'Ahora agregarás cursos a esta malla para completar la estructura académica.',
      },
    ],
  },
  {
    id: 'cursos',
    title: 'Cursos — Asignaturas',
    description: 'Define las asignaturas que integran las mallas curriculares.',
    targetPath: '/gestion/cursos',
    icon: 'ri-book-open-line',
    steps: [
      {
        title: '📚 Cursos',
        text: 'Los cursos son asignaturas individuales. Ejemplo: Programación, Cálculo, Bases de Datos.',
      },
      {
        title: 'Crear un curso',
        text: 'Haz clic en "+ Nuevo Curso" para agregar una asignatura. Asigna: código, nombre, créditos, profesor.',
      },
      {
        title: 'Asociar a malla',
        text: 'Cada curso se asocia a una malla curricular y un semestre específico.',
      },
      {
        title: '✅ Cursos listos',
        text: 'Ahora cargarás los sílabos (documentos PDF) para cada curso.',
      },
    ],
  },
  {
    id: 'syllabus',
    title: 'Sílabos — Documentos en Blockchain',
    description: 'Carga sílabos de cursos con registro automático en Hyperledger Fabric.',
    targetPath: '/gestion/silabos',
    icon: 'ri-file-pdf-2-line',
    steps: [
      {
        title: '📄 Sílabos',
        text: 'Los sílabos son documentos PDF que describen el contenido y evaluación de cada curso.',
      },
      {
        title: '🔗 Blockchain Integration',
        text: 'Cuando subes un sílabo, SilaDocs calcula automáticamente un hash SHA-256 y lo registra en Hyperledger Fabric.',
      },
      {
        attachTo: { element: '#coach-btn-nuevo-silabo', on: 'bottom' },
        title: 'Subir sílabo',
        text: 'Haz clic en "Subir Sílabo". Selecciona el curso y arrastra/sube un archivo PDF o DOCX.',
      },
      {
        title: 'Proceso de registro',
        text: 'El sistema: calcula hash → sube a Azure → registra en Fabric. Recibirás un Transaction ID único.',
      },
      {
        title: 'Aprobación',
        text: 'El coordinador puede aprobar sílabos. Haz clic en el botón ☑ para cambiar estado a "Validado".',
      },
      {
        title: '✅ Sílabos verificados',
        text: 'Todos los sílabos están protegidos por blockchain. Ahora puedes auditar la trazabilidad.',
      },
    ],
  },
  {
    id: 'blockchain',
    title: 'Trazabilidad — Auditoría en Blockchain',
    description: 'Verifica y audita el historial inmutable de todos los documentos.',
    targetPath: '/core/blockchain',
    icon: 'ri-links-line',
    steps: [
      {
        title: '⛓️ Trazabilidad en Blockchain',
        text: 'Aquí puedes ver el historial completo e inmutable de todos los sílabos registrados en Hyperledger Fabric.',
      },
      {
        attachTo: { element: '#coach-blockchain-search', on: 'bottom' },
        title: 'Buscar sílabo',
        text: 'Escribe el nombre o código del curso para buscar su registro en blockchain.',
      },
      {
        attachTo: { element: '#coach-blockchain-list', on: 'right' },
        title: 'Historial de transacciones',
        text: 'Selecciona un curso para ver todas las transacciones: creación, actualizaciones, y verificaciones.',
      },
      {
        title: 'Información visible',
        text: 'Cada entrada muestra: Transaction ID, acción, timestamp, y usuario que realizó la operación.',
      },
      {
        attachTo: { element: '#coach-blockchain-history', on: 'top' },
        title: 'Verificación de integridad',
        text: 'Haz clic en "Verificar Integridad" para confirmar que el documento no ha sido alterado.',
      },
      {
        title: '✅ Onboarding completo',
        text: 'Felicidades. Ya sabes cómo usar SilaDocs. Explora la plataforma con confianza.',
      },
    ],
  },
];

export default function ProductOnboarding() {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<OnboardingStatus>('not_started');
  const [open, setOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<OnboardingModule | null>(null);
  const [pendingModuleId, setPendingModuleId] = useState<string | null>(null);
  const tourRef = useRef<ShepherdTour | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setStatus(saved as OnboardingStatus);
    } catch { /* ignore */ }
  }, []);

  const saveStatus = useCallback((newStatus: OnboardingStatus) => {
    setStatus(newStatus);
    localStorage.setItem(STORAGE_KEY, newStatus);
  }, []);

  // After navigation, start pending tour
  useEffect(() => {
    if (!pendingModuleId) return;
    const module = ONBOARDING_MODULES.find(m => m.id === pendingModuleId);
    if (!module) return;
    if (pathname === module.targetPath) {
      const timer = setTimeout(() => {
        startTourNow(pendingModuleId);
        setPendingModuleId(null);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [pathname, pendingModuleId]);

  const startTourNow = useCallback(async (moduleId: string) => {
    const module = ONBOARDING_MODULES.find(m => m.id === moduleId);
    if (!module) return;

    if (tourRef.current) {
      try { tourRef.current.complete(); } catch { /* ignore */ }
    }

    const Shepherd = (await import('shepherd.js')).default;

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'siladocs-onboarding-step',
        scrollTo: { behavior: 'smooth', block: 'center' },
        cancelIcon: { enabled: true },
        modalOverlayOpeningRadius: 8,
        modalOverlayOpeningPadding: 6,
      },
    });

    module.steps.forEach((step, idx) => {
      const isLast = idx === module.steps.length - 1;

      const buttons: any[] = [
        { text: '← Anterior', action: () => tour.back(), classes: 'btn btn-sm btn-outline-secondary' },
        isLast
          ? { text: '✅ Completar módulo', action: () => tour.complete(), classes: 'btn btn-sm btn-success' }
          : { text: 'Siguiente →', action: () => tour.next(), classes: 'btn btn-sm btn-primary' },
        { text: 'Salir', action: () => tour.cancel(), classes: 'btn btn-sm btn-outline-danger' },
      ];

      const stepConfig: any = {
        id: `${moduleId}-step-${idx}`,
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

    tour.on('complete', () => {
      if (currentModule?.id === moduleId) {
        const allCompleted = ONBOARDING_MODULES.every(m => m.id === moduleId || status === 'completed');
        if (allCompleted || moduleId === 'blockchain') {
          saveStatus('completed');
        } else {
          saveStatus('in_progress');
        }
      }
      tourRef.current = null;
    });
    tour.on('cancel', () => { tourRef.current = null; });

    tourRef.current = tour;
    setCurrentModule(module);
    tour.start();
  }, [currentModule, status, saveStatus]);

  const handleStartModule = useCallback((moduleId: string) => {
    const module = ONBOARDING_MODULES.find(m => m.id === moduleId);
    if (!module) return;

    if (pathname !== module.targetPath) {
      setPendingModuleId(moduleId);
      router.push(module.targetPath);
    } else {
      startTourNow(moduleId);
    }
  }, [pathname, router, startTourNow]);

  const completedCount = status === 'completed' ? ONBOARDING_MODULES.length : 0;

  return (
    <>
      {status !== 'completed' && !open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            background: 'linear-gradient(135deg, #3b82f6, #10b981)',
            color: '#fff', border: 'none', borderRadius: 50,
            width: 56, height: 56, fontSize: 22, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(59,130,246,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          title="Abrir guía de bienvenida"
        >
          <i className="ri-question-line" />
        </button>
      )}

      {open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9998,
          width: 380,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          border: '1px solid rgba(59,130,246,0.2)',
          fontFamily: 'system-ui, sans-serif',
          overflow: 'hidden',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #10b981)',
            padding: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ri-lightbulb-flash-line" style={{ color: '#fff', fontSize: 20 }} />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
                Guía de Bienvenida
              </span>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
              borderRadius: 6, width: 24, height: 24, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>×</button>
          </div>

          <div style={{ padding: '16px' }}>
            {status === 'completed' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
                <h5 style={{ fontWeight: 700, marginBottom: 8 }}>Onboarding completado</h5>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                  Ya dominas SilaDocs. ¡Que disfrutes usando la plataforma!
                </p>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                    color: '#fff', border: 'none', borderRadius: 8,
                    padding: '8px 16px', cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6c757d', marginBottom: 6 }}>
                    <span>Módulos completados</span>
                    <span style={{ fontWeight: 600 }}>{completedCount} / {ONBOARDING_MODULES.length}</span>
                  </div>
                  <div style={{ background: '#e5e7eb', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                    <div style={{
                      width: `${(completedCount / ONBOARDING_MODULES.length) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #3b82f6, #10b981)',
                      transition: 'width 0.4s',
                    }} />
                  </div>
                </div>

                <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                  {ONBOARDING_MODULES.map((module, idx) => (
                    <div key={module.id} style={{
                      padding: '12px', borderBottom: '1px solid #f3f4f6',
                      background: idx % 2 === 0 ? '#f9fafb' : '#fff',
                    }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                          background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(16,185,129,0.1))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <i className={module.icon} style={{ color: '#3b82f6', fontSize: 18 }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h6 style={{ fontSize: 13, fontWeight: 600, margin: 0, marginBottom: 2 }}>
                            {module.title}
                          </h6>
                          <p style={{ fontSize: 12, color: '#64748b', margin: 0, marginBottom: 8, lineHeight: 1.4 }}>
                            {module.description}
                          </p>
                          <button
                            onClick={() => handleStartModule(module.id)}
                            style={{
                              background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                              color: '#fff', border: 'none', borderRadius: 6,
                              padding: '6px 12px', fontSize: 11, cursor: 'pointer',
                              fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                            }}
                          >
                            <i className="ri-play-fill" /> Iniciar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  padding: '12px', background: '#f0f9ff',
                  borderTop: '1px solid #e0f2fe',
                  fontSize: 11, color: '#0369a1', textAlign: 'center',
                }}>
                  💡 Puedes retomar los módulos cuando quieras
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .siladocs-onboarding-step {
          max-width: 420px !important;
          font-family: system-ui, sans-serif !important;
        }
        .siladocs-onboarding-step .shepherd-header {
          background: linear-gradient(135deg, #3b82f6, #10b981) !important;
          border-radius: 12px 12px 0 0 !important;
          padding: 14px 16px !important;
        }
        .siladocs-onboarding-step .shepherd-title {
          color: #fff !important;
          font-size: 15px !important;
          font-weight: 700 !important;
        }
        .siladocs-onboarding-step .shepherd-cancel-icon {
          color: rgba(255,255,255,0.8) !important;
        }
        .siladocs-onboarding-step .shepherd-text {
          padding: 14px 16px !important;
          font-size: 13px !important;
          line-height: 1.6 !important;
          color: #374151 !important;
        }
        .siladocs-onboarding-step .shepherd-footer {
          padding: 8px 16px 14px !important;
          gap: 6px !important;
          flex-wrap: wrap !important;
        }
        .siladocs-onboarding-step .shepherd-content {
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important;
          border: 1px solid rgba(59,130,246,0.15) !important;
        }
      `}</style>
    </>
  );
}
