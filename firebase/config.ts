import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: "AIzaSyBahSCpreWO_DxM92DBpL3Ltf2jUOS-RFw",
  authDomain: "s3g4llery.firebaseapp.com",
  projectId: "s3g4llery",
  storageBucket: "s3g4llery.firebasestorage.app",
  messagingSenderId: "877731492486",
  appId: "1:877731492486:web:ecd5b7c86372ec70589707",
  measurementId: "G-RCNNB4BT08"
};

export const app = initializeApp(firebaseConfig);

let messaging: any = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

export { messaging };
