'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const Navbar = () => {
  const [zen, setZen] = useState(false)
  const s3gallery = "s3g"

  useEffect(() => {
    const onScroll = () => {
      setZen(window.scrollY > 40)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      className={`fixed left-1/2 transform -translate-x-1/2 flex justify-between items-center px-6 py-3 z-50 transition-all duration-1000 ease-in-out will-change-transform ${zen
          ? "top-6 w-[90%] max-w-5xl rounded-xl backdrop-blur-md bg-white/20 shadow-sm border border-white/30"
          : "top-0 w-full px-32 bg-transparent border-transparent shadow-none"
        }`}
    >
      <h1 className="font-bold text-3xl italic text-primary">{s3gallery}</h1>
      <ul className="flex gap-6 text-lg">
        <li><Link href="/">home</Link></li>
        <li><Link href="https://biswashdhungana.com.np">me</Link></li>
        <li><Link href="guidelines">guidelines</Link></li>
        <li><Link href="about">about</Link></li>
      </ul>
      <Button asChild>
        <Link href="/upload">Upload</Link>
      </Button>
    </section>
  )
}

export default Navbar
