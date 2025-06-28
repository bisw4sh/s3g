"use client";
import { z } from "zod";
import Image from 'next/image'
import { toast } from "sonner"
import { useState } from "react";
import { v4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { generateUploadUrl, savePhoto } from "./action";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const editProfileSchema = z.object({
  name: z.string().optional(),
  profileImage: z
    .any()
    .refine(
      (files) => !files || files?.[0]?.size <= 5_000_000,
      "Max size is 5MB"
    )
    .optional(),
  coverImage: z
    .any()
    .refine(
      (files) => !files || files?.[0]?.size <= 5_000_000,
      "Max size is 5MB"
    )
    .optional()
}).refine(
  (data) => {
    const filled = [
      typeof data.name !== "undefined",
      typeof data.profileImage !== "undefined",
      typeof data.coverImage !== "undefined"
    ].filter(Boolean).length;

    return filled === 1 || filled === 3;
  },
  {
    message: "You must provide either exactly one field or all three",
    path: ["form"],
  }
)

type TEditProfile = z.infer<typeof editProfileSchema>;

const UploadPage = () => {
  const [filePreview, setFilePreview] = useState<{
    profileUrl?: string
    coverUrl?: string
  }>({
    profileUrl: undefined,
    coverUrl: undefined
  });
  const session = useSession()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<TEditProfile>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: "",
      profileImage: "",
      coverImage: "",
    }
  });

  const router = useRouter()

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview((prev) => ({
          ...prev,
          coverUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview((prev) => ({
        ...prev,
        coverUrl: undefined
      }));
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview((prev) => ({
          ...prev,
          profileUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview((prev) => ({
        ...prev,
        profileUrl: undefined
      }));
    }
  };

  const onSubmit: SubmitHandler<TEditProfile> = async (data: TEditProfile) => {
    try {
      if (!session?.data?.user?.id || !session.data.user.email) {
        toast("Unauthenticated");
        return;
      }

      const updates: Record<string, string | undefined> = {
        name: data?.name,
        profileUrl: undefined,
        coverUrl: undefined,
      };

      // --- Profile Image ---
      const profileFile = data.profileImage?.[0];
      if (profileFile) {
        const profileExt = profileFile.name.split(".").pop() || "jpg";
        const profileFilename = `${v4()}.${profileExt}`;

        const presignedUrl = await generateUploadUrl(profileFilename, profileFile.type);
        await fetch(presignedUrl, {
          method: "PUT",
          headers: { "Content-Type": profileFile.type },
          body: profileFile,
        });

        updates.profileUrl = `${process.env.NEXT_PUBLIC_BUCKET_URL}/${profileFilename}`;
      }

      // --- Cover Image ---
      const coverFile = data.coverImage?.[0];
      if (coverFile) {
        const coverExt = coverFile.name.split(".").pop() || "jpg";
        const coverFilename = `${v4()}.${coverExt}`;

        const presignedUrl = await generateUploadUrl(coverFilename, coverFile.type);
        await fetch(presignedUrl, {
          method: "PUT",
          headers: { "Content-Type": coverFile.type },
          body: coverFile,
        });

        updates.coverUrl = `${process.env.NEXT_PUBLIC_BUCKET_URL}/${coverFilename}`;
      }

      const result = await savePhoto({
        name: data.name,
        profileUrl: updates.profileUrl,
        coverUrl: updates.coverUrl
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to save profile");
      }
      toast("Upload successful!");
      router.push("/me");
    } catch (error) {
      console.error("Upload failed:", error);
      toast("Upload failed");
    }
  };

  return (
    <section className="w-full flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
      <div className="p-4 text-2xl font-semibold">Edit the profile information</div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full md:w-2/3 lg:w-1/2 flex flex-col justify-center items-center px-4 border py-4 rounded-md shadow-lg">
        <div className="space-y-2 w-full">
          <Label htmlFor="name">name</Label>
          <Input
            id="name"
            placeholder="Enter name"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2 w-full">
          <Label htmlFor="profileImage">Profile Picture</Label>
          <Input
            id="profileImage"
            type="file"
            accept="image/*"
            {...register("profileImage")}
            onChange={handleProfileImageChange}
          />
          {errors.profileImage && (
            <p className="text-red-500 text-sm">{errors.profileImage.message as string}</p>
          )}

          {filePreview?.profileUrl && (
            <Image
              src={filePreview.profileUrl}
              alt="Preview"
              className="rounded-md border border-gray-200"
              width={100}
              height={100}
            />
          )}
        </div>

        <div className="space-y-2 w-full">
          <Label htmlFor="coverImage">Cover Picture</Label>
          <Input
            id="coverImage"
            type="file"
            accept="image/*"
            {...register("coverImage")}
            onChange={handleCoverImageChange}
          />
          {errors.coverImage && (
            <p className="text-red-500 text-sm">{errors.coverImage.message as string}</p>
          )}

          {filePreview?.coverUrl && (
            <Image
              src={filePreview.coverUrl}
              alt="Preview"
              className="rounded-md border border-gray-200"
              width={100}
              height={100}
            />
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full hover:cursor-pointer">
          {isSubmitting ? "Uploading..." : "Upload"}
        </Button>
      </form>
    </section>
  );
};

export default UploadPage;
