import Link from "next/link";

export default function Me() {
  return (
    <main className="min-h-screen lg:px-[19rem] pt-16">
      <Link href="change-password" className="cursor-pointer">change password</Link>
    </main>
  )
}
