import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          setIsAuthenticated(true);
          if (requireAdmin) {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              setIsAdmin(userDoc.data().isAdmin);
              consent.log('User is an admin');
            } else {
              setIsAdmin(false);
            }
          } else {
            setIsAdmin(null);
          }
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      });
    };

    checkAuth();
  }, [requireAdmin]);

  if (isAuthenticated === null || (requireAdmin && isAdmin === null)) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
