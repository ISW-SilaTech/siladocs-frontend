"use client"

import Link from 'next/link';
import React, { Fragment } from 'react'

interface FooterProps { }

const Footer: React.FC<FooterProps> = () => {

  return (
    <Fragment>

      {/* <!-- Footer Start --> */}

      <footer className="footer mt-auto py-3 text-center">
        <div className="container">
          <span className="text-muted"> Copyright © <span id="year"> 2025 </span> <Link scroll={false}
            href="#!;" className="text-dark fw-medium">SilaDocs</Link>.
            Desarrollado por <Link scroll={false} target='_blank' href="https://spruko.com/">
              <span className="fw-medium text-primary">SilaTech</span>
            </Link> Todos los derecho reservados
          </span>
        </div>
      </footer>

      {/* <!-- Footer End --> */}

    </Fragment>
  )
}

export default Footer;
