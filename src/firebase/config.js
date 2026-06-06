import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBRc381PKlAr-rkRpfRvNqXofeU4XEwGmM",
  authDomain: "momentum-309ce.firebaseapp.com",
  projectId: "momentum-309ce",
  storageBucket: "momentum-309ce.firebasestorage.app",
  messagingSenderId: "982625438740",
  appId: "1:982625438740:web:9b1a696ee32d55468a6b01"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);