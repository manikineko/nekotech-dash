import React, { useEffect, useState } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { Resizable } from 're-resizable';
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from '../Comps/ui/avatar';
import {
  HomeIcon,
  ServerIcon,
  ActivityIcon,
  ReceiptIcon,
  StoreIcon,
  SettingsIcon
} from '../Comps/ui/Icons';
import { SiIcon } from 'react-icons/si';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { WiHail } from 'react-icons/wi';
import { BsCloud } from 'react-icons/bs';

const SideBar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async (user) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUser({ ...user, ...userDoc.data() });
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    anime({
      targets: '.sidebar-animation',
      translateY: [-20, 0],
      opacity: [0, 1],
      duration: 1000,
      easing: 'easeOutQuad',
      delay: 500,
    });
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/login';
  };

  return (
    <aside className="flex flex-col w-34 p-4 bg-gray-900">
      <div className="flex items-center justify-center h-16 mb-8">
        <img src="/logo.svg" alt="Neko-Astral Logo" className="w-12 h-12" />
      </div>
      <nav className="flex-1 space-y-4 sidebar-animation">
        <a href="/" className="flex items-center px-4 py-2 space-x-2 rounded-md hover:bg-gray-700 hover:animate-fadeIn">
          <HomeIcon className="w-5 h-5" />
          <span>Home</span>
        </a>
        <a href="/Servers" className="flex items-center px-4 py-2 space-x-2 rounded-md hover:bg-gray-700 hover:animate-fadeIn">
          <ServerIcon className="w-5 h-5" />
          <span>Servers</span>
        </a>
        <a href="/conv" className="flex items-center px-4 py-2 space-x-2 rounded-md hover:bg-gray-700 hover:animate-fadeIn">
          <BsCloud className="w-5 h-5" />
          <span>Convoy</span>
        </a>
        <a href="/Payment" className="flex items-center px-4 py-2 space-x-2 rounded-md hover:bg-gray-700 hover:animate-fadeIn">
          <ReceiptIcon className="w-5 h-5" />
          <span>Payment</span>
        </a>
        <a href="/Shop" className="flex items-center px-4 py-2 space-x-2 rounded-md hover:bg-gray-700 hover:animate-fadeIn">
          <StoreIcon className="w-5 h-5" />
          <span>Shop</span>
        </a>
        <a href="/Settings" className="flex items-center px-4 py-2 space-x-2 rounded-md hover:bg-gray-700 hover:animate-fadeIn">
          <SettingsIcon className="w-5 h-5" />
          <span>Settings</span>
        </a>
        {user && user.isAdmin && (
          <a href="/Admin" className="flex items-center px-4 py-2 space-x-2 rounded-md hover:bg-gray-700 hover:animate-fadeIn">
            <SiIcon className="w-5 h-5" />
            <span>Admin</span>
          </a>
        )}
      </nav>
      {user && (
        <div className="flex items-center justify-center h-16 mt-8">
          <Resizable
            defaultSize={{
              width: 26,
              height: 26,
            }}
          >
            <Avatar>
              <AvatarImage src="/user.svg" className="avatar" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
          </Resizable>
          <span className="ml-2">{user.email}</span>
        </div>
      )}
      {user && (
        <button onClick={handleLogout} className="mt-4 px-4 py-2 text-white bg-red-500 rounded-md">
          Logout
        </button>
      )}
    </aside>
  );
};

export default SideBar;
