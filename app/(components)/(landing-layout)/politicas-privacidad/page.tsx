"use client";

import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";

const PoliticasPrivacidad: React.FC = () => {
  return (
    <>
      <Seo title="Políticas de Privacidad - SilaDocs" description="Políticas de privacidad de SilaDocs" />
      <Pageheader
        currentpage="Políticas de Privacidad"
        activepage="SilaDocs"
        mainpage="Home"
        activepageclickable
      />

      <Container className="py-5">
        <Row className="mb-5">
          <Col lg={10} className="mx-auto">
            <h1 className="fw-bold mb-4">Políticas de Privacidad</h1>
            <p className="text-muted fs-14">
              <strong>Última actualización: Mayo 2026</strong>
            </p>

            <div className="mt-5">
              {/* Introducción */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">Introducción</h4>
                <p className="text-muted">
                  En SilaDocs, tu privacidad es fundamental. Esta Política de Privacidad
                  explica cómo recopilamos, usamos, compartimos y protegemos tu información
                  personal cuando utilizas nuestra plataforma de gestión de sílabos.
                </p>
              </section>

              {/* 1. Información que Recopilamos */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">1. Información que Recopilamos</h4>

                <p className="text-muted">
                  <strong>1.1 Información de Cuenta</strong>
                </p>
                <ul className="text-muted">
                  <li>Nombre completo</li>
                  <li>Correo electrónico</li>
                  <li>Institución/Organización</li>
                  <li>Rol o posición (Rector, Docente, Administrador)</li>
                  <li>Contraseña (encriptada)</li>
                </ul>

                <p className="text-muted">
                  <strong>1.2 Información de Uso</strong>
                </p>
                <ul className="text-muted">
                  <li>Documentos que cargues (sílabos en PDF)</li>
                  <li>Historial de cambios y versiones</li>
                  <li>Fechas y horas de acceso</li>
                  <li>Direcciones IP</li>
                  <li>Información del navegador/dispositivo</li>
                </ul>

                <p className="text-muted">
                  <strong>1.3 Información de Blockchain</strong>
                </p>
                <ul className="text-muted">
                  <li>Hashes SHA-256 de documentos</li>
                  <li>Transacciones en Hyperledger Fabric</li>
                  <li>Metadatos de registros inmutables</li>
                </ul>

                <p className="text-muted">
                  <strong>1.4 Comunicaciones</strong>
                </p>
                <ul className="text-muted">
                  <li>Emails de soporte técnico</li>
                  <li>Notificaciones del sistema</li>
                  <li>Feedback y encuestas (voluntarios)</li>
                </ul>
              </section>

              {/* 2. Cómo Usamos tu Información */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">2. Cómo Usamos tu Información</h4>

                <p className="text-muted">
                  <strong>2.1 Propósitos de Servicio</strong>
                </p>
                <ul className="text-muted">
                  <li>Proporcionar acceso a la plataforma SilaDocs</li>
                  <li>Procesar carga y gestión de sílabos</li>
                  <li>Registrar documentos en blockchain</li>
                  <li>Generar QR y URLs de verificación pública</li>
                  <li>Mantener historial de versiones</li>
                </ul>

                <p className="text-muted">
                  <strong>2.2 Seguridad</strong>
                </p>
                <ul className="text-muted">
                  <li>Detectar actividades fraudulentas</li>
                  <li>Prevenir accesos no autorizados</li>
                  <li>Proteger la integridad de datos</li>
                  <li>Auditoría de seguridad</li>
                </ul>

                <p className="text-muted">
                  <strong>2.3 Mejora de Servicio</strong>
                </p>
                <ul className="text-muted">
                  <li>Analizar uso de la plataforma</li>
                  <li>Identificar y corregir problemas</li>
                  <li>Desarrollar nuevas funcionalidades</li>
                  <li>Personalizar experiencia del usuario</li>
                </ul>

                <p className="text-muted">
                  <strong>2.4 Comunicaciones</strong>
                </p>
                <ul className="text-muted">
                  <li>Enviar notificaciones del sistema</li>
                  <li>Responder consultas de soporte</li>
                  <li>Informar actualizaciones importantes</li>
                  <li>Solicitar consentimiento cuando sea necesario</li>
                </ul>
              </section>

              {/* 3. Bases Legales para el Procesamiento */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">3. Bases Legales para el Procesamiento</h4>
                <p className="text-muted">
                  Procesamos tu información basados en:
                </p>
                <ul className="text-muted">
                  <li>
                    <strong>Contrato:</strong> Para proporcionar servicios que solicitaste
                  </li>
                  <li>
                    <strong>Consentimiento:</strong> Cuando explícitamente lo autorizas
                  </li>
                  <li>
                    <strong>Obligaciones Legales:</strong> Para cumplir con leyes aplicables
                  </li>
                  <li>
                    <strong>Intereses Legítimos:</strong> Para mejorar seguridad y servicio
                  </li>
                </ul>
              </section>

              {/* 4. Compartición de Datos */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">4. Con Quién Compartimos tu Información</h4>

                <p className="text-muted">
                  <strong>4.1 NO Compartimos con Terceros</strong>
                </p>
                <p className="text-muted">
                  No vendemos, alquilamos ni compartimos tus datos personales con terceros
                  para marketing u otros propósitos comerciales.
                </p>

                <p className="text-muted">
                  <strong>4.2 Proveedores de Servicios</strong>
                </p>
                <p className="text-muted">
                  Podemos compartir datos con proveedores que nos ayudan a operar la plataforma:
                </p>
                <ul className="text-muted">
                  <li>
                    <strong>Azure Cloud:</strong> Almacenamiento seguro de PDFs y datos
                  </li>
                  <li>
                    <strong>PostgreSQL Hosting:</strong> Base de datos en la nube
                  </li>
                  <li>
                    <strong>Hyperledger Fabric:</strong> Red blockchain para registro
                  </li>
                </ul>
                <p className="text-muted">
                  Todos firmamos acuerdos de confidencialidad y solo acceden a datos
                  necesarios para operar.
                </p>

                <p className="text-muted">
                  <strong>4.3 Requerimientos Legales</strong>
                </p>
                <p className="text-muted">
                  Podemos divulgar información si lo requiere la ley, orden judicial o
                  autoridades competentes.
                </p>

                <p className="text-muted">
                  <strong>4.4 Acceso Público a Sílabos</strong>
                </p>
                <p className="text-muted">
                  Los sílabos registrados son accesibles públicamente mediante URLs y QR
                  generados. La información visible públicamente incluye:
                </p>
                <ul className="text-muted">
                  <li>Nombre del curso</li>
                  <li>Código del curso</li>
                  <li>Carrera/Programa</li>
                  <li>Contenido del PDF</li>
                  <li>Historial de versiones (sin datos personales)</li>
                  <li>Hashes y estado blockchain</li>
                </ul>
                <p className="text-muted">
                  Es responsabilidad del usuario determinar qué sílabos hace públicos y
                  quién puede acceder.
                </p>
              </section>

              {/* 5. Seguridad de Datos */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">5. Cómo Protegemos tus Datos</h4>

                <p className="text-muted">
                  <strong>5.1 Medidas Técnicas</strong>
                </p>
                <ul className="text-muted">
                  <li>Encriptación TLS/SSL en tránsito (https://)</li>
                  <li>Encriptación AES-256 en almacenamiento</li>
                  <li>Hashing SHA-256 para integridad de documentos</li>
                  <li>Firewall y sistemas de detección de intrusiones</li>
                </ul>

                <p className="text-muted">
                  <strong>5.2 Medidas Administrativas</strong>
                </p>
                <ul className="text-muted">
                  <li>Autenticación JWT con tokens seguros</li>
                  <li>Control de acceso basado en roles</li>
                  <li>Auditoría de accesos y cambios</li>
                  <li>Capacitación en seguridad del personal</li>
                </ul>

                <p className="text-muted">
                  <strong>5.3 Limitaciones</strong>
                </p>
                <p className="text-muted">
                  Aunque implementamos medidas robustas, ningún sistema es 100% seguro.
                  No podemos garantizar seguridad absoluta.
                </p>
              </section>

              {/* 6. Retención de Datos */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">6. Cuánto Tiempo Retenemos tus Datos</h4>

                <p className="text-muted">
                  <strong>6.1 Datos de Cuenta</strong>
                </p>
                <p className="text-muted">
                  Retenemos información de cuenta mientras tu cuenta esté activa. Si eliminas
                  tu cuenta, eliminamos datos personales en plazo de 30 días, excepto donde
                  la ley requiera retención más larga.
                </p>

                <p className="text-muted">
                  <strong>6.2 Sílabos Registrados en Blockchain</strong>
                </p>
                <p className="text-muted">
                  Los sílabos registrados en blockchain son permanentes e inmutables.
                  No pueden ser eliminados. Esta es una característica de seguridad.
                </p>

                <p className="text-muted">
                  <strong>6.3 Logs y Auditoría</strong>
                </p>
                <p className="text-muted">
                  Retenemos logs de seguridad y auditoría típicamente 1-2 años para cumplimiento
                  normativo.
                </p>
              </section>

              {/* 7. Tus Derechos */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">7. Tus Derechos sobre tus Datos</h4>

                <p className="text-muted">
                  Dependiendo de tu ubicación, podrías tener derechos como:
                </p>

                <p className="text-muted">
                  <strong>7.1 Acceso</strong>
                </p>
                <p className="text-muted">
                  Tienes derecho a solicitar qué datos personales tenemos sobre ti.
                </p>

                <p className="text-muted">
                  <strong>7.2 Corrección</strong>
                </p>
                <p className="text-muted">
                  Puedes solicitar corregir información personal inexacta.
                </p>

                <p className="text-muted">
                  <strong>7.3 Eliminación</strong>
                </p>
                <p className="text-muted">
                  En algunas circunstancias, puedes solicitar la eliminación de tus datos
                  (excepto los registrados en blockchain, que son permanentes).
                </p>

                <p className="text-muted">
                  <strong>7.4 Portabilidad</strong>
                </p>
                <p className="text-muted">
                  Puedes solicitar tus datos en formato estructurado y transferirlos a otro
                  servicio.
                </p>

                <p className="text-muted">
                  <strong>7.5 Restricción de Procesamiento</strong>
                </p>
                <p className="text-muted">
                  Puedes solicitar que limitemos cómo procesamos tus datos.
                </p>

                <p className="text-muted">
                  Para ejercer estos derechos, contacta a:{" "}
                  <strong>privacy@siladocs.com</strong>
                </p>
              </section>

              {/* 8. Cookies y Rastreo */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">8. Cookies y Tecnologías de Rastreo</h4>

                <p className="text-muted">
                  <strong>8.1 Cookies Necesarias</strong>
                </p>
                <p className="text-muted">
                  Usamos cookies técnicas necesarias para autenticación, sesiones y seguridad.
                </p>

                <p className="text-muted">
                  <strong>8.2 Análisis</strong>
                </p>
                <p className="text-muted">
                  Podemos usar Google Analytics u herramientas similares para analizar uso
                  y mejorar el servicio.
                </p>

                <p className="text-muted">
                  <strong>8.3 Consentimiento</strong>
                </p>
                <p className="text-muted">
                  Solicitamos consentimiento antes de colocar cookies no esenciales. Puedes
                  controlar cookies en configuración de tu navegador.
                </p>
              </section>

              {/* 9. Transferencias Internacionales */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">9. Transferencias Internacionales de Datos</h4>

                <p className="text-muted">
                  Tus datos pueden ser transferidos a, procesados y almacenados en países
                  diferentes del tuyo. Al usar SilaDocs, consientes estas transferencias.
                  Implementamos salvaguardas incluyendo cláusulas contractuales estándar.
                </p>
              </section>

              {/* 10. Cambios en esta Política */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">10. Cambios en esta Política</h4>

                <p className="text-muted">
                  Podemos actualizar esta Política de Privacidad ocasionalmente. Publicaremos
                  cambios aquí y actualizaremos la fecha de "Última actualización". Si los
                  cambios son significativos, notificaremos por email.
                </p>
              </section>

              {/* 11. Contacto */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">11. Contacto para Privacidad</h4>

                <p className="text-muted">
                  Para preguntas sobre privacidad, ejercer derechos, o reportar problemas:
                </p>

                <p className="text-muted">
                  <strong>Email de Privacidad:</strong> privacy@siladocs.com
                </p>
                <p className="text-muted">
                  <strong>Email General:</strong> legal@siladocs.com
                </p>
                <p className="text-muted">
                  <strong>Sitio Web:</strong> https://siladocs-frontend.vercel.app/
                </p>

                <p className="text-muted mt-4">
                  Responderemos solicitudes de privacidad dentro de 30 días conforme a
                  requisitos legales.
                </p>
              </section>

              {/* Cierre */}
              <section className="bg-light p-4 rounded mt-5">
                <p className="text-center text-muted mb-0">
                  <small>
                    Tu privacidad importa. Si tienes alguna pregunta sobre cómo manejamos
                    tus datos, no dudes en contactarnos. Tu confianza es fundamental para
                    nosotros.
                  </small>
                </p>
              </section>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PoliticasPrivacidad;
