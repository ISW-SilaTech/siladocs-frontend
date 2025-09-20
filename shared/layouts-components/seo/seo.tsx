"use client"

import React, { useEffect } from 'react';

const Seo = ({ title }: any) => {

  useEffect(() => {
    document.title = `siladocs - ${title}`
  }, [])

  return (
    <>
    </>
  )
}

export default Seo
