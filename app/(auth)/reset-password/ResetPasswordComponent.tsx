"use client";
import { authClient } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";

export const ResetPasswordComponent = () => {
  const [password, setPassword] = useState<string>("asda");
  const searchParams = useSearchParams();
  const token: string | null = searchParams.get("token"); // Explicit type
  const router = useRouter(); // Correct hook for Next.js

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      console.error("Token is missing");
      return;
    } else if (!password) {
      console.error("Token is missing");
      return
    }


    await authClient.resetPassword({
      token,
      password,
    });

    router.push("/signin?message=Password%20reset%20successful");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Reset Password</button>
    </form>
  );
};
