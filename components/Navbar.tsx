'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import S3GLogo from "./S3GLogo"

const Navbar = () => {
  const [zen, setZen] = useState(false)

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
        ? "top-6 w-[95%] md:w-[90%] max-w-5xl rounded-xl backdrop-blur-md bg-white/20 shadow-sm border border-white/30"
        : "top-0 w-full sm:px-8 md:px-16 lg:px-32 bg-transparent border-transparent shadow-none"
        }`}
    >
      <S3GLogo />
      <ul className="flex gap-2 sm:gap-3 md:gap-6 text-lg">
        <li><Link href="/" className="hover:underline max-md:hidden">home</Link></li>
        <li><Link href="https://biswashdhungana.com.np" className="hover:underline max-md:hidden">me</Link></li>
        <li><Link href="guidelines" className="hover:underline">guidelines</Link></li>
        <li><Link href="about" className="hover:underline">about</Link></li>
      </ul>
      <Button asChild>
        <Link href="/upload">Upload</Link>
      </Button>
    </section>
  )
}

export default Navbar
