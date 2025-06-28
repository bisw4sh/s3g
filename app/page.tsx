"use client";
import Image from "next/image";
import { Photo } from "@/db/schema";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Spinner } from "@/components/Loader";
import { LoaderScreen } from "@/components/LoaderScreen";
import { useSession } from "@/lib/auth-client";
import { Heart, Trash } from "lucide-react";
import { toast } from "sonner";
import { EUserRole } from "@/types/common/roles";
import { likeAPhoto, unLikeAPhoto } from "./action";
import { FaHeart } from "react-icons/fa";

const LIMIT = 6;

type ModifiedPhotoData = Photo & {
  likes: {
    count: number,
    liked: boolean,
  }
}

async function fetchPhotos({ pageParam = 1 }): Promise<{
  data: ModifiedPhotoData[];
  page: number;
  totalPages: number;
}> {
  const res = await fetch(`/api/home?page=${pageParam}&limit=${LIMIT}`);
  if (!res.ok) throw new Error("Failed to fetch images");
  return res.json();
}

async function deletePhotoForAdmin({ url }: { url: string }) {
  const res = await fetch(`/api/admin/delete-photos`, {
    method: "POST",
    body: JSON.stringify({ url })
  })
  if (!res.ok) throw new Error("Failed to delete image")

  return res.json()
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

  const queryClient = useQueryClient();

  function useDeleteAdminPhoto() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: deletePhotoForAdmin,
      onSuccess: (data) => {
        toast(data.message || "Photo deleted");
        queryClient.invalidateQueries({ queryKey: ["home-photos"] });
      },
      onError: (err: Error) => {
        toast(err.message || "Could not delete photo");
      },
    });
  }

  const { mutateAsync: deletePhoto, isPending } = useDeleteAdminPhoto();
  const session = useSession()
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

  const handleDelete = async (url: string) => {
    try {
      if (session?.data?.user?.role !== EUserRole.ADMIN) return;
      await deletePhoto({ url });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLike = async (url: string) => {
    try {
      await likeAPhoto({ url });

      queryClient.setQueryData(["home-photos"], (oldData: typeof data) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((photo) => {
              if (photo.url === url) {
                return {
                  ...photo,
                  likes: {
                    ...photo.likes,
                    liked: true,
                    count: photo.likes.count + 1,
                  },
                };
              }
              return photo;
            }),
          })),
        };
      });

      toast.success("Liked the image");
    } catch (error) {
      toast.error("Couldn't like the image");
      console.error(error);
    }
  };

  const handleUnLike = async (url: string) => {
    try {
      await unLikeAPhoto({ url });

      queryClient.setQueryData(["home-photos"], (oldData: typeof data) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((photo) => {
              if (photo.url === url) {
                return {
                  ...photo,
                  likes: {
                    ...photo.likes,
                    liked: false,
                    count: Math.max(0, photo.likes.count - 1),
                  },
                };
              }
              return photo;
            }),
          })),
        };
      });

      toast.success("Unliked the image");
    } catch (error) {
      toast.error("Couldn't unlike the image");
      console.error(error);
    }
  };

  if (status === "pending") return <LoaderScreen />;
  if (error) return <p>Error fetching images</p>;
  if (isPending) return toast("deleting")

  return (
    <main className="w-full min-h-screen px-2 sm:px-8 md:px-16 lg:px-32 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPhotos.map((photo) => {
          return (
            <div
              key={photo.url}
              className="relative group border p-4 rounded-md shadow bg-white"
            >
              <Image
                src={photo.url}
                alt={photo.title}
                className="w-full h-64 object-cover mb-2 rounded-md"
                width={400}
                height={300}
              />
              <section className="flex gap-2">

                {session?.data ?
                  (photo?.likes?.liked ?
                    <FaHeart className="h-6 w-6 fill-red-600 cursor-pointer hover:scale-110"
                      onClick={() => handleUnLike(photo.url)} />
                    :
                    <Heart onClick={() => handleLike(photo.url)} className="cursor-pointer hover:stroke-red-600" />)
                  :
                  <FaHeart className="h-6 w-6 fill-red-600" />}

                <div>{photo?.likes?.count}</div>
              </section>
              {session?.data?.user?.role === EUserRole.ADMIN &&
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash
                    className="text-red-500 hover:stroke-red-600 hover:scale-110 cursor-pointer"
                    onClick={() => handleDelete(photo.url)}
                  />
                </div>
              }

              <h2 className="text-xl font-semibold">{photo.title}</h2>
              <p className="text-gray-600">{photo.description}</p>
              <p className="text-sm text-gray-500 mt-1">By: {photo.author}</p>
            </div>
          )
        })}
      </div>

      <div ref={observerRef} className="h-64 flex justify-center items-center">
        {isFetchingNextPage && <Spinner />}
      </div>
    </main >
  );
}

