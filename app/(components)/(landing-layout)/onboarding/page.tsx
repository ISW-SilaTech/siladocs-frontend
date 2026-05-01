"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Card, Row, Col, Form } from 'react-bootstrap'

interface PlanInfo {
  key: string
  name: string
  price: string
  quota: string
}

const PLANS: Record<string, PlanInfo> = {
  basico:  { key: 'basico',  name: 'Institución Pequeña', price: '$15/mes',  quota: '500 cert/año'      },
  pro:     { key: 'pro',     name: 'Gran Universidad',    price: '$45/mes',  quota: '5,000 cert/año'    },
  empresa: { key: 'empresa', name: 'Institución Premium', price: '$99/mes',  quota: 'Ilimitado'         },
}

const STEPS = ['Plan & Cuota', 'Acuerdo SLA', 'Aprovisionamiento', 'Credenciales']

const PROVISIONING_STEPS = [
  { label: 'Creando instancia en base de datos',   icon: 'ti-database'     },
  { label: 'Reservando espacio en IPFS',           icon: 'ti-cloud-upload' },
  { label: 'Configurando wallets blockchain',      icon: 'ti-link'         },
  { label: 'Verificando configuración final',      icon: 'ti-shield-check' },
]

const POPULATION_TIERS = [
  { value: 'tier1', label: 'Menos de 1,000 estudiantes',    quota: 'hasta 300 cert/año'   },
  { value: 'tier2', label: '1,000 – 5,000 estudiantes',     quota: 'hasta 1,500 cert/año' },
  { value: 'tier3', label: '5,000 – 15,000 estudiantes',    quota: 'hasta 5,000 cert/año' },
  { value: 'tier4', label: 'Más de 15,000 estudiantes',     quota: 'Ilimitado'            },
]

