"use client";
import { Suspense } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const forgotEmailSchema = z.object({
  email: z.string().min(3, { message: "Email is required" }).email()
})
type TForgotPassword = z.infer<typeof forgotEmailSchema>

const ForgotPasswordComponent = () => {
  // const router = useRouter();

  const form = useForm<TForgotPassword>({
    resolver: zodResolver(forgotEmailSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: TForgotPassword) {
    try {
      const { data, error } = await authClient.forgetPassword({
        email: values.email,
        redirectTo: `http://localhost:3000/reset-password`,
      });
      console.log("values", values)
      console.log("data", data)
      console.log("error", error)
      // router.push(`/message?type=info&heading=Check+your+email&content=Password+reset+link+has+been+sent+to+your+email+address+${values.email}`);
    } catch (error) {
      console.error("Password reset failed:", error);
    }
  };

  return (
    <main className="min-h-screen flex justify-center items-center inset-shadow-white">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6 md:w-1/2 lg:w-1/4 h-1/2">
          <h1 className="text-xl font-semibold">Forgot Password/ Reset Password Change Page</h1>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email to reset password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="cursor-pointer">Send Email</Button>
        </form>
      </Form>
    </main>
  );
};

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      < ForgotPasswordComponent />
    </Suspense>
  );
}

