// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAw-EijNH88jZ3Ys05YatC8B1N1LoaIwpg",
  authDomain: "road-damage-detection-76cd5.firebaseapp.com",
  projectId: "road-damage-detection-76cd5",
  storageBucket: "road-damage-detection-76cd5.firebasestorage.app",
  messagingSenderId: "333365650633",
  appId: "1:333365650633:web:ce49e14ff16594d2ae5918",
  measurementId: "G-8NBEH898BD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const db = getFirestore(app);
// const analytics = getAnalytics(app);
export { auth, db };