"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MessagePageWrapper() {
  return (
    <Suspense>
      <MessagePage />
    </Suspense>
  );
}

type MessageType = "info" | "success" | "warning" | "error" | "default";

const MessagePage = () => {
  const searchParams = useSearchParams();
  const content = searchParams.get("content");
  const type = (searchParams.get("type") || "default") as MessageType;
  const heading = searchParams.get("heading");

  const messageStyles: Record<MessageType, {
    bg: string;
    border: string;
    text: string;
    icon: React.ReactNode;
    toast: (msg: string) => void;
  }> = {
    info: {
      bg: "bg-blue-100 dark:bg-blue-900/50",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-800 dark:text-blue-200",
      icon: <Info className="w-5 h-5" />,
      toast: (msg) => toast.info(msg)
    },
    success: {
      bg: "bg-green-100 dark:bg-green-900/50",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-800 dark:text-green-200",
      icon: <CheckCircle2 className="w-5 h-5" />,
      toast: (msg) => toast.success(msg)
    },
    warning: {
      bg: "bg-yellow-100 dark:bg-yellow-900/50",
      border: "border-yellow-200 dark:border-yellow-800",
      text: "text-yellow-800 dark:text-yellow-200",
      icon: <AlertTriangle className="w-5 h-5" />,
      toast: (msg) => toast.warning(msg)
    },
    error: {
      bg: "bg-red-100 dark:bg-red-900/50",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-800 dark:text-red-200",
      icon: <XCircle className="w-5 h-5" />,
      toast: (msg) => toast.error(msg)
    },
    default: {
      bg: "bg-gray-100 dark:bg-gray-900/50",
      border: "border-gray-200 dark:border-gray-800",
      text: "text-gray-800 dark:text-gray-200",
      icon: <Info className="w-5 h-5" />,
      toast: (msg) => toast(msg)
    }
  };

  const currentStyle = messageStyles[type];

  useEffect(() => {
    if (content) {
      currentStyle.toast(content);
    }
  }, [content, currentStyle]);

  return (
    <main className="min-h-[calc(100vh-25rem)] flex flex-col justify-around items-center">
      {content && (
        <div className={cn(
          "w-full border-b p-4 text-center",
          currentStyle.bg,
          currentStyle.border,
          currentStyle.text
        )}>
          <div className="container mx-auto flex items-center justify-center gap-3">
            {currentStyle.icon}
            <div>
              {heading && (
                <h2 className="text-lg font-bold">{heading}</h2>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full md:w-1/2 lg:1/4">
        {content}
      </div>
    </main>
  );
};
