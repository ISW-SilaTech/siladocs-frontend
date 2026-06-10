"use client"

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center min-vh-100 p-4">
      <p className="fw-bold text-primary mb-2" style={{ fontSize: "6rem", lineHeight: 1 }}>404</p>
      <h4 className="fw-semibold mb-2">Página no encontrada</h4>
      <p className="text-muted mb-4">
        La página que buscas no existe o no está disponible.
      </p>
      <Link href="/dashboards/general" className="btn btn-primary btn-w-lg">
        Volver al inicio
      </Link>
    </div>
  );
}
