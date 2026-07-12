import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC5-Bu83Pi81S9zpdQdmzvk_V9Dfpkm19Y",
  authDomain: "lumina-e79aa.firebaseapp.com",
  projectId: "lumina-e79aa",
  storageBucket: "lumina-e79aa.firebasestorage.app",
  messagingSenderId: "872791701251",
  appId: "1:872791701251:web:da5c44227d653dd336db36"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);