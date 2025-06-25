"use client";

import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { Photo } from "@/db/schema";
import { useQuery } from "@tanstack/react-query";

async function fetchPhotos(): Promise<Photo[]> {
  const res = await fetch("/api/me/images");
  if (!res.ok) throw new Error("Failed to fetch images");
  const json = await res.json();
  return json.data;
}

export default function Me() {
  const { data: photos, isLoading, error } = useQuery<Photo[]>({
    queryKey: ["my-photos"],
    queryFn: fetchPhotos,
  });

  return (
    <main className="min-h-screen lg:px-[15rem] px-1">
      <div>
        <section className="relative">
          <div className="w-full h-64 rounded-lg bg-gray-200">
            <Suspense fallback={<Skeleton className="w-full h-64 rounded-lg" />}>
              <Image
                src="https://s5g.s3.ap-south-1.amazonaws.com/650a327b-91c1-4277-86a5-a891a4ef969a.jpeg"
                alt="cover image"
                width={1000}
                height={256}
                className="w-full h-64 rounded-t-lg object-cover"
                priority
              />
            </Suspense>
          </div>
          <div className="h-[8rem] w-[8rem] bg-white border rounded-full absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 lg:-left-10 lg:translate-x-0">
            <Suspense fallback={<Skeleton className="w-full h-full rounded-full" />}>
              <Image
                src="https://s5g.s3.ap-south-1.amazonaws.com/049909da-cd61-4430-a78a-ff8bd04c0147.png"
                alt="profile image"
                width={128}
                height={128}
                className="w-full h-full rounded-full object-cover p-1"
              />
            </Suspense>
          </div>
        </section>
      </div>

      <div className="lg:px-[6rem] max-lg:pt-[4rem] p-4 lg:py-4 flex justify-start gap-3 bg-[#9ABBFF] rounded-b-lg ">
        <Link href="/change-password" className="cursor-pointer hover:underline">
          change password
        </Link>
        <Link href="/edit-profile" className="cursor-pointer hover:underline">
          edit me
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {isLoading ? (
          Array(6)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-md" />)
        ) : error ? (
          <p className="text-red-500">Failed to load images</p>
        ) : (
          photos?.map((photo) => (
            <div key={photo.url} className="rounded-md overflow-hidden border">
              <Image
                src={photo.url}
                alt={photo.title}
                width={400}
                height={256}
                className="w-full h-64 object-cover"
              />
              <div className="p-2">
                <p className="font-semibold">{photo.title}</p>
                <p className="text-sm text-gray-500">{photo.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

