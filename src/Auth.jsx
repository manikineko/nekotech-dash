import { auth, db } from './firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
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
      isAdmin: false,
      isBan: false,
      createdAt: new Date(), // we need to      '
      servers: 1,
      LXC: 0,  // Initialize free server count
      customServers: [], // Initialize custom servers as an empty array
    });
  }
};
export const logOut = () => {
  return signOut(auth);
};

// Function to add a free server
export const addFreeServer = async (userId) => {
  const userDocRef = doc(db, 'users', userId);
  await setDoc(userDocRef, { freeServers: 1 }, { merge: true });
};

// Function to add a custom server
export const addCustomServer = async (userId, cores, ram) => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  const customServers = userDoc.exists() ? userDoc.data().customServers : [];
  customServers.push({ cores, ram });
  await setDoc(userDocRef, { customServers }, { merge: true });
};
export const removeCustomServer = async (userId, index) => {  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  const customServers = userDoc.exists() ? userDoc.data().customServers : [];
  customServers.splice(index, 1);
  await setDoc(userDocRef, { customServers }, { merge: true });
};

 
// Function to fetch user document
export const getUserDocument = async (uid) => {
  if (!uid) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    return { uid, ...userDoc.data() };
  } catch (error) {
    console.error('Error fetching user', error.message);
  }
};
