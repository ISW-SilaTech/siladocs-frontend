
export interface Project {
    carrera: string;
    facultad: string;
    ciclos: number;
    actualización: string;
    estado: string;
    team: string[];
    extraTeam: number;
}

export const projectData: Project[] = [
    {
        carrera: "Ingeniería de Software",
        facultad: "Ingeniería",
        ciclos: 10,
        actualización: "2025-03-15",
        estado: "En Revisión",
        team: [
            "../../../assets/images/faces/2.jpg",
            "../../../assets/images/faces/8.jpg",
            "../../../assets/images/faces/2.jpg",
            "../../../assets/images/faces/10.jpg",
        ],
        extraTeam: 2
    },
    {
        carrera: "Medicina",
        facultad: "Ciencias de la Salud",
        ciclos: 10,
        actualización: "2025-02-11",
        estado: "Activo",
        team: [
            "../../../assets/images/faces/5.jpg",
            "../../../assets/images/faces/7.jpg",
            "../../../assets/images/faces/9.jpg",
        ],
        extraTeam: 4
    },
    {
        carrera: "Derecho",
        facultad: "Ciencias Jurídicas",
        ciclos: 10,
        actualización: "2024-12-01",
        estado: "Suspendido",
        team: [
            "../../../assets/images/faces/3.jpg",
            "../../../assets/images/faces/6.jpg",
        ],
        extraTeam: 6
    },
    {
        carrera: "Arquitectura",
        facultad: "Arquitectura y Diseño",
        ciclos: 10,
        actualización: "2025-01-08",
        estado: "Activo",
        team: [
            "../../../assets/images/faces/1.jpg",
            "../../../assets/images/faces/4.jpg",
            "../../../assets/images/faces/7.jpg",
            "../../../assets/images/faces/9.jpg",
        ],
        extraTeam: 3
    },
    {
        carrera: "Administración de Empresas",
        facultad: "Ciencias Económicas",
        ciclos: 10,
        actualización: "2024-10-29",
        estado: "En Revisión",
        team: [
            "../../../assets/images/faces/10.jpg",
            "../../../assets/images/faces/6.jpg",
        ],
        extraTeam: 5
    },
    {
        carrera: "Psicología",
        facultad: "Ciencias Sociales",
        ciclos: 10,
        actualización: "2025-03-12",
        estado: "Activo",
        team: [
            "../../../assets/images/faces/8.jpg",
            "../../../assets/images/faces/2.jpg",
            "../../../assets/images/faces/3.jpg",
        ],
        extraTeam: 1
    },
    {
        carrera: "Contaduría Pública",
        facultad: "Ciencias Económicas",
        ciclos: 10,
        actualización: "2024-11-21",
        estado: "Inactivo",
        team: [
            "../../../assets/images/faces/4.jpg",
            "../../../assets/images/faces/5.jpg",
        ],
        extraTeam: 7
    },
    {
        carrera: "Ingeniería Civil",
        facultad: "Ingeniería",
        ciclos: 10,
        actualización: "2025-02-17",
        estado: "Activo",
        team: [
            "../../../assets/images/faces/7.jpg",
            "../../../assets/images/faces/1.jpg",
            "../../../assets/images/faces/9.jpg",
            "../../../assets/images/faces/2.jpg",
        ],
        extraTeam: 2
    },
    {
        carrera: "Comunicación Social",
        facultad: "Ciencias Humanas",
        ciclos: 10,
        actualización: "2025-01-19",
        estado: "En Revisión",
        team: [
            "../../../assets/images/faces/6.jpg",
            "../../../assets/images/faces/8.jpg",
        ],
        extraTeam: 4
    },
    {
        carrera: "Biología",
        facultad: "Ciencias Naturales",
        ciclos: 10,
        actualización: "2025-03-01",
        estado: "Activo",
        team: [
            "../../../assets/images/faces/10.jpg",
            "../../../assets/images/faces/3.jpg",
            "../../../assets/images/faces/5.jpg",
            "../../../assets/images/faces/1.jpg",
        ],
        extraTeam: 3
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
