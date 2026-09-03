import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase, ref } from "firebase/database";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

/**
 * App Check：只有從「已註冊網域」載入的頁面才拿得到通行 token，
 * 別人 clone 這份 code 連到本專案的 Firebase 會被 RTDB 拒絕。
 * VITE_RECAPTCHA_SITE_KEY 是公開值（可進 bundle）；留空則不啟用（例如自架者未設定時）。
 */
const recaptchaSiteKey = (import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined)?.trim();
if (recaptchaSiteKey) {
  if (import.meta.env.DEV) {
    // 本機開發：用固定的 debug token（VITE_APPCHECK_DEBUG_TOKEN）比較好管理——
    // 把同一串貼進 Firebase Console → App Check → Manage debug tokens 即可。
    // 未設定時退回 true，由 SDK 隨機產生一組並印在 console。
    const debugToken = (import.meta.env.VITE_APPCHECK_DEBUG_TOKEN as string | undefined)?.trim();
    (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string }).FIREBASE_APPCHECK_DEBUG_TOKEN =
      debugToken || true;
  }
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export const auth = getAuth(app);
export const db = getDatabase(app);

/**
 * 環境命名空間：同一個 Firebase 專案內用路徑前置詞把「正式」與「本機測試」分開。
 * 本機開發在 .env.local 設 VITE_DB_ENV="dev"；正式版在 Cloudflare Pages 的
 * 環境變數設 VITE_DB_ENV="prod"（未設定時預設 prod，避免誤判）。
 * 所有 RTDB 資料都掛在 envs/{DB_ENV}/... 底下。
 */
export const DB_ENV = (import.meta.env.VITE_DB_ENV as string | undefined)?.trim() || "prod";
export const DB_ROOT = `envs/${DB_ENV}`;

/** 把相對路徑（如 `rooms/ABCD/public`）前置成 `envs/{DB_ENV}/rooms/ABCD/public`。 */
export const np = (path: string) => `${DB_ROOT}/${path.replace(/^\/+/, "")}`;

/**
 * 命名空間化的 RTDB ref。
 * - `nref()`：指向環境根 `envs/{DB_ENV}`，用於 `update()` 時搭配相對路徑 key。
 * - `nref('rooms/ABCD')`：指向該環境底下的實際節點。
 */
export const nref = (path?: string) =>
  path ? ref(db, np(path)) : ref(db, DB_ROOT);

export const loginAnonymously = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    throw error;
  }
};
