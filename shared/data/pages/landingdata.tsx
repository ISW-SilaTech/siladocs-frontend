import SpkTeststyleCard from "@/shared/@spk-reusable-components/reusable-pages/spk-teststylecard";
import Image from "next/image";
import { JSX } from "react";
import { Card } from "react-bootstrap";

interface WorkflowCard {
    title: string;
    description: string;
    icon: JSX.Element;
    imgSrc?: string;
    iconClass: string;
}

export const WorkflowCards: WorkflowCard[] = [
    {
        title: "Registro de sílabos",
        description: "Cargue y organice sílabos digitales con plantillas prediseñadas para cada curso o carrera.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none" /><path d="M104,208V104H32v96a8,8,0,0,0,8,8H96" opacity="0.2" /><line x1="32" y1="104" x2="224" y2="104" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" /><line x1="104" y1="104" x2="104" y2="208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" /><rect x="32" y="48" width="192" height="160" rx="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" /></svg>
        ),
        imgSrc: "../assets/images/media/backgrounds/3.png",
        iconClass: "svg-primary text-primary",
    },
    {
        title: "Validación y trazabilidad",
        description: "Garantice la autenticidad con registros inmutables en blockchain que documentan cada cambio.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none" /><circle cx="84" cy="108" r="52" opacity="0.2" /><path d="M10.23,200a88,88,0,0,1,147.54,0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" /><path d="M172,160a87.93,87.93,0,0,1,73.77,40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" /><circle cx="84" cy="108" r="52" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" /><path d="M152.69,59.7A52,52,0,1,1,172,160" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" /></svg>
        ),
        imgSrc: "../assets/images/media/backgrounds/4.png",
        iconClass: "svg-warning text-warning",
    },
    {
        title: "Reportes en tiempo real",
        description: "Genere informes académicos instantáneos para mejorar la toma de decisiones institucionales.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none" /><path d="M32,48H208a16,16,0,0,1,16,16V208a0,0,0,0,1,0,0H32a0,0,0,0,1,0,0V48A0,0,0,0,1,32,48Z" opacity="0.2" /><polyline points="224 208 32 208 32 48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" /><polyline points="224 96 160 152 96 104 32 160" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" /></svg>
        ),
        iconClass: "svg-success text-success",
    },
];


interface FAQItem {
    id: number;
    title: any;
    content: string;
}

export const LandingFaqs: FAQItem[] = [
    {
        id: 1,
        title: (
            <>
                <i className="ri-layout-4-line fw-medium avatar avatar-sm avatar-rounded bg-primary-transparent fs-5 me-2 text-primary"></i>
                ¿Cómo personalizo el panel académico?
            </>
        ),
        content: "Cada rol (administrativo, docente o directivo) puede organizar su panel con widgets personalizados para gestionar sílabos, solicitudes y reportes."
    },
    {
        id: 2,
        title: (
            <>
                <i className="ri-shield-check-line fw-medium avatar avatar-sm avatar-rounded bg-primary-transparent fs-5 me-2 text-primary"></i>
                ¿Qué nivel de seguridad ofrece la plataforma?
            </>
        ),
        content: "La información se respalda en blockchain, garantizando la trazabilidad, autenticidad y que ningún sílabo pueda ser alterado sin registro."
    },
    {
        id: 3,
        title: (
            <>
                <i className="ri-smartphone-line fw-medium avatar avatar-sm avatar-rounded bg-primary-transparent fs-5 me-2 text-primary"></i>
                ¿Puedo acceder desde cualquier dispositivo?
            </>
        ),
        content: "Sí, el sistema es 100% web y responsivo, optimizado para computadoras, tablets y móviles sin necesidad de instalaciones."
    },
    {
        id: 4,
        title: (
            <>
                <i className="ri-user-settings-line fw-medium avatar avatar-sm avatar-rounded bg-primary-transparent fs-5 me-2 text-primary"></i>
                ¿Cómo administro usuarios y permisos?
            </>
        ),
        content: "Desde el módulo de gestión de usuarios puedes asignar roles a docentes, administrativos y estudiantes para controlar accesos."
    },
    {
        id: 5,
        title: (
            <>
                <i className="ri-bar-chart-line fw-medium avatar avatar-sm avatar-rounded bg-primary-transparent fs-5 me-2 text-primary"></i>
                ¿Puedo generar y exportar reportes académicos?
            </>
        ),
        content: "Sí, la plataforma permite generar reportes en tiempo real sobre sílabos, aprobaciones y trazabilidad, exportables en PDF o Excel."
    },
    {
        id: 6,
        title: (
            <>
                <i className="ri-notification-line fw-medium avatar avatar-sm avatar-rounded bg-primary-transparent fs-5 me-2 text-primary"></i>
                ¿El sistema envía notificaciones?
            </>
        ),
        content: "Sí, puedes configurar notificaciones y alertas en tiempo real sobre solicitudes, aprobaciones y actualizaciones de documentos."
    }

];

