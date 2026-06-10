"use client"

import Pageheader from "@/shared/layouts-components/pageheader/pageheader"
import Seo from "@/shared/layouts-components/seo/seo"
import { Card, Container, Row, Col } from "react-bootstrap"

export default function TerminosCondiciones() {
  return (
    <>
      <Seo title="Términos y Condiciones" />
      <Pageheader title="Términos y Condiciones" />
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="custom-card border-0 shadow-sm">
              <Card.Body className="p-5">
                <h5 className="fw-bold mb-4">Términos y Condiciones de SilaDocs</h5>

                <h6 className="fw-semibold mt-4 mb-2">1. Aceptación de Términos</h6>
                <p className="text-muted">
                  Al acceder y utilizar SilaDocs, aceptas plenamente estos términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, debes dejar de usar el servicio inmediatamente.
                </p>

                <h6 className="fw-semibold mt-4 mb-2">2. Descripción del Servicio</h6>
                <p className="text-muted">
                  SilaDocs es una plataforma de gestión de sílabos académicos que utiliza tecnología blockchain (Hyperledger Fabric) para garantizar la integridad, inmutabilidad y trazabilidad de los documentos académicos. El servicio permite a las instituciones educativas crear, versionar, verificar y auditar sílabos de forma segura.
                </p>

                <h6 className="fw-semibold mt-4 mb-2">3. Uso Autorizado</h6>
                <p className="text-muted">
                  Solo están autorizados a usar SilaDocs los administradores de instituciones educativas que hayan sido registrados y aprobados por el equipo de SilaDocs. Cada usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.
                </p>

                <h6 className="fw-semibold mt-4 mb-2">4. Seguridad de Datos</h6>
                <p className="text-muted">
                  Implementamos medidas de seguridad estándar para proteger la información. Sin embargo, no garantizamos seguridad absoluta. Los usuarios son responsables de proteger sus credenciales y contraseñas. Toda la información de sílabos es registrada en blockchain para garantizar su inmutabilidad.
                </p>

                <h6 className="fw-semibold mt-4 mb-2">5. Responsabilidades del Usuario</h6>
                <p className="text-muted">
                  El usuario se compromete a:
                </p>
                <ul className="text-muted">
                  <li>Usar el servicio solo para fines académicos legítimos</li>
                  <li>No intentar acceder a datos de otras instituciones sin autorización</li>
                  <li>Mantener la precisión de la información ingresada en el sistema</li>
                  <li>Cumplir con todas las leyes y regulaciones aplicables</li>
                  <li>No intentar perturbar o afectar la disponibilidad del servicio</li>
                </ul>

                <h6 className="fw-semibold mt-4 mb-2">6. Limitación de Responsabilidad</h6>
                <p className="text-muted">
                  SilaDocs se proporciona "tal como está" sin garantías de ningún tipo, explícitas o implícitas. No somos responsables por daños indirectos, incidentales, especiales o consecuentes derivados del uso o la incapacidad de usar el servicio.
                </p>

                <h6 className="fw-semibold mt-4 mb-2">7. Privacidad</h6>
                <p className="text-muted">
                  El uso de SilaDocs está sujeto a nuestra Política de Privacidad. Al usar el servicio, consenties la recopilación y uso de información según se describe en dicha política.
                </p>

                <h6 className="fw-semibold mt-4 mb-2">8. Modificaciones del Servicio</h6>
                <p className="text-muted">
                  Nos reservamos el derecho de modificar o descontinuar el servicio en cualquier momento, con o sin previo aviso. No somos responsables ante el usuario por daños que resulten de tales modificaciones.
                </p>

                <h6 className="fw-semibold mt-4 mb-2">9. Vigencia</h6>
                <p className="text-muted">
                  Estos términos y condiciones entraron en vigor el 1 de enero de 2024 y permanecen vigentes mientras el usuario mantenga una cuenta activa.
                </p>

                <h6 className="fw-semibold mt-4 mb-2">10. Contacto</h6>
                <p className="text-muted">
                  Si tienes preguntas sobre estos términos, por favor contacta al equipo de soporte de SilaDocs.
                </p>

                <div className="alert alert-info mt-4" role="alert">
                  <i className="ri-information-line me-2"></i>
                  <strong>Última actualización:</strong> Enero 2024
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}
