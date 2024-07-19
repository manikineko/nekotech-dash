import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import axios from 'axios'; // Import axios for API calls
import Header from './Header';
import SideBar from './SideBar';
import { getConvoyUserIdByEmail }from '../Auth'; // Import the getConvoyUserIdByEmail function
const CONVOY_API_BASE_URL = 'https://cpanel.in-cloud.us/api';
const CONVOY_API_TOKEN = '1|3Bckfcpv1LhPiMAG0i6ycvbRAnLMtdof9RA5kkar'; // Replace with your actual token

axios.defaults.headers.common['Authorization'] = `Bearer ${CONVOY_API_TOKEN}`;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const Conv = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [convoyPassword, setConvoyPassword] = useState(null);

  const fetchUser = async (user) => {
    try {
    
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({ ...user, ...userData });
        if (userData.convoyPassword) {
          setConvoyPassword(userData.convoyPassword);
        }
        if (userData.email) {
          const convoyId = await getConvoyUserIdByEmail(userData.email);
          console.log('convoyId', convoyId);
        }
      } else {
        setUser(user);
      }
    } catch (error) {
      console.error('Error fetching user', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUser(user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex h-screen bg-gray-800 text-white">
      <SideBar />
      <main className="flex-1 p-8 bg-gray-800 rounded-tl-lg overflow-y-auto">
        <div className="container mx-auto p-4">
          <Header />
          <div className="bg-gray-900 shadow-md rounded-md p-4">
            <h2 className="text-lg font-semibold mb-2">Convoy Panel 📟</h2>
            {loading ? (
              <p>Loading...</p>
            ) : user ? (
              <div>
                <p>Welcome, 「 ✦ {user.email} ✦ 」👋</p>
                {convoyPassword && (
                  <p>Your Convoy Panel password is: {convoyPassword}</p>
                )}
              </div>
            ) : (
              <p>👋 Please log in to view your Convoy Panel information.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Conv;
