import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { createServer, getAllUsers } from '../LibConvoy';

// Function to convert storage units to bytes
const convertToBytes = (size, unit) => {
  const units = {
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
  };
  return size * units[unit.toUpperCase()];
};

const CreateVPS = ({ setMessage, maxCpu = 2, maxMemory = 4, maxDisk = 20, maxBandwidth = 30, maxVpsCount = 3 }) => {
  const [name, setName] = useState('');
  const [hostname, setHostname] = useState('');
  const [email, setEmail] = useState('');
  const [cpu, setCpu] = useState(1);
  const [memory, setMemory] = useState(1);
  const [disk, setDisk] = useState(10);
  const [bandwidth, setBandwidth] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [password, setPassword] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [dedicatedIP, setDedicatedIP] = useState(false);
  const [currentVpsCount, setCurrentVpsCount] = useState(0);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserPassword = async () => {
      if (user) {
        try {
          const db = getFirestore();
          const userDoc = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDoc);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserPassword(userData.Convoy || ''); // Set default if Convoy is undefined
          } else {
            setError('User data not found.');
          }
        } catch (err) {
          console.error(err);
          setError('Failed to fetch user data.');
        }
      }
    };

    fetchUserPassword();
  }, [user]);

  useEffect(() => {
    const fetchCurrentVpsCount = async () => {
      if (user) {
        try {
          const db = getFirestore();
          const q = query(collection(db, 'vps'), where('user_id', '==', user.uid));
          const querySnapshot = await getDocs(q);
          setCurrentVpsCount(querySnapshot.size);
        } catch (err) {
          console.error(err);
          setError('Failed to fetch VPS count.');
        }
      }
    };

    fetchCurrentVpsCount();
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setPassword('');

    if (currentVpsCount >= maxVpsCount) {
      setError(`You have reached the maximum allowed VPS count of ${maxVpsCount}.`);
      setLoading(false);
      return;
    }

    if (password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/g.test(password)) {
      setError('Password must be at least 8 characters long and include at least one special character.');
      setLoading(false);
      return;
    }

    try {
      // Fetch user ID based on email
      const userResponse = await getAllUsers();
      
      // Log the response to inspect its structure
      console.log('User response data:', userResponse);

      // Ensure data is an array before calling find
      const userDataArray = userResponse.data || []; // Adjust based on actual API response
      const userData = userDataArray.find(user => user.email === email);

      if (!userData) {
        setError('User not found.');
        setLoading(false);
        return;
      }

      // Create the VPS
      const serverData = {
        node_id: 1,
        user_id: userData.id,
        name: name,
        hostname: hostname,
        vmid: null,
        limits: {
          cpu: parseInt(cpu),
          memory: convertToBytes(memory, 'GB'), // Convert memory to bytes
          disk: convertToBytes(disk, 'GB'), // Convert disk to bytes
          bandwidth: convertToBytes(bandwidth, 'GB'), // Convert bandwidth to bytes
          snapshots: 0,
          backups: null,
          address_ids: dedicatedIP ? [1] : [] // Assuming ID 1 for dedicated IP
        },
        account_password: password, // Use the provided password
        should_create_server: true,
        template_uuid: 'b00edf9e-5041-4a87-983e-72a9a2f2d3d8', // Default template ID
        start_on_completion: false
      };

      const response = await createServer(serverData);
      setSuccess('VM deployed successfully.');
      setMessage && setMessage('VM deployed successfully.');
      setCurrentVpsCount(currentVpsCount + 1); // Increment the VPS count
    } catch (err) {
      console.error(err);
      setError(`Failed to deploy VM: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-900 to-green-500 text-white rounded-lg shadow-lg p-6 mt-4 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Create a Free VPS</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-lg mb-1" htmlFor="name">VM Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600"
            required
          />
        </div>
        <div>
          <label className="block text-lg mb-1" htmlFor="hostname">VM Hostname</label>
          <input
            type="text"
            id="hostname"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600"
            required
          />
        </div>
        <div>
          <label className="block text-lg mb-1" htmlFor="email">User Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600"
            required
          />
        </div>
        <div>
          <label className="block text-lg mb-1" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600"
            required
          />
        </div>
        <div>
          <label className="block text-lg mb-1" htmlFor="cpu">CPU Cores ({cpu})</label>
          <input
            type="range"
            id="cpu"
            value={cpu}
            onChange={(e) => setCpu(e.target.value)}
            className="w-full"
            min="1"
            max={maxCpu}
            required
          />
        </div>
        <div>
          <label className="block text-lg mb-1" htmlFor="memory">Memory ({memory} GB)</label>
          <input
            type="range"
            id="memory"
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
            className="w-full"
            min="1"
            max={maxMemory}
            required
          />
        </div>
        <div>
          <label className="block text-lg mb-1" htmlFor="disk">Disk Size ({disk} GB)</label>
          <input
            type="range"
            id="disk"
            value={disk}
            onChange={(e) => setDisk(e.target.value)}
            className="w-full"
            min="10"
            max={maxDisk}
            required
          />
        </div>
        <div>
          <label className="block text-lg mb-1" htmlFor="bandwidth">Bandwidth ({bandwidth} GB)</label>
          <input
            type="range"
            id="bandwidth"
            value={bandwidth}
            onChange={(e) => setBandwidth(e.target.value)}
            className="w-full"
            min="1"
            max={maxBandwidth}
            required
          />
        </div>
        <div>
          <label className="block text-lg mb-1" htmlFor="dedicatedIP">Dedicated IP</label>
          <input
            type="checkbox"
            id="dedicatedIP"
            checked={dedicatedIP}
            onChange={(e) => setDedicatedIP(e.target.checked)}
            className="ml-2 p-2 rounded-lg bg-gray-800 border border-gray-600"
            disabled
          />
        </div>
        <button
          type="submit"
          className={`bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-md transition duration-300 ease-in-out ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Creating VPS...' : 'Create VPS'}
        </button>
        {success && <p className="text-green-300">{success}</p>}
        {error && <p className="text-red-300">{error}</p>}
      </form>
      {password && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-md">
          <p className="text-lg font-semibold">VPS Created with password:</p>
          <p className="text-green-300">{password}</p>
        </div>
      )}
    </div>
  );
};

export default CreateVPS;
