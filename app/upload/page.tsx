"use client";
import { useState } from "react";
import { generateUploadUrl, savePhoto } from "./action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from 'next/image'
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner"

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  author: z.string().min(1, "Author is required"),
  file: z
    .instanceof(FileList)
    .transform((list) => list.item(0))
    .refine((file) => file !== null, {
      message: "Image is required",
    })
    .refine((file) => file !== null && file.size <= 5_000_000, {
      message: "Max size is 5MB",
    }),
});

type TUploadSchema = z.infer<typeof uploadSchema>;

const UploadPage = () => {
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<TUploadSchema>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      author: "",
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const onSubmit: SubmitHandler<TUploadSchema> = async (data: TUploadSchema) => {
    try {
      const originalFile = data.file as File;

      const extension = originalFile.name.split(".").pop() || "";
      const renamedFileName = `${uuidv4()}.${extension}`;

      const renamedFile = new File([originalFile], renamedFileName, {
        type: originalFile.type,
      });

      const url = await generateUploadUrl(renamedFile.name, renamedFile.type);

      await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": renamedFile.type },
        body: renamedFile,
      });

      await savePhoto({
        title: data.title,
        description: data.description,
        fileName: renamedFile.name,
        author: data.author,
      });

      toast("Upload successful!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast("Upload failed");
    }
  };

  return (
    <section className="w-full flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
      <div className="p-4 text-2xl font-semibold">Upload an image with description</div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full md:w-2/3 lg:w-1/2 flex flex-col justify-center items-center px-4 border py-4 rounded-md shadow-lg">
        <div className="space-y-2 w-full">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Enter title"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2 w-full">
          <Label htmlFor="file">Picture</Label>
          <Input
            id="file"
            type="file"
            accept="image/*"
            {...register("file", {
              onChange: handleFileChange
            })}
          />
          {errors.file && (
            <p className="text-red-500 text-sm">{errors.file.message as string}</p>
          )}

          {filePreview && (
            <Image
              src={filePreview}
              alt="Preview"
              className="rounded-md border border-gray-200"
              width={100}
              height={100}
            />
          )}
        </div>

        <div className="space-y-2 w-full">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="Enter description"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2 w-full">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            placeholder="Enter author"
            {...register("author")}
          />
          {errors.author && (
            <p className="text-red-500 text-sm">{errors.author.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full hover:cursor-pointer">
          {isSubmitting ? "Uploading..." : "Upload"}
        </Button>
      </form >
    </section >
  );
};

export default UploadPage;