interface ServiceCard {
    title: string;
    description: string;
    icon: JSX.Element;
    cardClass: string;
    iconBgClass: string;
    iconColorClass: string;
}

export const ServiceCards: ServiceCard[] = [
    {
        title: "Paneles personalizables",
        description: "Organice la gestión con paneles adaptados a cada institución.",
        cardClass: "primary",
        iconBgClass: "bg-primary-transparent",
        iconColorClass: "svg-primary",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                <rect width="256" height="256" fill="none" />
                <path d="M104,208V104H32v96a8,8,0,0,0,8,8H96" opacity="0.2" />
                <line x1="32" y1="104" x2="224" y2="104" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <line x1="104" y1="104" x2="104" y2="208" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <rect x="32" y="48" width="192" height="160" rx="8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" fill="none" />
            </svg>
        ),
    },
    {
        title: "Análisis en tiempo real",
        description: "Obtenga métricas inmediatas sobre sílabos y su trazabilidad.",
        cardClass: "secondary",
        iconBgClass: "bg-secondary-transparent",
        iconColorClass: "svg-secondary",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                <rect width="256" height="256" fill="none" />
                <path d="M32,48H208a16,16,0,0,1,16,16V208H32Z" opacity="0.2" />
                <polyline points="224 208 32 208 32 48" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" fill="none" />
                <polyline points="224 96 160 152 96 104 32 160" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" fill="none" />
            </svg>
        ),
    },
    {
        title: "Gestión de sílabos",
        description: "Administre solicitudes y validaciones de forma segura.",
        cardClass: "warning",
        iconBgClass: "bg-warning-transparent",
        iconColorClass: "svg-warning",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                <rect width="256" height="256" fill="none" />
                <circle cx="128" cy="96" r="64" opacity="0.2" />
                <circle cx="128" cy="96" r="64" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" fill="none" />
                <path d="M32,216c19.37-33.47,54.55-56,96-56s76.63,22.53,96,56" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" fill="none" />
            </svg>
        ),
    },
    {
        title: "Integración simple",
        description: "Conecte la plataforma fácilmente con sistemas existentes.",
        cardClass: "success",
        iconBgClass: "bg-success-transparent",
        iconColorClass: "svg-success",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                <rect width="256" height="256" fill="none" />
                <path d="M212,132l-58.63,58.63a32,32,0,0,1-45.25,0L65.37,147.88a32,32,0,0,1,0-45.25L124,44Z" opacity="0.2" />
                <line x1="144" y1="64" x2="184" y2="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <line x1="232" y1="72" x2="192" y2="112" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <line x1="224" y1="144" x2="112" y2="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <path d="M212,132l-58.63,58.63a32,32,0,0,1-45.25,0L65.37,147.88a32,32,0,0,1,0-45.25L124,44" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" fill="none" />
                <line x1="86.75" y1="169.25" x2="32" y2="224" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
            </svg>
        ),
    },
];

