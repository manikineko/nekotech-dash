import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
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

// Function to generate a random password
const generatePassword = () => {
  const length = 49;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";
  while (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,50}$/.test(password)) {
    password = Array.from(window.crypto.getRandomValues(new Uint8Array(length)))
      .map(byte => charset[byte % charset.length])
      .join('');
  }
  return password;
};

const CreateAdminVps = () => {
  const [name, setName] = useState('');
  const [hostname, setHostname] = useState('');
  const [email, setEmail] = useState('');
  const [cpu, setCpu] = useState(1);
  const [memory, setMemory] = useState(1);
  const [memoryUnit, setMemoryUnit] = useState('GB');
  const [disk, setDisk] = useState(10);
  const [diskUnit, setDiskUnit] = useState('GB');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [password, setPassword] = useState('');
  const [userPassword, setUserPassword] = useState('');

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setPassword('');

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

      const generatedPassword = generatePassword();
      setPassword(generatedPassword);

      // Create the VPS
      const serverData = {
        node_id: 1,
        user_id: userData.id,
        name: name,
        hostname: hostname,
        vmid: null,
        limits: {
          cpu: parseInt(cpu),
          memory: convertToBytes(memory, memoryUnit), // Convert memory to bytes
          disk: convertToBytes(disk, diskUnit), // Convert disk to bytes
          snapshots: 0,
          backups: null,
          bandwidth: null,
          address_ids: []
        },
        account_password: generatedPassword, // Use the generated password
        should_create_server: true,
        template_uuid: 'b00edf9e-5041-4a87-983e-72a9a2f2d3d8', // Default template ID
        start_on_completion: false
      };

      const response = await createServer(serverData);
      setSuccess('VM deployed successfully.');
    } catch (err) {
      console.error(err);
      setError(`Failed to deploy VM: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-900 to-green-500 text-white rounded-lg shadow-lg p-6 mt-4 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Create a Paid VPS</h2>
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
          <label className="block text-lg mb-1" htmlFor="cpu">CPU Cores</label>
          <input
            type="number"
            id="cpu"
            value={cpu}
            onChange={(e) => setCpu(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600"
            min="1"
            required
          />
        </div>
        <div>
          <label className="block text-lg mb-1" htmlFor="memory">Memory</label>
          <div className="flex items-center">
            <input
              type="number"
              id="memory"
              value={memory}
              onChange={(e) => setMemory(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600"
              min="1"
              required
            />
            <select
              value={memoryUnit}
              onChange={(e) => setMemoryUnit(e.target.value)}
              className="ml-2 p-2 rounded-lg bg-gray-800 border border-gray-600"
            >
              <option value="KB">KB</option>
              <option value="MB">MB</option>
              <option value="GB">GB</option>
              <option value="TB">TB</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-lg mb-1" htmlFor="disk">Disk Size</label>
          <div className="flex items-center">
            <input
              type="number"
              id="disk"
              value={disk}
              onChange={(e) => setDisk(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600"
              min="1"
              required
            />
            <select
              value={diskUnit}
              onChange={(e) => setDiskUnit(e.target.value)}
              className="ml-2 p-2 rounded-lg bg-gray-800 border border-gray-600"
            >
              <option value="KB">KB</option>
              <option value="MB">MB</option>
              <option value="GB">GB</option>
              <option value="TB">TB</option>
            </select>
          </div>
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

export default CreateAdminVps;
