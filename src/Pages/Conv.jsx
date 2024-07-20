import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { createUser, getAllUsers, updateUser } from '../LibConvoy';
import Header from './Header';
import SideBar from './SideBar';
import LaunchConvoyPanel2 from './LaunchConvoyPanel2';
import CreateVPS from './CreateVPS';

const Conv = () => {
  const [user, setUser] = useState(null);
  const [convoyUser, setConvoyUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

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
            const usersResponse = await getAllUsers();
            const convoyUserData = usersResponse.data.find(u => u.email === user.email);
            if (convoyUserData) {
              setConvoyUser(convoyUserData);
              await setDoc(doc(db, 'users', user.uid), { Convoy: [convoyUserData] }, { merge: true });
            } else {
              setConvoyUser(null);
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

    if (formData.password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/g.test(formData.password)) {
      setError('Password must be at least 8 characters long and include at least one special character.');
      return;
    }

    try {
      const response = await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      await setDoc(doc(db, 'users', user.uid), {
        Convoy: [{ id: response.data.id, name: formData.name, email: formData.email, password: formData.password }],
      }, { merge: true });

      setConvoyUser(response.data);
      setShowCreateForm(false);
      setFormData({ name: '', email: '', password: '' });
    } catch (error) {
      console.error('Error creating Convoy user', error);
      setError('Failed to create user on Convoy.');
    }
  };

  const handleEditUser = async () => {
    if (!formData.name || !formData.email) {
      setError('Name and Convoy Email are required.');
      return;
    }

    try {
      const response = await updateUser(convoyUser.id, {
        name: formData.name,
        email: formData.email
      });

      await setDoc(doc(db, 'users', user.uid), {
        Convoy: [{ ...convoyUser, name: formData.name, email: formData.email }],
      }, { merge: true });

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

  useEffect(() => {
    if (convoyUser) {
      setFormData({ ...formData, email: convoyUser.email });
    }
  }, [convoyUser]);

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
                  <p><strong>Convoy Email:</strong> {convoyUser.email}</p>
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
                        placeholder="Convoy Email"
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
                        placeholder="Convoy Email"
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
          <LaunchConvoyPanel2 />
          <CreateVPS setMessage={setMessage} maxCpu={2} maxMemory={4} maxDisk={20} maxBandwidth={30} maxVpsCount={1} />
        </div>
      </main>
    </div>
  );
};

export default Conv;
