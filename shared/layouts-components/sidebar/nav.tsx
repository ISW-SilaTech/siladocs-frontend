

import SpkBadge from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge";
import * as Svgicons from "./menusvg-icons";

const badgePrimary = <SpkBadge variant="" Customclass="bg-primary-transparent ms-2">3</SpkBadge>
const badgeSucccess = <SpkBadge variant="" Customclass="bg-success-transparent ms-2">6</SpkBadge>
const badgeWarning = <SpkBadge variant="" Customclass="bg-warning-transparent ms-2">5</SpkBadge>
const badgeInfo = <SpkBadge variant="" Customclass="bg-info-transparent ms-2">4</SpkBadge>
const badgedanger = <SpkBadge variant="" Customclass="bg-danger-transparent ms-2">6</SpkBadge>
const badgeSuccess = <SpkBadge variant="" Customclass="bg-success-transparent ms-2">8</SpkBadge>

export const MENUITEMS: any = [

  {
    menutitle: 'MVP'
  },
  {
    title: "Principal", icon: Svgicons.Dashboardicon, type: "sub", active: false, dirchange: false, children: [

      { path: "/dashboards/school", type: "link", icon: Svgicons.Analyticsicon, active: false, selected: false, dirchange: false, title: "Dashboard" },
    ],
  },
  {
    title: "Gestión Académica", icon: Svgicons.Schoolicon, type: "sub", active: false, dirchange: false, children: [
      {
        title: "Gestión", type: "sub", badgetxt: badgePrimary, icon: Svgicons.Projectsicon, active: false, dirchange: false, children: [
          { path: "/projects/projects-list", type: "link", active: false, selected: false, dirchange: false, title: "Carreras" },
          { path: "/projects/mallas", type: "link", active: false, selected: false, dirchange: false, title: "Mallas" },
          { path: "/projects/cursos", type: "link", active: false, selected: false, dirchange: false, title: "Cursos" },
        ]
      },
            { path: "/core/carga-masiva", type: "link", icon: Svgicons.Cryptoicon, active: false, selected: false, dirchange: false, title: "Carga Masiva" },

    ],
  },
  {
    title: "Blockchain", icon: Svgicons.Cryptoicon, type: "sub", active: false, dirchange: false, children: [
      { path: "/core/blockchain", type: "link", icon: Svgicons.Cryptoicon, active: false, selected: false, dirchange: false, title: "Blockchain" },
      { path: "/blockchain/historial", type: "link", icon: Svgicons.Timelineicon, active: false, selected: false, dirchange: false, title: "Auditoría" }
    ],
  },
  {
    title: "Usuarios", icon: Svgicons.Profileicon, type: "sub", active: false, dirchange: false, children: [
      { path: "/users/teachers", type: "link", icon: Svgicons.Profileicon, active: false, selected: false, dirchange: false, title: "Profesores" },
      { path: "/users/students", type: "link", icon: Svgicons.Profileicon, active: false, selected: false, dirchange: false, title: "Alumnos" },
      { path: "/users/administrators", type: "link", icon: Svgicons.Profileicon, active: false, selected: false, dirchange: false, title: "Administradores" },
    ],
  },
  {
    title: "Configuración", icon: Svgicons.Profilesettingicon, type: "sub", active: false, dirchange: false, children: [
      { path: "/config/institution", type: "link", icon: Svgicons.Courseicon, active: false, selected: false, dirchange: false, title: "Institución" },
      { path: "/config/system", type: "link", icon: Svgicons.Courseicon, active: false, selected: false, dirchange: false, title: "Parámetros del sistema" },
      { path: "/config/preferences", type: "link", icon: Svgicons.Courseicon, active: false, selected: false, dirchange: false, title: "Preferencias" },
    ],
  }
]
