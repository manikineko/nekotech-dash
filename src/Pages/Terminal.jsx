import React from 'react';
import { VncScreen } from 'react-vnc';

const Terminal = ({ containerId }) => {
  const vncUrl = `ws://de-prem-01.hosts.optikservers.com:35300/vnc/${containerId}`;

  const handleConnect = () => {
    console.log('VNC connected');
  };

  const handleDisconnect = () => {
    console.log('VNC disconnected');
  };

  const handleError = (error) => {
    console.error('VNC error:', error);
  };

  return (
    <div className="bg-gray-900 shadow-md rounded-md p-4">
      <h2 className="text-lg font-semibold mb-2">Terminal for Container {containerId}</h2>
      <VncScreen
        url={vncUrl}
        style={{ width: '100%', height: '500px' }}
        background="#000000"
        scaleViewport
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onError={handleError}
      />
    </div>
  );
};

export default Terminal;


// do <url>/servers?con=<container id>