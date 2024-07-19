import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Custom hook for authentication
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const CreateVps = () => {
  const [name, setName] = useState('');
  const [hostname, setHostname] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userPassword, setUserPassword] = useState('');

  const { user } = useAuth(); // Get the current user from authentication context

  useEffect(() => {
    const fetchUserPassword = async () => {
      if (user) {
        try {
          const db = getFirestore();
          const userDoc = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDoc);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserPassword(userData.Convoy); // Assuming 'Convoy' field contains the password
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

    try {
      // Fetch user ID based on email
      const userResponse = await axios.get('https://cpanel.in-cloud.us/api/application/users', {
        headers: {
          Authorization: `Bearer 1|3Bckfcpv1LhPiMAG0i6ycvbRAnLMtdof9RA5kkar`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const userData = userResponse.data.data.find(user => user.email === email);

      if (!userData) {
        setError('User not found.');
        setLoading(false);
        return;
      }

      // Create the VPS
      const response = await axios.post('https://cpanel.in-cloud.us/api/application/servers', {
        node_id: 1,
        user_id: userData.id,
        name: name,
        hostname: hostname,
        vmid: null,
        limits: {
          cpu: 1,
          memory: 1024 * 1024 * 1024, // 1 GB
          disk: 10 * 1024 * 1024 * 1024, // 10 GB
          snapshots: 0,
          backups: null,
          bandwidth: null,
          address_ids: [] // No addresses specified
        },
        account_password: userPassword, // Use the retrieved password
        should_create_server: true,
        template_uuid: 'b00edf9e-5041-4a87-983e-72a9a2f2d3d8', // Default template ID
        start_on_completion: false
      }, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_CONVOY_TOKEN}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });

      setSuccess('VM deployed successfully.');
    } catch (err) {
      console.error(err);
      setError('Failed to deploy VM.');
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
    </div>
  );
};

export default CreateVps;
