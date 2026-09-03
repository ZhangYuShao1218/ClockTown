import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase } from "firebase/database";

// 此 RTDB 位於 asia-southeast1，預設的 <project>.firebaseio.com 會連到錯誤 region。
// 若部署環境未設定或設成了預設 region 的 URL，退回正確的 asia-southeast1 網址。
const FALLBACK_DATABASE_URL =
  "https://clocktown-8b847-default-rtdb.asia-southeast1.firebasedatabase.app";
const envDatabaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL;
const databaseURL =
  envDatabaseURL && !/firebaseio\.com/.test(envDatabaseURL)
    ? envDatabaseURL
    : FALLBACK_DATABASE_URL;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

export const loginAnonymously = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    throw error;
  }
};
