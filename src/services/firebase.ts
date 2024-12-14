import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyCdA6kC5YBwyKxIbC48-UZWpKCEUDuVwMg",
  authDomain: "oceantribe-fe515.firebaseapp.com",
  databaseURL: "https://oceantribe-fe515-default-rtdb.firebaseio.com/",
  projectId: "oceantribe-fe515",
  storageBucket: "oceantribe-fe515.firebasestorage.app",
  messagingSenderId: "1041220018862",
  appId: "1:1041220018862:web:c401fe54250c3e92a0033f",
  measurementId: "G-BQNPZBB1XK",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
if (auth.currentUser) {
  console.log(auth.currentUser.uid);
}
const storage = getStorage(app);
const firestore = getFirestore(app);


// ユーザ登録
export const signup = async (email:any, password:any) => {
  try {
    // ユーザー作成
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // 登録後に自動ログイン状態にする
    console.log("ユーザー登録完了。UID:", user.uid);
    return user;
  } catch (error) {
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


export const onAuthStateChanged = firebaseOnAuthStateChanged;

export { auth, storage, firestore};
