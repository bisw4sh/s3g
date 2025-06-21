"use client";
import { Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(50),
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(50),
  confirmPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(50),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["newPassword"],
});

type TPasswordChange = z.infer<typeof passwordChangeSchema>;

const ResetPasswordComponent = () => {
  const router = useRouter();

  const form = useForm<TPasswordChange>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: TPasswordChange) {
    try {
      const { error } = await authClient.changePassword({
        newPassword: values.newPassword,
        currentPassword: values.currentPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        toast(error.message)
        throw new Error(error?.message)
      }


      router.push("/signin?message=Password%20changed%20successful");
    } catch (error) {
      console.error("Password reset failed : ", error);
      toast("Failed to reset password");
    }
  }

  return (
    <main className="min-h-[calc(100vh-10rem)] flex justify-center items-center inset-shadow-white">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 p-4 md:w-1/2 lg:1/3 h-1/2"
        >
          <h1 className="text-xl font-semibold">Change Password Page</h1>
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Current Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full cursor-pointer">Change Password</Button>
        </form>
      </Form>
    </main>
  );
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordComponent />
    </Suspense>
  );
}

