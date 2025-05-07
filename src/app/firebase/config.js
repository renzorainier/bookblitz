import { initializeApp, getApps, getApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyBykDePwgICOh6YNX1C4XnAVknyBRCiqZA",
  authDomain: "dsafinalproj.firebaseapp.com",
  projectId: "dsafinalproj",
  storageBucket: "dsafinalproj.firebasestorage.app",
  messagingSenderId: "810212313034",
  appId: "1:810212313034:web:28e454dec42cfc28d33133"
};



  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  export { auth, db, storage,  };

