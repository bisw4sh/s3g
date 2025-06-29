"use client"

import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { isSupported } from "firebase/messaging";
import { toast } from "sonner";
import { messaging } from "@/firebase/config";

export default function About() {
  const [fcmStatus, setFcmStatus] = useState<'loading' | 'supported' | 'unsupported' | 'error'>('loading');
  const [tokenStatus, setTokenStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  useEffect(() => {
    const setupFCM = async () => {
      try {
        if (typeof window === 'undefined') {
          console.log('Not in browser environment');
          return;
        }

        const supported = await isSupported();
        if (!supported) {
          setFcmStatus('unsupported');
          toast.error("Push notifications are not supported in this browser");
          return;
        }

        if (!('serviceWorker' in navigator)) {
          setFcmStatus('unsupported');
          toast.error("Service Worker not supported");
          return;
        }

        const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
        if (!isSecureContext) {
          console.log('Not in secure context');
          setFcmStatus('unsupported');
          toast.error("Push notifications require HTTPS");
          return;
        }

        setFcmStatus('supported');
        console.log('FCM is supported, proceeding with setup...');

        let registration;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            console.log(`Registering service worker (attempt ${retryCount + 1}/${maxRetries})...`);

            // First, clear any existing registrations
            const existingRegistrations = await navigator.serviceWorker.getRegistrations();
            for (const reg of existingRegistrations) {
              if (reg.scope.includes('firebase-messaging-sw.js')) {
                console.log('Unregistering existing service worker...');
                await reg.unregister();
              }
            }

            // Register new service worker
            registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
              scope: '/',
              updateViaCache: 'none' // Prevent caching issues
            });

            console.log('Service Worker registered successfully:', registration);

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;
            console.log('Service Worker is ready');

            // Additional wait for registration to complete
            await new Promise(resolve => setTimeout(resolve, 2000));
            break; // Success, exit retry loop

          } catch (swError) {
            retryCount++;
            console.error(`Service Worker registration failed (attempt ${retryCount}):`, swError);

            if (retryCount >= maxRetries) {
              setFcmStatus('error');
              toast.error('Failed to register service worker after multiple attempts');
              return;
            }

            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }

        // Step 3: Request notification permission
        console.log('Requesting notification permission...');
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          console.log('Notification permission not granted:', permission);
          if (permission === "denied") {
            toast.error("Notification permission denied. Please enable notifications in browser settings.");
          } else {
            toast.warning("Notification permission dismissed");
          }
          return;
        }

        console.log("Notification permission granted");

        // Step 4: Get FCM token with retry logic
        let token = null;
        retryCount = 0;
        const tokenRetries = 3;

        while (retryCount < tokenRetries && !token) {
          try {
            console.log(`Getting FCM token (attempt ${retryCount + 1}/${tokenRetries})...`);

            // Try different approaches based on retry count
            const tokenOptions: {
              vapidKey: string;
              serviceWorkerRegistration?: ServiceWorkerRegistration;
            } = {
              vapidKey: process.env.FCM_VAPIDKEY || "BHy7Nkj5FRv84Ofg5jfnOEY5mjv3IpsVoF1SkiPKZg_0dq-mBZiwWV4ohPSDaPWnKVyr-5eRzHfBkX1VGxm0QfU"
            };

            // Include service worker registration if available
            if (registration) {
              tokenOptions.serviceWorkerRegistration = registration;
            }

            token = await getToken(messaging, tokenOptions);

            if (token) {
              console.log("FCM Token obtained:", token);
              setTokenStatus('success');
              break;
            } else {
              console.log("No token returned");
            }

          } catch (tokenError: unknown) {
            retryCount++;
            console.error(`FCM token error (attempt ${retryCount}):`, tokenError);

            // Handle specific error types with proper type checking
            const isError = tokenError instanceof Error;
            const errorName = isError ? tokenError.name : 'UnknownError';
            const errorMessage = isError ? tokenError.message : String(tokenError);

            if (errorName === 'AbortError') {
              console.log('Push service registration aborted, this may be browser-specific');

              // Try alternative approach for problematic browsers
              if (retryCount < tokenRetries) {
                console.log('Waiting longer before retry for push service...');
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
              }
            }

            if (retryCount >= tokenRetries) {
              setTokenStatus('failed');

              // Provide specific error messages
              if (errorName === 'AbortError') {
                toast.error("Push notifications may not be supported in this browser. Try using Chrome or Firefox.");
              } else if (errorMessage.includes('service worker')) {
                toast.error("Service worker issue. Please refresh the page and try again.");
              } else {
                toast.error("Failed to setup push notifications. Please try again later.");
              }

              console.error("Final FCM token error:", tokenError);
              return;
            }

            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
          }
        }

        // Step 5: Save token to server
        if (token) {
          try {
            console.log("Saving token to server...");
            const response = await fetch("/api/push-notification", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ notificationToken: token }),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Token save response:", result);

            if (result.success) {
              toast.success("Push notifications enabled successfully!");
            } else {
              toast.error("Failed to save notification token");
              console.error("Server error:", result.error);
            }
          } catch (apiError) {
            console.error("API call failed:", apiError);
            toast.error("Failed to save token to server");
          }
        } else {
          toast.warning("No notification token available");
        }

      } catch (error) {
        console.error("FCM setup error:", error);
        setFcmStatus('error');
        toast.error("Failed to setup push notifications");
      }
    };

    setupFCM();
  }, []);

  return (
    <main className="min-h-screen lg:px-[19rem] md:px-32 px-4 pt-16">
      <h1 className="font-semibold text-2xl text-center">Push Notification Status</h1>

      {/* Debug information */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">FCM Status</h2>
        <p>Support Status: <span className={`font-bold ${fcmStatus === 'supported' ? 'text-green-600' : fcmStatus === 'unsupported' ? 'text-red-600' : fcmStatus === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>
          {fcmStatus}
        </span></p>
        <p>Token Status: <span className={`font-bold ${tokenStatus === 'success' ? 'text-green-600' : tokenStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>
          {tokenStatus}
        </span></p>

        {fcmStatus === 'unsupported' && (
          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded">
            <p className="text-sm">Try using Chrome, Firefox, or Edge browser for better compatibility.</p>
          </div>
        )}

        {tokenStatus === 'failed' && (
          <div className="mt-2 p-2 bg-red-100 border border-red-400 rounded">
            <p className="text-sm">Push notification setup failed. This may be due to browser restrictions or network issues.</p>
          </div>
        )}
      </div>
    </main>
  );
}
