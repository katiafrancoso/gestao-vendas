

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC-3VHp0QToZ-fe_cmM2rlrj6kKg0nT_hk",
  authDomain: "app-vendas-c8418.firebaseapp.com",
  projectId: "app-vendas-c8418",
  storageBucket: "app-vendas-c8418.firebasestorage.app",
  messagingSenderId: "819729171031",
  appId: "1:819729171031:web:b9d70f14114706b969d912"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
