import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Dedicated Google Cloud Firebase configuration for HSE OS
const firebaseConfig = {
  apiKey: "AIzaSyCFzNWsy9bgsBNsY_RYdG69iFNwVRyUaHU",
  authDomain: "hse-os-cloud.firebaseapp.com",
  projectId: "hse-os-cloud",
  storageBucket: "hse-os-cloud.firebasestorage.app",
  messagingSenderId: "168445116449",
  appId: "1:168445116449:web:d345ab94cc0f362b166360",
  measurementId: "G-0NMJNF876H"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore Database
export const db = getFirestore(app);
