"use client";
import { Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
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
import { toast } from "sonner";

const passwordResetSchema = z.object({
  newPassword: z.string().min(8, {
    message: "Password must be atleast 8 characters long"
  }).max(50)
})
type TPasswordReset = z.infer<typeof passwordResetSchema>

const ResetPasswordComponent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const form = useForm<TPasswordReset>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      newPassword: "",
    },
  })

  async function onSubmit(values: TPasswordReset) {
    if (!token) {
      toast("Missing token")
      return;
    }

    try {
      await authClient.resetPassword({
        token,
        newPassword: values.newPassword,
      });
      router.push("/signin?message=Password%20reset%20successful");
    } catch (error) {
      console.error("Password reset failed:", error);
    }
  };

  return (
    <main className="min-h-screen flex justify-center items-center inset-shadow-white">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-1/4 h-1/2">
          <h1 className="text-xl font-semibold"> Reset Password Page</h1>
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="New Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Reset Password</Button>
        </form>
      </Form>
    </main>
  );
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      < ResetPasswordComponent />
    </Suspense>
  );
}

