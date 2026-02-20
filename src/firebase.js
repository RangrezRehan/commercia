import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA_4MqEq_L6Uf1X0lw-JfdfXIvLZVrGNIs",
  authDomain: "commercia-964d8.firebaseapp.com",
  projectId: "commercia-964d8",
  storageBucket: "commercia-964d8.firebasestorage.app",
  messagingSenderId: "35397519829",
  appId: "1:35397519829:web:4947c09775d9a7f1fa155c",
  measurementId: "G-XMFH11C4F3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);