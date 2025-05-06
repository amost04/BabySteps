// Firebase.js
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDw75qgXYV2o0U-8t-UYfDSv4SUr5PJVcs",
  authDomain: "babysteps-26690.firebaseapp.com",
  projectId: "babysteps-26690",
  storageBucket: "babysteps-26690.firebasestorage.app",
  messagingSenderId: "553709920582",
  appId: "1:553709920582:web:f4a48a15baa80689b1c547"
};

const app = initializeApp(firebaseConfig);

// 🔥 Inicializa `auth` de forma segura para evitar el error
initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export default app;
