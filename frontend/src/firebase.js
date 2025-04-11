import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCJgzPPoQUNiZ0ch8hCEh9qiEJF36mDb84",
  authDomain: "edusyncaudio.firebaseapp.com",
  projectId: "edusyncaudio",
  storageBucket: "edusyncaudio.appspot.com", // ⚠️ sửa lại đuôi là appspot.com
  messagingSenderId: "222662004348",
  appId: "1:222662004348:web:479e614e90c7620e4543f9",
  measurementId: "G-WQD9E86KTL"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Storage
export const storage = getStorage(app);
