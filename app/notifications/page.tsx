"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Spinner } from "@/components/Loader";
import { LoaderScreen } from "@/components/LoaderScreen";
import { Notification } from "@/db/schema"

const limit = 10

const fetchNotifications = async ({ pageParam = 1 }): Promise<{
  data: Notification[];
  msg: string;
  count: number;
  limit: number;
  page: number;
  totalPages: number;
}> => {
  const notifications = await fetch(`/api/notifications?page=${pageParam}&limit=${limit}`)
  if (!notifications.ok) {
    throw new Error("Couldn't fetch the notifications")
  }
  return notifications.json()
}

export default function Home() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = observerRef.current;
    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, data?.pages.length]);

  const allNotifications = data?.pages.flatMap((page) => page.data) ?? [];

  // const handleMarkAsRead = async (d: string) => {
  //   try {
  //     await likeAPhoto({ url });
  //
  //     queryClient.setQueryData(["home-photos"], (oldData: typeof data) => {
  //       if (!oldData) return oldData;
  //
  //       return {
  //         ...oldData,
  //         pages: oldData.pages.map((page) => ({
  //           ...page,
  //           data: page.data.map((photo) => {
  //             if (photo.url === url) {
  //               return {
  //                 ...photo,
  //                 likes: {
  //                   ...photo.likes,
  //                   liked: true,
  //                   count: photo.likes.count + 1,
  //                 },
  //               };
  //             }
  //             return photo;
  //           }),
  //         })),
  //       };
  //     });
  //
  //     toast.success("Liked the image");
  //   } catch (error) {
  //     toast.error("Couldn't like the image");
  //     console.error(error);
  //   }
  // };


  if (isPending) return <LoaderScreen />;
  if (error) return <div className="min-h-screen flex justify-center items-center">Error fetching notifications</div>;

  return (
    <main className="w-full min-h-screen px-2 sm:px-8 md:px-16 lg:px-32 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {allNotifications.map((notification) => (
          <p key={notification.id}>{notification.id}</p>
        ))}

      </div>

      <div ref={observerRef} className="h-64 flex justify-center items-center">
        {isFetchingNextPage && <Spinner />}
      </div>
    </main >
  );
}

