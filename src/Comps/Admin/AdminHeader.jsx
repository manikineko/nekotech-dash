import React from 'react';
import Header from '../../Pages/Header';

const AdminHeader = () => {
  return (
    <div className="container mx-auto p-4">
      <Header />
      <div className="bg-gray-900 shadow-md rounded-md p-4">
        <h2 className="text-lg font-semibold mb-2">Servers</h2>
      </div>
    </div>
  );
};

export default AdminHeader;
