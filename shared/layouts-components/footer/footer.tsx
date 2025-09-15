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
            href="#!;" className="text-dark fw-medium">Vyzor</Link>.
            Designed with <span className="bi bi-heart-fill text-danger"></span> by <Link scroll={false} target='_blank' href="https://spruko.com/">
              <span className="fw-medium text-primary">Spruko</span>
            </Link> All
            rights
            reserved
          </span>
        </div>
      </footer>

      {/* <!-- Footer End --> */}

    </Fragment>
  )
}

export default Footer;