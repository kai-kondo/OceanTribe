import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCdA6kC5YBwyKxIbC48-UZWpKCEUDuVwMg",
  authDomain: "oceantribe-fe515.firebaseapp.com",
  projectId: "oceantribe-fe515",
  storageBucket: "oceantribe-fe515.firebasestorage.app",
  messagingSenderId: "1041220018862",
  appId: "1:1041220018862:web:c401fe54250c3e92a0033f",
  measurementId: "G-BQNPZBB1XK",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ユーザ登録
export const signup = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Success to Signup", userCredential.user);
    return userCredential;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// メール＆パスワードログイン
export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login Success!");
    return userCredential;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { auth };
