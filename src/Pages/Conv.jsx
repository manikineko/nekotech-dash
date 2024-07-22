import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Header from './Header';
import SideBar from './SideBar';
import { onAuthStateChanged } from 'firebase/auth';
import LaunchConvoyPanel from './LaunchConvoyPanel';
import LaunchConvoyPanel2 from './LaunchConvoyPanel2';
import CreateVPS from './CreateVPS';
const Conv = () => {
  const [user, setUser] = useState(null);
  const [convoyUser, setConvoyUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchUser = async (user) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({ ...user, ...userData });
          if (userData.Convoy && userData.Convoy.length > 0) {
            setConvoyUser(userData.Convoy[0]);
          } else {
            // Check Convoy API for user existence
            try {
              const response = await axios.get(`https://cpanel.in-cloud.us/api/application/users?filter[email]=${user.email}`, {
                headers: {
                  'Authorization': 'Bearer 2|NThhqCh6kN3bckZTNKZZ3DfNqM6EEB0rZlFpym63',
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
              });
              const convoyUsers = response.data.data;
              const existingUser = convoyUsers.find(u => u.email === user.email);
              if (existingUser) {
                setConvoyUser(existingUser);
                // Save Convoy account info in Firebase
                await setDoc(doc(db, 'users', user.uid), {
                  Convoy: [{ name: existingUser.name, email: existingUser.email, password: '' }],
                }, { merge: true });
              } else {
                setConvoyUser(null);
              }
            } catch (error) {
              setError('Error fetching Convoy user data.');
            }
          }
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error('Error fetching user', error);
        setError('Failed to fetch user data.');
      } finally {
        setLoading(false);
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

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required.');
      return;
    }

    try {
      // Create user in Convoy
      const response = await axios.post('https://cpanel.in-cloud.us/api/application/users', {
        root_admin: false,
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }, {
        headers: {
          'Authorization': 'Bearer 2|NThhqCh6kN3bckZTNKZZ3DfNqM6EEB0rZlFpym63',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      // Store user information in Firebase
      await setDoc(doc(db, 'users', user.uid), {
        Convoy: [{ name: formData.name, email: formData.email, password: formData.password }],
      }, { merge: true });

      // Fetch and set updated Convoy user info
      const convoyResponse = await axios.get(`https://cpanel.in-cloud.us/api/application/users?filter[email]=${formData.email}`, {
        headers: {
          'Authorization': 'Bearer 2|NThhqCh6kN3bckZTNKZZ3DfNqM6EEB0rZlFpym63',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const newUser = convoyResponse.data.data.find(u => u.email === formData.email);
      setConvoyUser(newUser);
      setShowCreateForm(false);
      setFormData({ name: '', email: '', password: '' });
    } catch (error) {
      console.error('Error creating Convoy user', error);
      setError('Failed to create user on Convoy.');
    }
  };

  const handleEditUser = async () => {
    if (!formData.name || !formData.email) {
      setError('Name and Email are required.');
      return;
    }

    try {
      // Update user in Convoy
      const response = await axios.put(`https://cpanel.in-cloud.us/api/application/users/${convoyUser.id}`, {
        root_admin: convoyUser.root_admin,
        name: formData.name,
        email: formData.email,
      }, {
        headers: {
          'Authorization': 'Bearer 2|NThhqCh6kN3bckZTNKZZ3DfNqM6EEB0rZlFpym63',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      // Update user information in Firebase
      await setDoc(doc(db, 'users', user.uid), {
        Convoy: [{ name: formData.name, email: formData.email, password: convoyUser.password }],
      }, { merge: true });

      // Fetch and set updated Convoy user info
      setConvoyUser({ ...convoyUser, name: formData.name, email: formData.email });
      setShowEditForm(false);
      setFormData({ name: '', email: '', password: '' });
    } catch (error) {
      console.error('Error editing Convoy user', error);
      setError('Failed to edit user on Convoy.');
    }
  };

  const handleShowPassword = async () => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const convoyAccount = userDoc.data().Convoy[0];
      setPassword(convoyAccount.password);
      setShowPassword(true);
    } else {
      setError('Failed to retrieve password.');
    }
  };

  const handleHidePassword = () => {
    setShowPassword(false);
  };

  return (
    <div className="flex h-screen bg-gray-800 text-white">
      <SideBar />
      <main className="flex-1 p-8 bg-gray-800 rounded-tl-lg overflow-y-auto">
        <div className="container mx-auto p-4">
          <Header />
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="bg-gray-900 shadow-md rounded-md p-4">
              <h2 className="text-lg font-semibold mb-2">Convoy Panel</h2>
              {error && <p className="text-red-500">{error}</p>}
              {convoyUser ? (
                <div>
                  <p><strong>Name:</strong> {convoyUser.name}</p>
                  <p><strong>Email:</strong> {convoyUser.email}</p>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
                    onClick={() => setShowEditForm(true)}
                  >
                    Edit Convoy Account
                  </button>
                  {showPassword ? (
                    <>
                      <button
                        className="bg-yellow-500 text-white px-4 py-2 rounded-md mt-4 ml-4"
                        onClick={handleHidePassword}
                      >
                        Hide Password
                      </button>
                      <p className="mt-4"><strong>Password:</strong> {password}</p>
                    </>
                  ) : (
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded-md mt-4 ml-4"
                      onClick={handleShowPassword}
                    >
                      Show Password
                    </button>
                  )}
                  {showEditForm && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Edit Convoy Account</h3>
                      <input
                        type="text"
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="block w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="block w-full p-2 mb-4 bg-gray-800 border border-gray-600 rounded"
                      />
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded-md"
                        onClick={handleEditUser}
                      >
                        Save Changes
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-md ml-4"
                        onClick={() => setShowEditForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p>No Convoy account linked.</p>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
                    onClick={() => setShowCreateForm(true)}
                  >
                    Create Convoy Account
                  </button>
                  {showCreateForm && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Create Convoy Account</h3>
                      <input
                        type="text"
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="block w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="block w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded"
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="block w-full p-2 mb-4 bg-gray-800 border border-gray-600 rounded"
                      />
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded-md"
                        onClick={handleCreateUser}
                      >
                        Create Account
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-md ml-4"
                        onClick={() => setShowCreateForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <CreateVPS/>
          <LaunchConvoyPanel2/>
        </div>

      </main>
      
    </div>
  );
};

export default Conv;