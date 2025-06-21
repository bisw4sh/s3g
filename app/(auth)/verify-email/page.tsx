"use client"
//this is unused page, when we implement OTP based verification, we can use this
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const VerfiyEmailComponent = () => {
  const searchParams = useSearchParams()
  const otp = searchParams.get('otp') ?? ""
  const [value, setValue] = useState<string>(otp)

  const handleOTPSubmission = () => {
    console.log(value)
  }

  return (
    <main className="h-screen w-full flex justify-center items-center">
      <aside className="flex flex-col gap-8 justify-center items-center">
        <h1 className="scroll-m-20 text-center text-xl font-bold tracking-tight text-balance">
          Verify your mail: OTP is sent to it
        </h1>
        <InputOTP maxLength={4}
          value={value}
          onChange={(value) => setValue(value)}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={1} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
        <div className="text-center text-sm">
          {value.length < 4 ? (
            <>Enter your one-time password.</>
          ) : (
            <Button onClick={handleOTPSubmission}>Submit</Button>
          )}
        </div>
      </aside>
    </main>

  )
}

const VerifyEmail = () => {
  return (
    <Suspense>
      < VerfiyEmailComponent />
    </Suspense>
  )
}

export default VerifyEmail;
