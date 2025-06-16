"use client";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const signInSchema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(6, "Password must be at least 6 characters"),
})
type TSignIn = z.infer<typeof signInSchema>;

const SignInPage = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TSignIn>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit: SubmitHandler<TSignIn> = async (userData: TSignIn) => {
    try {
      const { error } = await authClient.signIn.email({
        email: userData.email,
        password: userData.password,
        callbackURL: "/",
      }, {
        onSuccess: (data) => {
          console.log(data)
          toast.success("SignIn Successful");
          router.push("/");
        },
        onError: (ctx) => {
          toast.error(ctx.error?.message || "SignIn failed");
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      console.error("SignIn failed:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <section className="w-full flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 w-full md:w-1/3 lg:w-1/3 flex flex-col justify-center items-center px-4 border py-8 rounded-md shadow-lg"
      >
        <div className="text-2xl font-semibold">Sign In to the s3g</div>

        {/* Email Field */}
        <div className="space-y-2 w-full">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="Enter your email address"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2 w-full">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password (min 6 characters)"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full hover:cursor-pointer"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </section>
  );
};

export default SignInPage;
