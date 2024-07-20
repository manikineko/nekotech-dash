import React from 'react';
import { FaDiscord } from 'react-icons/fa6';
import { HiOutlineTerminal, HiOutlineExternalLink } from 'react-icons/hi';

const Discord = () => {
  const launchConvoy = () => {
    const convoyUrl = 'https://discord.gg/GEAdYDU994';
    window.open(convoyUrl, '_blank');
  };

  const createConvoyAccount = () => {
    const convoyUrl = '/conv';
    window.open(convoyUrl, '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 to-blue-500 text-white rounded-lg shadow-lg p-6 mt-4 mb-8 cursor-pointer hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Creating a Server</h2>
        <FaDiscord className="text-3xl" /> {/* Terminal icon */}
      </div>
      <p className="text-lg mb-4">Making a Server is still very Much a mannual task!, Join our discord and create a ticket!</p>
      <div className="flex space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center"
          onClick={launchConvoy}
          style={{ fontSize: '1.2rem' }} // Increase font size
        >
          Create a Server
          <HiOutlineExternalLink className="ml-2" /> {/* External link icon */}
        </button>
        
      </div>
    </div>
  );
};

export default Discord;
