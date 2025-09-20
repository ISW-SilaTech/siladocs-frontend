export interface Malla {
    malla: string;
    año: string;
    cursos: number;
    creditos: number;
    estado: string;
    descripción: string;
}

export const mallaData: Malla[] = [
    {
        malla: "Ingeniería de Software - Plan 2023",
        año: "2023",
        cursos: 45,
        creditos: 200,
        estado: "Activo",
        descripción: "Malla con enfoque en desarrollo ágil, cloud y seguridad."
    },
    {
        malla: "Ingeniería de Sistemas - Plan 2020",
        año: "2020",
        cursos: 42,
        creditos: 180,
        estado: "Inactivo",
        descripción: "Malla anterior, reemplazada por el plan 2023."
    },
    {
        malla: "Ingeniería de Sistemas - Plan 2023",
        año: "2023",
        cursos: 46,
        creditos: 190,
        estado: "Activo",
        descripción: "Malla con materias de Big Data, IA y Blockchain."
    },
    {
        malla: "Administración de Empresas - Plan 2022",
        año: "2022",
        cursos: 40,
        creditos: 160,
        estado: "Activo",
        descripción: "Incluye materias de innovación, liderazgo y transformación digital."
    },
    {
        malla: "Contabilidad - Plan 2021",
        año: "2021",
        cursos: 38,
        creditos: 150,
        estado: "Activo",
        descripción: "Enfocada en normas internacionales de contabilidad y auditoría."
    },
    {
        malla: "Derecho - Plan 2021",
        año: "2021",
        cursos: 48,
        creditos: 220,
        estado: "Suspendido",
        descripción: "En revisión por cambios en legislación nacional."
    },
    {
        malla: "Medicina - Plan 2025",
        año: "2025",
        cursos: 60,
        creditos: 300,
        estado: "En Revisión",
        descripción: "Nueva malla con mayor enfoque en simulación clínica."
    },
    {
        malla: "Arquitectura - Plan 2022",
        año: "2022",
        cursos: 50,
        creditos: 240,
        estado: "Activo",
        descripción: "Incluye diseño sostenible y urbanismo inteligente."
    },
    {
        malla: "Psicología - Plan 2023",
        año: "2023",
        cursos: 44,
        creditos: 180,
        estado: "Activo",
        descripción: "Orientada a neurociencia y psicología organizacional."
    },
    {
        malla: "Educación Inicial - Plan 2021",
        año: "2021",
        cursos: 36,
        creditos: 140,
        estado: "Inactivo",
        descripción: "Fue reemplazada por la versión actualizada en 2023."
    }
];

export const Projectselectdata = [
    { value: 'Reciente', label: 'Reciente' },
    { value: 'Fecha', label: 'Fecha' },
    { value: 'Tipo', label: 'Tipo' },
    { value: 'A - Z', label: 'A - Z' },
]

export const AvatarImages: string[] = [
    "../../../assets/images/faces/1.jpg",
    "../../../assets/images/faces/2.jpg",
    "../../../assets/images/faces/8.jpg",
    "../../../assets/images/faces/12.jpg",
    "../../../assets/images/faces/10.jpg",
    "../../../assets/images/faces/4.jpg",
    "../../../assets/images/faces/5.jpg",
    "../../../assets/images/faces/13.jpg"
];
