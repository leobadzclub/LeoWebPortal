import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAeoJRzOWzfHK1sVWOascWWQLxAXnc3ZZA",
  authDomain: "project-60c0655a-7935-4ac9-8f9.firebaseapp.com",
  projectId: "project-60c0655a-7935-4ac9-8f9",
  storageBucket: "project-60c0655a-7935-4ac9-8f9.firebasestorage.app",
  messagingSenderId: "102044690948",
  appId: "1:102044690948:web:c5013b3e37dc8767592351"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;