import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import SideBar from './SideBar';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FaPlay, FaStop } from 'react-icons/fa';
import Terminal from './Terminal';
import CreateVps from './CreateVps';

const Servers = () => {
  const [user, setUser] = useState(null);
  const [lxcContainers, setLxcContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const containerId = queryParams.get('con');

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
        console.error('Error fetching user', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUser(user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLxcContainers = async () => {
      if (user && user.LXC && user.LXC.length > 0) {
        try {
          const containerPromises = user.LXC.map(id => axios.get(`https://test.manikineko.nl/lxc/${id}`));
          const containerResponses = await Promise.all(containerPromises);
          setLxcContainers(containerResponses.map(response => response.data));
        } catch (error) {
          console.error('Error fetching LXC containers', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchLxcContainers();
  }, [user]);

  const handleStart = async (id) => {
    try {
      await axios.post(`https://test.manikineko.nl/lxc/start/${id}`);
      alert(`LXC ${id} started`);
    } catch (error) {
      console.error('Error starting LXC', error);
      alert(`Unable to Connect to Maniki! User's command did not work, Is the server already online?`);
    }
  };

  const handleStop = async (id) => {
    try {
      await axios.post(`https://test.manikineko.nl/lxc/stop/${id}`);
      alert(`LXC ${id} stopped`);
    } catch (error) {
      console.error('Error stopping LXC', error);
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatNetwork = (bytes) => {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB/s`;
  };

  return (
    <div className="flex h-screen bg-gray-800 text-white">
      <SideBar />
      <main className="flex-1 p-8 bg-gray-800 rounded-tl-lg overflow-y-auto">
        <div className="container mx-auto p-4">
          <Header />
          {containerId ? (
            <Terminal containerId={containerId} />
          ) : (
            <div className="bg-gray-900 shadow-md rounded-md p-4">
              <h2 className="text-lg font-semibold mb-2">Servers</h2>
              {loading ? (
                <p>Loading...</p>
            ) : lxcContainers.length > 0 ? (
                lxcContainers.map((container, index) => (
                  <div key={user.LXC[index]} className="bg-gray-800 p-4 rounded-md mb-4">
                    <h3 className="text-md font-semibold mb-2">LXC {user.LXC[index]}</h3>
                    <p>vCPU: {container.vcpu}</p>
                    <p>CPU Usage: {container.cpuUsage.toFixed(2)}%</p>
                    <p>Memory Usage: {formatBytes(container.memoryUsage)} / {formatBytes(container.maxMemory)}</p>
                    <p>Disk Usage: {formatBytes(container.diskUsage)} / {formatBytes(container.maxDisk)}</p>
                    <p>Network: {formatNetwork(container.network)} / {formatNetwork(container.maxNetwork)}</p>
                    <div className="flex space-x-4 mt-4">
                      <button onClick={() => handleStart(user.LXC[index])} className="bg-green-500 p-2 rounded-md flex items-center">
                        <FaPlay className="mr-2" /> Start
                      </button>
                      <button onClick={() => handleStop(user.LXC[index])} className="bg-red-500 p-2 rounded-md flex items-center">
                        <FaStop className="mr-2" /> Stop
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No LXC containers found for this user.</p>
              )}
            </div>
          )}
        </div>
        <CreateVps/>
      </main>
    </div>
  );
};

export default Servers;
