import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../utils/api';
import AdminSidebar from '../Comps/Admin/AdminSidebar';
import AdminHeader from '../Comps/Admin/AdminHeader';
import ServerList from '../Comps/Admin/ServerList';

const Admin = () => {
  const [message, setMessage] = useState('');
 // const [isAdmin, setIsAdmin] = useState(false);
 const isAdmin = true;
  useEffect(() => {
    
  }, []);

  if (!isAdmin) {
    return <div><h1>Not a Admin</h1>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/BCKLb2a93cc?si=1mrwkSasKr-_l-UF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </div>;
  }

  return (
    <div className="flex h-screen bg-gray-800 text-white">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-800 rounded-tl-lg overflow-y-auto">
        <AdminHeader />
        <CreateVps setMessage={setMessage} />
        {message && (
          <div className="mt-4 p-2 bg-gray-600 rounded-md">
            <p className="text-green-300">{message}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
