import { auth, db } from './firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import axios from 'axios';

const provider = new GoogleAuthProvider();
const CONVOY_API_BASE_URL = 'https://cpanel.in-cloud.us/api';
const CONVOY_API_TOKEN = '1|3Bckfcpv1LhPiMAG0i6ycvbRAnLMtdof9RA5kkar'; // Replace with your actual token

axios.defaults.headers.common['Authorization'] = `Bearer ${CONVOY_API_TOKEN}`;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const signInWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, provider);
  await createUserDocument(userCredential.user);
  await ensureConvoyPanelAccount(userCredential.user);
  return userCredential;
};

export const signUp = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await createUserDocument(userCredential.user);
  await ensureConvoyPanelAccount(userCredential.user);
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
      createdAt: new Date(),
      servers: 1,
      LXC: [],
      VM: [],
      customServers: [],
    });
  }
};

export const logOut = () => {
  return signOut(auth);
};

export const addFreeServer = async (userId) => {
  const userDocRef = doc(db, 'users', userId);
  await setDoc(userDocRef, { freeServers: 1 }, { merge: true });
};

export const addCustomServer = async (userId, cores, ram) => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  const customServers = userDoc.exists() ? userDoc.data().customServers : [];
  customServers.push({ cores, ram });
  await setDoc(userDocRef, { customServers }, { merge: true });
};

export const removeCustomServer = async (userId, index) => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  const customServers = userDoc.exists() ? userDoc.data().customServers : [];
  customServers.splice(index, 1);
  await setDoc(userDocRef, { customServers }, { merge: true });
};

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

const ensureConvoyPanelAccount = async (user) => {
  try {
    await axios.get(`${CONVOY_API_BASE_URL}/users/${user.email}`);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      const password = generateRandomPassword();
      await axios.post(`${CONVOY_API_BASE_URL}/application/users`, {
        name: user.displayName || user.email,
        email: user.email,
        password: password,
        root_admin: false
      });
      // Save the password to the Firestore user document
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { convoyPassword: password }, { merge: true });
    } else {
      console.error('Error ensuring Convoy Panel account:', error.message);
    }
  }
};
export const getConvoyUserIdByEmail = async (email) => {
  try {
    const response = await axios.get(`${CONVOY_API_BASE_URL}/application/users`);
    const users = response.data.data;
    const user = users.find(u => u.email === email);
    if (user) {
      return user.id;
    } else {
      console.log('User not found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching Convoy Panel user ID:', error.message);
    return null;
  }
};


const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8); // Simple random password generator
};
