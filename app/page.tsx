"use client";
import Image from "next/image";
import { Photo } from "@/db/schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Spinner } from "@/components/Loader";
import { LoaderScreen } from "@/components/LoaderScreen";

const LIMIT = 6;

async function fetchPhotos({ pageParam = 1 }): Promise<{
  data: Photo[];
  page: number;
  totalPages: number;
}> {
  const res = await fetch(`/api/home?page=${pageParam}&limit=${LIMIT}`);
  if (!res.ok) throw new Error("Failed to fetch images");
  return res.json();
}

export default function Home() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["home-photos"],
    queryFn: fetchPhotos,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!observerRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPhotos = data?.pages.flatMap((page) => page.data) ?? [];

  if (status === "pending") return <LoaderScreen />;
  if (error) return <p>Error fetching images</p>;

  return (
    <main className="w-full min-h-screen px-2 sm:px-8 md:px-16 lg:px-32 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPhotos.map((photo) => (
          <div
            key={photo.url}
            className="border p-4 rounded-md shadow bg-white"
          >
            <Image
              src={photo.url}
              alt={photo.title}
              className="w-full h-64 object-cover mb-2 rounded-md"
              width={400}
              height={300}
            />
            <h2 className="text-xl font-semibold">{photo.title}</h2>
            <p className="text-gray-600">{photo.description}</p>
            <p className="text-sm text-gray-500 mt-1">By: {photo.author}</p>
          </div>
        ))}
      </div>

      <div ref={observerRef} className="h-64 flex justify-center items-center">
        {isFetchingNextPage && <Spinner />}
      </div>
    </main>
  );
}

