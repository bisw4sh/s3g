"use client";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm Password is required"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type TSignUp = z.infer<typeof signUpSchema>;

const SignUpPage = () => {

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TSignUp>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit: SubmitHandler<TSignUp> = async (userData: TSignUp) => {
    try {
      const { data, error } = await authClient.signUp.email({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        callbackURL: "/", // Where to redirect after verification
      }, {
        onSuccess: (data) => {
          console.log("returned data", data)
          toast.success("Check your email for verification!");
          // router.push("/verify-email");
        },
        onError: (ctx) => {
          toast.error(ctx.error?.message || "Signup failed");
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      console.error("SignUp failed:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <section className="w-full flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 w-full md:w-1/3 lg:w-1/3 flex flex-col justify-center items-center px-4 border py-8 rounded-md shadow-lg"
      >
        <div className="text-2xl font-semibold">Sign Up to the s3g</div>

        {/* Name Field */}
        <div className="space-y-2 w-full">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

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

        {/* Confirm Password Field */}
        <div className="space-y-2 w-full">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full hover:cursor-pointer"
        >
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </Button>
      </form>
    </section>
  );
};

export default SignUpPage;
