import React from 'react';
import { FaPowerOff, FaPlay } from 'react-icons/fa';

const bytesToGB = (bytes) => {
  if (bytes === 0) return '0 GB';
  const gigaBytes = bytes / (1024 * 1024 * 1024);
  return gigaBytes.toFixed(2) + ' GB';
};

const secondsToHours = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const ServerCard = ({ server, handlePowerOn, handlePowerOff }) => {
  return (
    <div key={server.uuid} className="server-card bg-gray-800 p-4 rounded-lg shadow-md relative">
      <div className="mb-4">
        <p className="text-lg font-semibold">{server.name || 'No Name'}</p>
        <p className="text-gray-400">{server.status}</p>
      </div>
      <div className="mb-1">
        <p><span className="font-semibold">CPU:</span> {server.limits.cpu}</p>
        <p><span className="font-semibold">Memory:</span> {bytesToGB(server.limits.memory)}</p>
        <p><span className="font-semibold">Disk:</span> {bytesToGB(server.limits.disk)}</p>
      </div>
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => handlePowerOn(server.uuid)}
          className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <FaPlay /> Power On
        </button>
        <button
          onClick={() => handlePowerOff(server.uuid)}
          className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <FaPowerOff /> Power Off
        </button>
      </div>
    </div>
  );
};

export default ServerCard;
