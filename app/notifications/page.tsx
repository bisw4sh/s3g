"use client";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Spinner } from "@/components/Loader";
import { LoaderScreen } from "@/components/LoaderScreen";
import { Notification, notifications } from "@/db/schema";
import { Heart } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { markAsRead } from "./action";

const limit = 10;

const fetchNotifications = async ({ pageParam = 1 }): Promise<{
  data: Notification[];
  msg: string;
  count: number;
  limit: number;
  page: number;
  totalPages: number;
}> => {
  const res = await fetch(`/api/notifications?page=${pageParam}&limit=${limit}`);
  if (!res.ok) {
    throw new Error("Couldn't fetch the notifications");
  }
  return res.json();
};

export default function NotificationPage() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
  const query = useQueryClient()

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

  const handleMarkAsRead = async () => {
    try {
      await markAsRead();
      await query.invalidateQueries({ queryKey: ["notifications"] });
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  };
  if (isPending) return <LoaderScreen />;
  if (error)
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        Error fetching notifications
      </div>
    );

  return (
    <main className="w-full min-h-screen px-4 sm:px-8 md:px-16 lg:px-32 py-6 bg-white dark:bg-gray-950">
      <div className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Notifications
      </div>

      {allNotifications.some(notification => !notification.readStatus) ? (
        <Button
          onClick={handleMarkAsRead}
          variant="link"
          className="space-y-2 w-full cursor-pointer"
        >
          Mark All Read
        </Button>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`${!notification.readStatus ? "bg-gray-100 dark:bg-gray-800" : "bg-white dark:bg-gray-900"
              } rounded-2xl shadow-sm p-4 flex gap-4 items-start border border-gray-200 dark:border-gray-800`}
          >
            <div className="text-pink-500 dark:text-pink-400 mt-1">
              {notification.type === "like" && <Heart className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800 dark:text-white">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {notification.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {format(new Date(notification.createdAt as Date), "PPpp")}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div ref={observerRef} className="h-24 flex justify-center items-center">
        {isFetchingNextPage && <Spinner />}
      </div>
    </main >
  );
}

