"use client";

import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Pageheader from "@/shared/layouts-components/pageheader/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";

const TerminosCondiciones: React.FC = () => {
  return (
    <>
      <Seo title="Términos y Condiciones - SilaDocs" description="Términos y condiciones de uso de SilaDocs" />
      <Pageheader
        currentpage="Términos y Condiciones"
        activepage="SilaDocs"
        mainpage="Home"
        activepageclickable
      />

      <Container className="py-5">
        <Row className="mb-5">
          <Col lg={10} className="mx-auto">
            <h1 className="fw-bold mb-4">Términos y Condiciones</h1>
            <p className="text-muted fs-14">
              <strong>Última actualización: Mayo 2026</strong>
            </p>

            <div className="mt-5">
              {/* 1. Aceptación de Términos */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">1. Aceptación de Términos</h4>
                <p className="text-muted">
                  Al acceder y utilizar la plataforma SilaDocs, aceptas estar sujeto a estos
                  Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos
                  términos, no podrás usar la plataforma. Nos reservamos el derecho de
                  modificar estos términos en cualquier momento.
                </p>
              </section>

              {/* 2. Descripción del Servicio */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">2. Descripción del Servicio</h4>
                <p className="text-muted">
                  SilaDocs es una plataforma de gestión de sílabos académicos que utiliza
                  tecnología blockchain (Hyperledger Fabric) para garantizar inmutabilidad,
                  trazabilidad y seguridad en el registro de documentos educativos. La
                  plataforma permite:
                </p>
                <ul className="text-muted">
                  <li>Carga y gestión de sílabos en formato PDF</li>
                  <li>Registro de versiones con historial completo</li>
                  <li>Verificación de autenticidad e integridad de documentos</li>
                  <li>Generación de QR y URLs compartibles</li>
                  <li>Acceso público a información sin requerir autenticación</li>
                </ul>
              </section>

              {/* 3. Cuenta de Usuario */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">3. Cuenta de Usuario</h4>
                <p className="text-muted">
                  <strong>3.1 Responsabilidad del Usuario</strong>
                </p>
                <p className="text-muted">
                  Eres responsable de mantener la confidencialidad de tus credenciales de
                  acceso. No debes compartir tu contraseña ni permitir que terceros accedan
                  a tu cuenta. Eres responsable de todas las actividades realizadas bajo tu
                  cuenta.
                </p>

                <p className="text-muted">
                  <strong>3.2 Información Precisa</strong>
                </p>
                <p className="text-muted">
                  Al registrarte, garantizas que la información proporcionada es precisa,
                  completa y actualizada. Mantendrás tu información actualizada en todo momento.
                </p>

                <p className="text-muted">
                  <strong>3.3 Cuentas de Demostración</strong>
                </p>
                <p className="text-muted">
                  Las cuentas de demostración son solo para propósitos educativos y de
                  evaluación. No deben utilizarse para procesar información sensible de
                  instituciones reales sin autorización explícita.
                </p>
              </section>

              {/* 4. Derechos de Propiedad Intelectual */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">4. Derechos de Propiedad Intelectual</h4>
                <p className="text-muted">
                  <strong>4.1 Contenido de la Plataforma</strong>
                </p>
                <p className="text-muted">
                  Todo el código, diseño, funcionalidades y contenido de SilaDocs son
                  propiedad intelectual de sus desarrolladores. Está prohibido reproducir,
                  distribuir, modificar o usar cualquier parte sin autorización expresa.
                </p>

                <p className="text-muted">
                  <strong>4.2 Contenido del Usuario</strong>
                </p>
                <p className="text-muted">
                  Los documentos (sílabos) que subes permanecen siendo propiedad de tu
                  institución. SilaDocs solo actúa como plataforma de almacenamiento y
                  verificación. Garantizas tener los derechos para cargar dicho contenido.
                </p>
              </section>

              {/* 5. Uso Aceptable */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">5. Uso Aceptable</h4>
                <p className="text-muted">
                  No debes usar SilaDocs para:
                </p>
                <ul className="text-muted">
                  <li>Violar leyes, regulaciones o derechos de terceros</li>
                  <li>Transmitir malware, virus o código malintencionado</li>
                  <li>Intentar acceder sin autorización a sistemas o datos</li>
                  <li>Realizar ataques de denegación de servicio (DoS)</li>
                  <li>Engañar o defraudar a usuarios o instituciones</li>
                  <li>Cargar contenido inapropiado, difamatorio u ofensivo</li>
                  <li>Spam, acoso o actividades abusivas</li>
                </ul>
              </section>

              {/* 6. Blockchain e Inmutabilidad */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">6. Blockchain e Inmutabilidad</h4>
                <p className="text-muted">
                  <strong>6.1 Registro Permanente</strong>
                </p>
                <p className="text-muted">
                  Una vez que un sílabo es registrado en la blockchain (estado "Inmutable"),
                  no puede ser eliminado ni alterado. Esta es una característica de seguridad
                  y no puede ser reversada.
                </p>

                <p className="text-muted">
                  <strong>6.2 Transacciones Criptográficas</strong>
                </p>
                <p className="text-muted">
                  Cada registro genera un hash SHA-256 único. Cualquier modificación futura
                  del archivo generará un hash diferente, detectando alteraciones.
                </p>

                <p className="text-muted">
                  <strong>6.3 Responsabilidad de Contenido</strong>
                </p>
                <p className="text-muted">
                  Eres responsable de verificar que el contenido es correcto antes de
                  registrarlo. Una vez registrado en blockchain, es inmutable de forma
                  permanente.
                </p>
              </section>

              {/* 7. Acceso Público */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">7. Acceso Público y Compartibilidad</h4>
                <p className="text-muted">
                  <strong>7.1 URLs Públicas</strong>
                </p>
                <p className="text-muted">
                  Los sílabos registrados pueden ser accedidos públicamente mediante URLs y
                  QR generados automáticamente. Esta es una característica del sistema para
                  permitir verificación sin login.
                </p>

                <p className="text-muted">
                  <strong>7.2 Responsabilidad del Usuario</strong>
                </p>
                <p className="text-muted">
                  Es responsabilidad del usuario autorizado determinar quién tiene acceso a
                  los URLs y QR generados. SilaDocs no controla el acceso público.
                </p>

                <p className="text-muted">
                  <strong>7.3 Información Visible Públicamente</strong>
                </p>
                <p className="text-muted">
                  Solo la información básica del sílabo es visible públicamente (nombre,
                  código, carrera, PDF, historial de versiones). Datos sensibles de
                  instituciones no se exponen.
                </p>
              </section>

              {/* 8. Limitación de Responsabilidad */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">8. Limitación de Responsabilidad</h4>
                <p className="text-muted">
                  SilaDocs se proporciona "tal cual" sin garantías. En la máxima medida
                  permitida por la ley:
                </p>
                <ul className="text-muted">
                  <li>
                    No somos responsables de interrupciones, errores o falta de disponibilidad
                  </li>
                  <li>No garantizamos que el servicio sea libre de errores</li>
                  <li>No somos responsables de pérdida de datos (aunque blockchain es seguro)</li>
                  <li>No somos responsables de daños indirectos o consecuentes</li>
                </ul>
              </section>

              {/* 9. Política de Privacidad */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">9. Privacidad de Datos</h4>
                <p className="text-muted">
                  Tu privacidad es importante. Consulta nuestra{" "}
                  <a href="/politicas-privacidad" className="text-primary fw-semibold">
                    Política de Privacidad
                  </a>{" "}
                  para entender cómo recopilamos, usamos y protegemos tus datos.
                </p>
              </section>

              {/* 10. Seguridad */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">10. Seguridad</h4>
                <p className="text-muted">
                  <strong>10.1 Estándares de Seguridad</strong>
                </p>
                <p className="text-muted">
                  Implementamos medidas de seguridad estándar de la industria:
                </p>
                <ul className="text-muted">
                  <li>Encriptación TLS/SSL en tránsito</li>
                  <li>Encriptación AES-256 en almacenamiento</li>
                  <li>Autenticación JWT</li>
                  <li>Blockchain Hyperledger Fabric para inmutabilidad</li>
                </ul>

                <p className="text-muted">
                  <strong>10.2 Sin Garantía Total</strong>
                </p>
                <p className="text-muted">
                  Aunque implementamos seguridad robusta, no podemos garantizar seguridad
                  total. Eres responsable de mantener tus credenciales seguras.
                </p>
              </section>

              {/* 11. Terminación */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">11. Terminación de Cuenta</h4>
                <p className="text-muted">
                  Podemos terminar o suspender tu cuenta si:
                </p>
                <ul className="text-muted">
                  <li>Violas estos Términos y Condiciones</li>
                  <li>Realizas actividades ilegales o fraudulentas</li>
                  <li>Utilizas la plataforma de forma abusiva</li>
                  <li>No pagas las cuotas (si aplica)</li>
                </ul>
                <p className="text-muted">
                  La terminación no afecta la inmutabilidad de registros en blockchain,
                  que permanecen permanentemente.
                </p>
              </section>

              {/* 12. Cambios en los Términos */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">12. Cambios en los Términos</h4>
                <p className="text-muted">
                  Podemos actualizar estos términos en cualquier momento. Los cambios entran
                  en vigor inmediatamente. Tu uso continuado de la plataforma implica
                  aceptación de los términos actualizados.
                </p>
              </section>

              {/* 13. Contacto */}
              <section className="mb-5">
                <h4 className="fw-bold mb-3">13. Contacto</h4>
                <p className="text-muted">
                  Para preguntas sobre estos términos, contacta a:{" "}
                </p>
                <p className="text-muted">
                  <strong>Email:</strong> legal@siladocs.com
                </p>
                <p className="text-muted">
                  <strong>Sitio Web:</strong> https://siladocs-frontend.vercel.app/
                </p>
              </section>

              {/* Cierre */}
              <section className="bg-light p-4 rounded mt-5">
                <p className="text-center text-muted mb-0">
                  <small>
                    Al crear una cuenta o usar SilaDocs, aceptas estar vinculado por estos
                    Términos y Condiciones. Si no estás de acuerdo, no uses la plataforma.
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

export default TerminosCondiciones;
