import React, { useEffect, useRef } from 'react';
import { Terminal as Xterm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const Terminal = ({ containerId }) => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    // Initialize xterm.js
    const xterm = new Xterm({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
      },
    });
    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = xterm;

    // Create WebSocket connection to the backend server
    const backendWsUrl = `ws://de-prem-01.hosts.optikservers.com:35300/${containerId}`;
    ws.current = new WebSocket(backendWsUrl);

    // WebSocket event listeners
    ws.current.onopen = () => {
      console.log('WebSocket connection opened');
    };

    ws.current.onmessage = (event) => {
      const message = event.data;
      xterm.write(message);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // Handle terminal input
    xterm.onData((data) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(data);
      }
    });

    // Clean up WebSocket and terminal instance on component unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
      xterm.dispose();
    };
  }, [containerId]);

  return (
    <div className="bg-gray-900 shadow-md rounded-md p-4">
      <h2 className="text-lg font-semibold mb-2">Terminal for Container {containerId}</h2>
      <div ref={terminalRef} style={{ height: '500px', width: '100%' }} />
    </div>
  );
};

export default Terminal;


// do <url>/servers?con=<container id>