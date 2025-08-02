import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAnH9lobhwvcpNH-SJneBfoP5qB6Z39ZDw",
  authDomain: "loomyz.firebaseapp.com",
  projectId: "loomyz",
  storageBucket: "loomyz.firebasestorage.app",
  messagingSenderId: "1086488682181",
  appId: "1:1086488682181:web:a00d20c1dac1c2f9599aac",
  measurementId: "G-4G4GSH14JZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
