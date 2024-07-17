import React, { useEffect, useRef } from 'react';
import { VncScreen } from 'react-vnc';

const Terminal = ({ containerId }) => {
  const vncUrl = `ws://de-prem-01.hosts.optikservers.com:35300/vnc/${containerId}`;
  const vncRef = useRef(null);

  useEffect(() => {
    if (vncRef.current) {
      vncRef.current.focus();
    }
  }, []);

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
        viewOnly={false}
        rfbOptions={{ credentials: { password: 'your_password' } }}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onError={handleError}
        ref={vncRef}
      />
    </div>
  );
};

export default Terminal;
