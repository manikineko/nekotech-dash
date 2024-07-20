import React, { useEffect, useState } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { getAllServers, suspendServer, unsuspendServer } from '../../LibConvoy';
import ServerCard from './ServerCard';
import LaunchConvoyPanel from '../../Pages/LaunchConvoyPanel';

const ServerList = ({ setMessage }) => {
  const [servers, setServers] = useState([]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const data = await getAllServers();
        setServers(data.data);

        // Animate server cards on load
        anime({
          targets: '.server-card',
          translateY: [50, 0],
          opacity: [0, 1],
          easing: 'easeOutQuad',
          duration: 800,
          delay: anime.stagger(100),
        });
      } catch (error) {
        console.error('Error fetching servers:', error);
      }
    };

    fetchServers();
  }, []);

  const handlePowerOn = async (uuid) => {
    try {
      await unsuspendServer(uuid);
      setMessage(`Server '${uuid}' has been powered on.`);
      fetchServers();
    } catch (error) {
      console.error(`Error powering on server with UUID ${uuid}:`, error);
    }
  };

  const handlePowerOff = async (uuid) => {
    try {
      await suspendServer(uuid);
      setMessage(`Server '${uuid}' has been powered off.`);
      fetchServers();
    } catch (error) {
      console.error(`Error powering off server with UUID ${uuid}:`, error);
    }
  };

  return (
    <div className="bg-gray-900 shadow-md rounded-md p-4">
      <h2 className="text-lg font-semibold mb-2">Servers</h2>
      <LaunchConvoyPanel />
      {servers.length === 0 ? (
        <p>No servers found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map((server) => (
            <ServerCard
              key={server.uuid}
              server={server}
              handlePowerOn={handlePowerOn}
              handlePowerOff={handlePowerOff}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ServerList;
