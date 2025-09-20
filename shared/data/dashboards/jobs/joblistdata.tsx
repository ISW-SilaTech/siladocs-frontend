import { ReactNode } from "react";

interface Curso {
  id: string | number;
  curso: string;
  codigo: string;
  carrera: string;
  facultad: string;
  silabos: number;
  ano: number;
  status: "Active" | "Closed";
  malla: string;
  publicacion: string;
  svgIcon: ReactNode;
  color: string;
  imgSrc: string;
  svgClass: string;
}

export const CursosListData: Curso[] = [
  {
    id: "1",
    curso: "Programación I",
    codigo: "INF101",
    carrera: "Ingeniería de Sistemas",
    facultad: "Ingeniería",
    silabos: 2,
    ano: 2025,
    status: "Active",
    malla: "Plan 2023",
    publicacion: "Mar 01, 2025",
    svgIcon: (
      <>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
          <rect width="256" height="256" fill="none"></rect>
          <path d="M40,176V72A16,16,0,0,1,56,56H200a16,16,0,0,1,16,16V176Z" opacity="0.2"></path>
          <path
            d="M40,176V72A16,16,0,0,1,56,56H200a16,16,0,0,1,16,16V176"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="16"
          ></path>
        </svg>
      </>
    ),
    color: "success",
    imgSrc: "../../../assets/images/cursos/programacion1.png",
    svgClass: "primary",
  },
  {
    id: "2",
    curso: "Matemática Básica",
    codigo: "MAT101",
    carrera: "Ingeniería Civil",
    facultad: "Ingeniería",
    silabos: 1,
    ano: 2025,
    status: "Active",
    malla: "Plan 2022",
    publicacion: "Feb 20, 2025",
    svgIcon: (
      <>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
          <rect width="256" height="256" fill="none"></rect>
          <circle cx="128" cy="128" r="96" opacity="0.2"></circle>
          <circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeWidth="16"></circle>
        </svg>
      </>
    ),
    color: "info",
    imgSrc: "../../../assets/images/cursos/matematica.png",
    svgClass: "secondary",
  },
  {
    id: "3",
    curso: "Introducción al Derecho",
    codigo: "DER100",
    carrera: "Derecho",
    facultad: "Ciencias Jurídicas",
    silabos: 3,
    ano: 2024,
    status: "Closed",
    malla: "Plan 2021",
    publicacion: "Dic 15, 2024",
    svgIcon: (
      <>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
          <rect width="256" height="256" fill="none"></rect>
          <path
            d="M128,32,16,96l112,64,112-64Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="16"
            strokeLinejoin="round"
          ></path>
        </svg>
      </>
    ),
    color: "danger",
    imgSrc: "../../../assets/images/cursos/derecho.png",
    svgClass: "warning",
  },
  {
    id: "4",
    curso: "Contabilidad General",
    codigo: "ADM201",
    carrera: "Administración de Empresas",
    facultad: "Ciencias Empresariales",
    silabos: 2,
    ano: 2025,
    status: "Active",
    malla: "Plan 2022",
    publicacion: "Feb 10, 2025",
    svgIcon: (
      <>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
          <rect width="256" height="256" fill="none"></rect>
          <path
            d="M32,64H224V192H32Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="16"
            strokeLinejoin="round"
          ></path>
        </svg>
      </>
    ),
    color: "success",
    imgSrc: "../../../assets/images/cursos/contabilidad.png",
    svgClass: "info",
  },
  {
    id: "5",
    curso: "Fisiología Humana",
    codigo: "MED301",
    carrera: "Medicina",
    facultad: "Ciencias de la Salud",
    silabos: 4,
    ano: 2025,
    status: "Active",
    malla: "Plan 2025",
    publicacion: "Ene 05, 2025",
    svgIcon: (
      <>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
          <rect width="256" height="256" fill="none"></rect>
          <line x1="128" y1="32" x2="128" y2="224" stroke="currentColor" strokeWidth="16"></line>
        </svg>
      </>
    ),
    color: "success",
    imgSrc: "../../../assets/images/cursos/fisiologia.png",
    svgClass: "success",
  },
];
