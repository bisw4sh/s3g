"use client";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Photo } from "@/db/schema";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useCallback } from "react";
import { ExtendedSession, useSession } from "@/lib/auth-client";
import { Trash } from 'lucide-react';
import { deletePhotoMyPhoto } from "./action";
import { toast } from "sonner";

async function fetchPhotos({ pageParam = 1, limit = 6 }: { pageParam?: number; limit?: number }): Promise<{
  data: Photo[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const res = await fetch(`/api/me/images?page=${pageParam}&limit=${limit}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch images");
  return res.json();
}

export default function Me() {
  const { data: session } = useSession() as { data: ExtendedSession };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["my-photos"],
    queryFn: fetchPhotos,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
  const queryClient = useQueryClient();

  const photos = data?.pages.flatMap(page => page.data) || [];

  const observerRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  const handleDelete = async (url: string) => {
    try {
      const result = await deletePhotoMyPhoto({ url })

      if (!result.success) {
        toast(result.error)
        return
      }

      toast(result.message)
      queryClient.invalidateQueries({
        queryKey: ["my-photos"],
      });
    } catch (error) {
      console.error(error)
      toast("couldn't delete")
    }
  }
  const isLoading = status === 'pending';

  return (
    <main className="min-h-screen lg:px-[15rem] px-1">
      {/* Banner and Profile Section */}
      <section className="relative">
        <div className="w-full h-64 bg-gray-200 overflow-hidden">
          <h1 className="absolute top-0 right-0 bg-white p-2 text-xl font-bold rounded-bl-lg">
            <p className="opacity-70">
              {session?.user?.name}
            </p>
          </h1>
          <Image
            src={session?.user?.coverUrl ? session?.user?.coverUrl : "/cover.jpg"}
            alt="cover image"
            width={1000}
            height={256}
            className="w-full h-64 object-cover"
            priority
          />

        </div>
        <div className="h-32 w-32 bg-white border-4 border-white rounded-full absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 lg:-left-10 lg:translate-x-0 overflow-hidden">
          <Image
            src={session?.user?.profileUrl ? session?.user?.profileUrl : session?.user?.image ? session?.user?.image : "/profile.jpg"}
            alt="profile image"
            width={128}
            height={128}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </section>

      {/* Profile Actions */}
      <div className="lg:px-[6rem] max-lg:pt-[4rem] p-4 lg:py-4 flex justify-start gap-6 bg-[#9ABBFF] rounded-b-lg">
        <Link href="/change-password" className="hover:underline font-medium underline-offset-4">
          Change Password
        </Link>
        <Link href="/edit-profile" className="hover:underline font-medium underline-offset-4">
          Edit Profile
        </Link>
        <Link href="/push-notification" className="hover:underline font-medium underline-offset-4">
          Push Notification
        </Link>

      </div>

      {/* Photo Grid */}
      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-md" />
          ))
        ) : error ? (
          <p className="text-red-500 col-span-full text-center">Failed to load images</p>
        ) : photos.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center">No images uploaded yet.</p>
        ) : (
          photos.map((photo: Photo, index: number) => (
            <div
              key={`${photo.url}-${index}`}
              className="group relative rounded-md overflow-hidden border bg-white shadow-sm"
            >
              <Image
                src={photo.url}
                alt={photo.title}
                width={400}
                height={256}
                className="w-full h-64 object-cover"
              />
              {/* Trash icon appears only on hover */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash
                  className="text-red-500 hover:stroke-red-600 hover:scale-110 cursor-pointer"
                  onClick={() => handleDelete(photo.url)}
                />
              </div>

              <div className="p-3">
                <p className="font-semibold truncate">{photo.title}</p>
                <p className="text-sm text-gray-500 line-clamp-2">{photo.description}</p>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Loading indicator and intersection observer trigger */}
      <div ref={observerRef} className="mt-8 flex justify-center">
        {isFetchingNextPage && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-md" />
            ))}
          </div>
        )}
        {!hasNextPage && photos.length > 0 && (
          <p className="text-gray-500 text-center py-8">No more photos to load</p>
        )}
      </div>
    </main>
  );
}
