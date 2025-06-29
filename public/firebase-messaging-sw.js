importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyBahSCpreWO_DxM92DBpL3Ltf2jUOS-RFw",
  authDomain: "s3g4llery.firebaseapp.com",
  projectId: "s3g4llery",
  storageBucket: "s3g4llery.firebasestorage.app",
  messagingSenderId: "877731492486",
  appId: "1:877731492486:web:ecd5b7c86372ec70589707",
  measurementId: "G-RCNNB4BT08"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a notification',
    icon: payload.notification?.icon || '/s3g.png',
    badge: '/s3g.png',
    tag: 'notification-tag',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/s3g.png'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// handle notification click; like redirect to the /notification on click on that notification
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.');
  event.notification.close();

  const url = 'http://localhost:3000/notifications';

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