function OnboardingContent() {
  const searchParams = useSearchParams()
  const planKey = searchParams.get('plan') || 'pro'

  const [step, setStep]                         = useState(0)
  const [selectedPlan, setSelectedPlan]         = useState(planKey)
  const [billingType, setBillingType]           = useState('mensual')
  const [populationTier, setPopulationTier]     = useState('tier2')

  const [institutionName, setInstitutionName]       = useState('')
  const [representativeName, setRepresentativeName] = useState('')
  const [representativeEmail, setRepresentativeEmail] = useState('')
  const [signatureName, setSignatureName]           = useState('')
  const [slaAccepted, setSlaAccepted]               = useState(false)

  const [provStep, setProvStep]           = useState(-1)
  const [provComplete, setProvComplete]   = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied]             = useState<string | null>(null)

  const plan = PLANS[selectedPlan] || PLANS.pro

  const mockPassword  = 'SilaD0cs#' + Math.random().toString(36).slice(2, 6).toUpperCase()
  const mockCode      = 'SLA-' + Date.now().toString(36).toUpperCase().slice(-6)

  useEffect(() => {
    if (step !== 2 || provComplete) return
    setProvStep(0)
    let current = 0
    const advance = () => {
      current++
      if (current < PROVISIONING_STEPS.length) {
        setProvStep(current)
        setTimeout(advance, 1800)
      } else {
        setProvComplete(true)
        setTimeout(() => setStep(3), 900)
      }
    }
    setTimeout(advance, 1800)
  }, [step])

  const canStep1 = selectedPlan && billingType && populationTier
  const canStep2 = institutionName && representativeName && representativeEmail && signatureName && slaAccepted

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f6fa', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container">

        {/* Top bar */}
        <div className="d-flex align-items-center justify-content-between mb-5">
          <Link href="/landing#price" className="d-flex align-items-center gap-2 text-decoration-none text-muted">
            <i className="ti ti-arrow-left fs-18"></i>
            <span className="fs-14">Volver a planes</span>
          </Link>
          <span className="fw-bold text-primary fs-18">SilaDocs</span>
        </div>

        {/* Stepper */}
        <div className="d-flex align-items-center justify-content-center mb-5">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div className="d-flex flex-column align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-semibold"
                  style={{
                    width: 42, height: 42, fontSize: 14,
                    backgroundColor: i <= step ? '#6c5ffc' : '#e5e7eb',
                    color: i <= step ? '#fff' : '#9ca3af',
                    transition: 'all 0.3s',
                  }}
                >
                  {i < step ? <i className="ti ti-check fs-16" /> : i + 1}
                </div>
                <span className="fs-12 mt-1 fw-medium text-nowrap"
                  style={{ color: i <= step ? '#6c5ffc' : '#9ca3af' }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  height: 2, width: 90, marginBottom: 22,
                  backgroundColor: i < step ? '#6c5ffc' : '#e5e7eb',
                  transition: 'background-color 0.4s',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step panels */}
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.22 }}
          >

            {/* ── STEP 1 ── Plan & Quota */}
            {step === 0 && (
              <Row className="justify-content-center">
                <Col xl={8} lg={10}>
                  <Card className="custom-card shadow-sm">
                    <Card.Body className="p-4 p-lg-5">
                      <h4 className="fw-semibold mb-1">Selección del Plan y Cuota de Emisión</h4>
                      <p className="text-muted fs-14 mb-4">Elige el paquete que mejor se adapte al tamaño de tu institución.</p>

                      {/* Plan picker */}
                      <div className="mb-4">
                        <label className="fw-semibold fs-15 d-block mb-3">Plan</label>
                        <Row className="g-3">
                          {Object.values(PLANS).map(p => (
                            <Col md={4} key={p.key}>
                              <div
                                onClick={() => setSelectedPlan(p.key)}
                                className={`border rounded-3 p-3 h-100 ${selectedPlan === p.key ? 'border-primary bg-primary-transparent' : ''}`}
                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                              >
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <div className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: 18, height: 18, flexShrink: 0, border: selectedPlan === p.key ? 'none' : '2px solid #ccc', backgroundColor: selectedPlan === p.key ? '#6c5ffc' : 'transparent' }}>
                                    {selectedPlan === p.key && <i className="ti ti-check text-white" style={{ fontSize: 10 }} />}
                                  </div>
                                  <span className="fw-semibold fs-14">{p.name}</span>
                                </div>
                                <div className="text-primary fw-bold fs-16">{p.price}</div>
                                <div className="text-muted fs-12">{p.quota}</div>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </div>

                      {/* Population tier */}
                      <div className="mb-4">
                        <label className="fw-semibold fs-15 d-block mb-3">Población estudiantil</label>
                        <div className="d-flex flex-column gap-2">
                          {POPULATION_TIERS.map(t => (
                            <div key={t.value}
                              onClick={() => setPopulationTier(t.value)}
                              className={`d-flex align-items-center justify-content-between border rounded-3 p-3 ${populationTier === t.value ? 'border-primary bg-primary-transparent' : ''}`}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="d-flex align-items-center gap-2">
                                <Form.Check type="radio" readOnly checked={populationTier === t.value} onChange={() => setPopulationTier(t.value)} />
                                <span className="fs-14">{t.label}</span>
                              </div>
                              <span className="badge bg-primary-transparent text-primary fs-12 rounded-pill px-3">{t.quota}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Billing */}
                      <div className="mb-4">
                        <label className="fw-semibold fs-15 d-block mb-3">Modalidad de pago</label>
                        <Row className="g-3">
                          {[
                            { v: 'mensual',         l: 'Suscripción Mensual',  d: 'Pago fijo mensual'      },
                            { v: 'anual',           l: 'Suscripción Anual',    d: 'Ahorra 20% vs mensual'  },
                            { v: 'por-transaccion', l: 'Por Transacción',      d: 'Paga solo lo que uses'  },
                          ].map(b => (
                            <Col md={4} key={b.v}>
                              <div onClick={() => setBillingType(b.v)}
                                className={`border rounded-3 p-3 text-center ${billingType === b.v ? 'border-primary bg-primary-transparent' : ''}`}
                                style={{ cursor: 'pointer' }}>
                                <div className="fw-semibold fs-14">{b.l}</div>
                                <div className="text-muted fs-12">{b.d}</div>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </div>

                      {/* Summary */}
                      <div className="rounded-3 p-3 mb-4" style={{ backgroundColor: '#f0f0ff', border: '1px solid #e0e0ff' }}>
                        <div className="fw-semibold fs-14 mb-2 text-primary">Resumen del pedido</div>
                        <div className="d-flex justify-content-between fs-13 mb-1">
                          <span className="text-muted">Plan:</span>
                          <span className="fw-semibold">{plan.name} — {plan.price}</span>
                        </div>
                        <div className="d-flex justify-content-between fs-13 mb-1">
                          <span className="text-muted">Cuota de emisión:</span>
                          <span className="fw-semibold">{plan.quota}</span>
                        </div>
                        <div className="d-flex justify-content-between fs-13">
                          <span className="text-muted">Modalidad:</span>
                          <span className="fw-semibold text-capitalize">{billingType.replace('-', ' ')}</span>
                        </div>
                      </div>

                      <div className="d-flex justify-content-end">
                        <button className="btn btn-primary btn-lg px-5" onClick={() => setStep(1)} disabled={!canStep1}>
                          Continuar <i className="ti ti-arrow-right ms-2" />
                        </button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {/* ── STEP 2 ── SLA */}
            {step === 1 && (
              <Row className="justify-content-center">
                <Col xl={8} lg={10}>
                  <Card className="custom-card shadow-sm">
                    <Card.Body className="p-4 p-lg-5">
                      <h4 className="fw-semibold mb-1">Firma del Acuerdo de Nivel de Servicio</h4>
                      <p className="text-muted fs-14 mb-4">Completa los datos de tu institución y firma el contrato digital.</p>

                      <Row className="g-3 mb-4">
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label className="fw-semibold fs-14">Nombre de la institución *</Form.Label>
                            <Form.Control placeholder="Ej. Universidad Nacional de Lima" value={institutionName} onChange={e => setInstitutionName(e.target.value)} />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold fs-14">Representante legal / Director de TI *</Form.Label>
                            <Form.Control placeholder="Nombre completo" value={representativeName} onChange={e => setRepresentativeName(e.target.value)} />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold fs-14">Correo electrónico corporativo *</Form.Label>
                            <Form.Control type="email" placeholder="admin@universidad.edu" value={representativeEmail} onChange={e => setRepresentativeEmail(e.target.value)} />
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Contract */}
                      <div className="border rounded-3 p-4 mb-4" style={{ maxHeight: 260, overflowY: 'auto', backgroundColor: '#fafafa' }}>
                        <div className="fw-bold fs-14 mb-3 text-center">ACUERDO DE NIVEL DE SERVICIO (SLA)<br />
                          <span className="text-muted fw-normal fs-12">SilaDocs — Plan {plan.name}</span>
                        </div>
                        {[
                          ['1. DISPONIBILIDAD DE LA PLATAFORMA', 'SilaDocs garantiza una disponibilidad del 99.5% mensual. En caso de mantenimiento programado, se notificará con al menos 48 horas de anticipación. Cualquier interrupción no programada será compensada según la tabla de créditos adjunta.'],
                          ['2. CUSTODIA DE DATOS (GDPR / PROTECCIÓN DE DATOS PERSONALES)', 'Los datos personales almacenados son tratados bajo la normativa de protección de datos vigente. SilaDocs actúa como encargado del tratamiento; la institución es el responsable. Se garantiza cifrado AES-256 en reposo y TLS 1.3 en tránsito.'],
                          ['3. VALIDEZ LEGAL DE LAS CREDENCIALES EMITIDAS', 'Los certificados anclados en blockchain tienen validez legal conforme a la legislación de firma electrónica avanzada. Cada registro en la cadena de bloques constituye prueba inmutable de emisión, verificable por cualquier tercero mediante el explorador público.'],
                          ['4. SOPORTE TÉCNICO Y TIEMPO DE RESPUESTA', `El plan ${plan.name} incluye soporte prioritario. Tiempo de respuesta máximo: 4 horas en horario hábil (L-V 9:00–18:00 UTC-5). Incidentes críticos (P1): respuesta en 1 hora, 24/7.`],
                          ['5. CONFIDENCIALIDAD Y PROPIEDAD INTELECTUAL', 'Ambas partes se comprometen a mantener la confidencialidad de la información intercambiada. Los datos académicos pertenecen exclusivamente a la institución. SilaDocs no cederá datos a terceros sin autorización expresa.'],
                        ].map(([title, body]) => (
                          <div key={title} className="mb-3">
                            <p className="fw-semibold fs-13 mb-1">{title}</p>
                            <p className="fs-13 text-muted mb-0">{body}</p>
                          </div>
                        ))}
                      </div>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold fs-14">Firma digital — escriba su nombre completo *</Form.Label>
                        <Form.Control
                          placeholder="Nombre y apellido"
                          value={signatureName}
                          onChange={e => setSignatureName(e.target.value)}
                          style={{ fontFamily: 'cursive', fontSize: '1.05rem', color: '#3d3d3d' }}
                        />
                        {signatureName && (
                          <div className="mt-2 ps-2 border-start border-primary">
                            <span style={{ fontFamily: 'cursive', fontSize: '1.3rem', color: '#6c5ffc' }}>{signatureName}</span>
                            <span className="text-muted fs-12 ms-3">{new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                          </div>
                        )}
                      </Form.Group>

                      <Form.Check
                        id="sla-accept"
                        className="fs-13 mb-4"
                        label="He leído y acepto el Acuerdo de Nivel de Servicio, la política de privacidad y los términos de uso de SilaDocs."
                        checked={slaAccepted}
                        onChange={e => setSlaAccepted(e.target.checked)}
                      />

                      <div className="d-flex justify-content-between">
                        <button className="btn btn-light btn-lg px-4" onClick={() => setStep(0)}>
                          <i className="ti ti-arrow-left me-2" /> Atrás
                        </button>
                        <button className="btn btn-primary btn-lg px-5" onClick={() => setStep(2)} disabled={!canStep2}>
                          Firmar y Continuar <i className="ti ti-writing-sign ms-2" />
                        </button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {/* ── STEP 3 ── Provisioning */}
            {step === 2 && (
              <Row className="justify-content-center">
                <Col xl={6} lg={8}>
                  <Card className="custom-card shadow-sm text-center">
                    <Card.Body className="p-5">
                      {!provComplete ? (
                        <>
                          <div className="spinner-border text-primary mb-4" style={{ width: 56, height: 56 }} />
                          <h4 className="fw-semibold mb-2">Aprovisionando tu entorno</h4>
                          <p className="text-muted fs-14 mb-4">
                            Estamos configurando la instancia para <strong>{institutionName || 'tu institución'}</strong>. Esto tomará solo un momento.
                          </p>
                        </>
                      ) : (
                        <div className="mb-4">
                          <div className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56 }}>
                            <i className="ti ti-check text-white fs-28" />
                          </div>
                          <h4 className="fw-semibold">¡Aprovisionamiento completado!</h4>
                        </div>
                      )}

                      <div className="d-flex flex-column gap-3 text-start">
                        {PROVISIONING_STEPS.map((s, i) => {
                          const done    = i < provStep || (provComplete && i <= provStep)
                          const current = i === provStep && !provComplete
                          return (
                            <div key={i}
                              className={`d-flex align-items-center gap-3 p-3 rounded-3 ${i <= provStep ? 'bg-primary-transparent' : 'bg-light'}`}>
                              <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{ width: 38, height: 38, backgroundColor: done ? '#6c5ffc' : current ? '#6c5ffc' : '#e5e7eb' }}>
                                {done
                                  ? <i className="ti ti-check text-white fs-16" />
                                  : current
                                    ? <div className="spinner-border spinner-border-sm text-white" />
                                    : <i className={`ti ${s.icon} fs-16`} style={{ color: '#9ca3af' }} />
                                }
                              </div>
                              <span className={`fs-14 fw-medium ${i <= provStep ? 'text-primary' : 'text-muted'}`}>{s.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {/* ── STEP 4 ── Credentials */}
            {step === 3 && (
              <Row className="justify-content-center">
                <Col xl={7} lg={9}>
                  <Card className="custom-card shadow-sm">
                    <Card.Body className="p-5">
                      <div className="text-center mb-4">
                        <div className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 76, height: 76 }}>
                          <i className="ti ti-building-bank text-white" style={{ fontSize: 38 }} />
                        </div>
                        <h4 className="fw-semibold">¡Tu entorno está listo!</h4>
                        <p className="text-muted fs-14">
                          La plataforma ya está configurada para <strong>{institutionName}</strong>.<br />
                          Guarda estas credenciales de Super Administrador en un lugar seguro.
                        </p>
                      </div>

                      {/* Credentials box */}
                      <div className="border rounded-3 p-4 mb-4">
                        <div className="fw-semibold fs-14 mb-3 d-flex align-items-center gap-2 text-primary">
                          <i className="ti ti-shield-lock fs-18" />
                          Credenciales de acceso — {plan.name}
                        </div>

                        {[
                          { label: 'Institución',        value: institutionName,     key: 'inst',  icon: 'ti-building',    secret: false },
                          { label: 'Correo de acceso',   value: representativeEmail, key: 'email', icon: 'ti-mail',        secret: false },
                          { label: 'Contraseña temporal',value: mockPassword,        key: 'pass',  icon: 'ti-lock',        secret: true  },
                          { label: 'Código de acceso',   value: mockCode,            key: 'code',  icon: 'ti-key',         secret: false },
                        ].map(c => (
                          <div key={c.key} className="d-flex align-items-center justify-content-between py-3 border-bottom">
                            <div>
                              <div className="text-muted fs-12 mb-1">
                                <i className={`ti ${c.icon} me-1`} />{c.label}
                              </div>
                              <code className="fs-14">
                                {c.secret && !showPassword ? '••••••••••' : c.value}
                              </code>
                            </div>
                            <div className="d-flex gap-2">
                              {c.secret && (
                                <button className="btn btn-sm btn-light" onClick={() => setShowPassword(!showPassword)}>
                                  <i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`} />
                                </button>
                              )}
                              <button className="btn btn-sm btn-light" onClick={() => copy(c.value, c.key)}>
                                <i className={`ti ${copied === c.key ? 'ti-check text-success' : 'ti-copy'}`} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="alert fs-13 mb-4 d-flex gap-2" style={{ backgroundColor: '#fff8e6', borderColor: '#ffd66e', color: '#7a5c00' }}>
                        <i className="ti ti-alert-triangle fs-18 flex-shrink-0 mt-1" />
                        <div>
                          <strong>Importante:</strong> Cambia tu contraseña en el primer inicio de sesión. El código de acceso es de un solo uso y puede ser usado para invitar administradores adicionales.
                        </div>
                      </div>

                      <div className="d-flex gap-3 justify-content-center flex-wrap">
                        <button className="btn btn-light px-4" onClick={() => {
                          const text = `Institución: ${institutionName}\nCorreo: ${representativeEmail}\nContraseña: ${mockPassword}\nCódigo de acceso: ${mockCode}`
                          navigator.clipboard.writeText(text)
                          setCopied('all')
                          setTimeout(() => setCopied(null), 2000)
                        }}>
                          <i className={`ti ${copied === 'all' ? 'ti-check text-success' : 'ti-copy'} me-2`} />
                          {copied === 'all' ? 'Copiado' : 'Copiar todo'}
                        </button>
                        <Link href="/authentication/sign-in/cover" className="btn btn-primary px-5">
                          Ir al Portal <i className="ti ti-arrow-right ms-2" />
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
