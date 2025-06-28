'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import S3GLogo from "./S3GLogo"
import { authClient } from "@/lib/auth-client"
import { ArrowUpFromLine, Bell, LogOut } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { EUserRole } from "@/types/common/roles"

const Navbar = () => {
  const [zen, setZen] = useState(false)
  const {
    data,
  } = authClient.useSession()
  const router = useRouter()

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
      <ul className="flex gap-2 sm:gap-3 md:gap-6 text-lg underline-offset-4">
        <li><Link href="/" className="relative inline-block max-md:hidden after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full">home</Link></li>
        <li><Link href="me" className="relative inline-block max-md:hidden after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full">me</Link></li>
        <li><Link href="guidelines" className="relative inline-block max-md:hidden after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full" >guidelines</Link></li>
        <li><Link href="about" className="relative inline-block max-md:hidden after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full">about</Link></li>
        {data?.user?.role === EUserRole.ADMIN.toLowerCase() ? <li><Link href="dashboard" className="relative inline-block max-md:hidden after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full">dashboard</Link></li> : null}
      </ul>

      <div className="flex items-center justify-center gap-2">
        {data ? (
          <div className="flex justify-center items-center gap-3">
            <Button asChild>
              <Link href="/upload">< ArrowUpFromLine /></Link>
            </Button>

            <Button className="cursor-pointer" asChild>
              {data?.user?.id ? <Link href="/notifications"><Bell /></Link> : null}
            </Button>

            <div onClick={async () => {
              await authClient.signOut()
              router.push("/")
            }} className="cursor-pointer">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="p-1" >
                    <LogOut className="h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign Out</p>
                </TooltipContent>
              </Tooltip>

            </div>
          </div>
        ) :

          <>
            <Button asChild>
              <Link href="/signin">Sign In</Link>
            </Button>

            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </>
        }

      </div>
    </section >
  )
}

export default Navbar