const Swiperdata = [
    { imgsrc: '../assets/images/company-logos/13.png' },
    { imgsrc: '../assets/images/company-logos/14.png' },
    { imgsrc: '../assets/images/company-logos/15.png' },
    { imgsrc: '../assets/images/company-logos/16.png' },
    { imgsrc: '../assets/images/company-logos/17.png' },
    { imgsrc: '../assets/images/company-logos/18.png' },
    { imgsrc: '../assets/images/company-logos/19.png' },
    { imgsrc: '../assets/images/company-logos/20.png' },
    { imgsrc: '../assets/images/company-logos/12.png' },
]
export const laningSwiper = Swiperdata.map((idx, index) => (
    <Card key={index} className="custom-card trusted-clients-container mb-0 border border-dashed">
        <Card.Body>
            <Image fill src={idx.imgsrc} alt="" className="img-fluid" />
        </Card.Body>
    </Card>
));

interface Feature {
    title: string;
    description: string;
    bgClass: string;
    svgClass: string;
    svgIcon: React.ReactNode;
}

export const LandingFeatures: Feature[] = [
    {
        title: 'Dashboard personalizado',
        description: 'Personalice el diseño y los widgets de su panel de adminsitración para una mejor experiencia.',
        bgClass: 'bg-primary-transparent',
        svgClass: 'svg-primary',
        svgIcon: (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M104,208V104H32v96a8,8,0,0,0,8,8H96" opacity="0.2"></path><line x1="32" y1="104" x2="224" y2="104" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="104" y1="104" x2="104" y2="208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><rect x="32" y="48" width="192" height="160" rx="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></rect></svg>
            </>
        )
    },
    {
        title: 'Gráficos y tablas interactivas',
        description: 'Muestre datos de forma dinámica con gráficos y tablas totalmente personalizables.',
        bgClass: 'bg-secondary-transparent',
        svgClass: 'svg-secondary',
        svgIcon: (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M32,48H208a16,16,0,0,1,16,16V208a0,0,0,0,1,0,0H32a0,0,0,0,1,0,0V48A0,0,0,0,1,32,48Z" opacity="0.2"></path><polyline points="224 208 32 208 32 48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline><polyline points="224 96 160 152 96 104 32 160" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline></svg>
            </>
        )
    },
    {
        title: 'Componentes de interfaz de usuario',
        description: 'Acceda a una amplia gama de componentes para crear interfaces limpias y consistentes.',
        bgClass: 'bg-success-transparent',
        svgClass: 'svg-success',
        svgIcon: (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M128,129.09,32.7,76.93a8,8,0,0,0-.7,3.25v95.64a8,8,0,0,0,4.16,7l88,48.18a8,8,0,0,0,3.84,1Z" opacity="0.2"></path><polyline points="32.7 76.92 128 129.08 223.3 76.92" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline><line x1="128" y1="129.09" x2="128" y2="231.97" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><path d="M219.84,182.84l-88,48.18a8,8,0,0,1-7.68,0l-88-48.18a8,8,0,0,1-4.16-7V80.18a8,8,0,0,1,4.16-7l88-48.18a8,8,0,0,1,7.68,0l88,48.18a8,8,0,0,1,4.16,7v95.64A8,8,0,0,1,219.84,182.84Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><polyline points="81.56 48.31 176 100 176 152" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline></svg>
            </>
        )
    },
    {
        title: 'Diseño Responsivo',
        description: 'Asegúrese de que su panel de administración se vea bien en todos los dispositivos.',
        bgClass: 'bg-warning-transparent',
        svgClass: 'svg-warning',
        svgIcon: (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><rect x="64" y="56" width="128" height="144" opacity="0.2"></rect><rect x="64" y="24" width="128" height="208" rx="16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></rect><line x1="64" y1="56" x2="192" y2="56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="64" y1="200" x2="192" y2="200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line></svg>
            </>
        )
    },
    {
        title: 'Gestión de información',
        description: 'Administre y muestre grandes conjuntos de datos con componentes de tabla avanzados.',
        bgClass: 'bg-info-transparent',
        svgClass: 'svg-info',
        svgIcon: (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><rect x="32" y="104" width="56" height="96" opacity="0.2"></rect><path d="M32,56H224a0,0,0,0,1,0,0V192a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V56A0,0,0,0,1,32,56Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><line x1="32" y1="104" x2="224" y2="104" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="32" y1="152" x2="224" y2="152" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="88" y1="104" x2="88" y2="200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line></svg>
            </>
        )
    },
    {
        title: 'Formularios y Validación',
        description: 'Cree formularios sólidos con funciones de validación para recopilar y procesar sílabos.',
        bgClass: 'bg-danger-transparent',
        svgClass: 'svg-danger',
        svgIcon: (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M192,120,136,64l29.66-29.66a8,8,0,0,1,11.31,0L221.66,79a8,8,0,0,1,0,11.31Z" opacity="0.2"></path><path d="M92.69,216H48a8,8,0,0,1-8-8V163.31a8,8,0,0,1,2.34-5.65L165.66,34.34a8,8,0,0,1,11.31,0L221.66,79a8,8,0,0,1,0,11.31L98.34,213.66A8,8,0,0,1,92.69,216Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><line x1="136" y1="64" x2="192" y2="120" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="164" y1="92" x2="68" y2="188" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="95.49" y1="215.49" x2="40.51" y2="160.51" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line></svg>
            </>
        )
    },
    {
        title: 'Modo oscuro / Modo claro',
        description: 'Cambie entre los modos oscuro y claro para adaptarse a las preferencias del usuario.',
        bgClass: 'bg-teal-transparent',
        svgClass: 'svg-teal',
        svgIcon: (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M108.11,28.11A96.09,96.09,0,0,0,227.89,147.89,96,96,0,1,1,108.11,28.11Z" opacity="0.2"></path><path d="M108.11,28.11A96.09,96.09,0,0,0,227.89,147.89,96,96,0,1,1,108.11,28.11Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path></svg>
            </>
        )
    },
    {
        title: 'Notificaciones y alertas',
        description: 'Configure notificaciones y alertas en tiempo real para mantener a los usuarios informados.',
        bgClass: 'bg-orange-transparent',
        svgClass: 'svg-orange',
        svgIcon: (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M56,104a72,72,0,0,1,144,0c0,35.82,8.3,64.6,14.9,76A8,8,0,0,1,208,192H48a8,8,0,0,1-6.88-12C47.71,168.6,56,139.81,56,104Z" opacity="0.2"></path><path d="M96,192a32,32,0,0,0,64,0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M56,104a72,72,0,0,1,144,0c0,35.82,8.3,64.6,14.9,76A8,8,0,0,1,208,192H48a8,8,0,0,1-6.88-12C47.71,168.6,56,139.81,56,104Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path></svg>
            </>
        )
    },
    {
        title: 'Plantillas de sílabos',
        description: 'Elija entre una variedad de plantillas de sílabos prediseñadas para ahorrar tiempo.',
        bgClass: 'bg-purple-transparent',
        svgClass: 'svg-purple',
        svgIcon: (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><polygon points="152 32 152 88 208 88 152 32" opacity="0.2"></polygon><path d="M200,224H56a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h96l56,56V216A8,8,0,0,1,200,224Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><polyline points="152 32 152 88 208 88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline></svg>
            </>
        )
    },
];
interface CustomReview {
    title: string;
    stars: any;
    description: string;
    name: string;
    role: string;
    imgSrc: string;
    color: string;
}

