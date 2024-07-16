
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCPp-Rg1RNUwsupUytyiv-jOGXJaEuyF2c",
  authDomain: "dash-80ac3.firebaseapp.com",
  projectId: "dash-80ac3",
  storageBucket: "dash-80ac3.appspot.com",
  messagingSenderId: "891554325290",
  appId: "1:891554325290:web:ee89d73277d4cd7ff33453",
  measurementId: "G-G3MWQR4101"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
