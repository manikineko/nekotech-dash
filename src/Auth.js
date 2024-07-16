import { auth, db } from './firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, provider);
  await createUserDocument(userCredential.user);
  return userCredential;
};

export const signUp = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await createUserDocument(userCredential.user);
  return userCredential;
};

const createUserDocument = async (user) => {
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      email: user.email,
      isAdmin: false, // Default to non-admin, modify as needed
      createdAt: new Date()
    });
  }
};

export const logOut = () => {
  return signOut(auth);
};