const CustomReviews: CustomReview[] = [
    {
        title: "Experiencia de usuario",
        description: "Las plantillas personalizables y la interfaz clara e intuitiva facilitan el diseño de sílabos. Esto ha mejorado la eficiencia de nuestro equipo y nos ha permitido cumplir plazos ajustados con facilidad.",
        name: "Clara Johnson",
        role: "Administradora - UPC",
        imgSrc: "../assets/images/faces/1.jpg",
        color: "primary border-0",
        stars: (
            <>
                <i className="ri-star-fill me-1" />
                <i className="ri-star-fill me-1" />
                <i className="ri-star-fill me-1" />
                <i className="ri-star-fill me-1" />
                <i className="ri-star-half-line" />
            </>
        ),
    },
    {
        title: "Integración y compatibilidad",
        description: "Las funciones de integración son excelentes y han marcado una gran diferencia en la optimización de nuestro flujo de trabajo. Se integran a la perfección con nuestras herramientas existentes.",
        name: "Peter Hayes",
        role: "Administrador - UP",
        imgSrc: "../assets/images/faces/10.jpg",
        color: "success border-0",
        stars: (
            <>
                <i className="ri-star-fill me-1" />
                <i className="ri-star-fill me-1" />
                <i className="ri-star-fill me-1" />
                <i className="ri-star-fill me-1" />
                <i className="ri-star-half-line" />
            </>
        ),
    },
    {
        title: "Calidad del producto",
        description: "Este producto ha revolucionado nuestra estrategia de administración al ofrecer análisis en tiempo real y una experiencia fluida. Hemos observado mejoras significativas en la emisión de documentos.",
        name: "John Thompson",
        role: "Administrador - UL",
        imgSrc: "../assets/images/faces/9.jpg",
        color: "warning border-0",
        stars: (
            <>
                <i className="ri-star-fill me-1" />
                <i className="ri-star-fill me-1" />
                <i className="ri-star-fill me-1" />
                <i className="ri-star-fill me-1" />
                <i className="ri-star-half-line" />
            </>
        ),
    },
    {
        title: "Eficiencia",
        description: "Las herramientas de automatización nos han ahorrado muchísimo tiempo, especialmente en plazos críticos de gestión documentaria. Hemos podido reducir los retrasos y mejorar nuestros plazos de entrega.",
        name: "Ashley Miller",
        role: "Administrador - USIL",
        imgSrc: "../assets/images/faces/5.jpg",
        color: "info border-0",
        stars: (
            <>
                <i className="ri-star-fill me-1" />
                <i className="ri-star-fill me-1" />
                <i className="ri-star-fill me-1" />
                <i className="ri-star-fill me-1" />
                <i className="ri-star-half-line" />
            </>
        ),
    },
    {
        title: "Atención al cliente",
        description: "Excelente equipo de atención al cliente, siempre disponible y listo para resolver cualquier problema. Su dedicación a la hora de solucionar los problemas ha mejorado nuestra experiencia.",
        name: "Kevin Brown",
        role: "Administrador - PUCP",
        imgSrc: "../assets/images/faces/14.jpg",
        color: "danger border-0",
        stars: (
            <>
                <i className="ri-star-fill me-1" />
                <i className="ri-star-fill me-1" />
                <i className="ri-star-fill me-1" />
                <i className="ri-star-fill me-1" />
                <i className="ri-star-half-line" />
            </>
        ),
    },
    {
        title: "Rendimiento de Emisión",
        description: "Las herramientas y los análisis han mejorado significativamente nuestro proceso de emisión. Ahora puedo hacer un mejor seguimiento de los estudiantes, priorizar solicitudes y cerrar procesos con mayor eficiencia.",
        name: "Grace Lee",
        role: "Administradora - ESAN",
        imgSrc: "../assets/images/faces/3.jpg",
        color: "teal border-0",
        stars: (
            <>
                <i className="ri-star-fill me-1" />
                <i className="ri-star-fill me-1" />
                <i className="ri-star-fill me-1" />
                <i className="ri-star-fill me-1" />
                <i className="ri-star-half-line" />
            </>
        ),
    },
];

export const CustomReviewdata = CustomReviews.map((review, index) => (
    <div key={index}>
        <SpkTeststyleCard cardClass={review.color} style={review} />
    </div>
));
