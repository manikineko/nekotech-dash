import axios from 'axios';

const baseURL = 'https://cpanel.in-cloud.us/api/application';
const token = '2|NThhqCh6kN3bckZTNKZZ3DfNqM6EEB0rZlFpym63'; // Define the token here

// Utility function to handle API errors
const handleApiError = (error) => {
  console.error('API call failed:', error);
  throw error.response ? error.response.data : new Error('API call failed');
};

// Function to create headers with the authorization token
const createHeaders = () => ({
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Function to create a server
export const createServer = async (serverData) => {
  try {
    const response = await axios.post(`${baseURL}/servers`, serverData, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to delete a server
export const deleteServer = async (uuid) => {
  try {
    const response = await axios.delete(`${baseURL}/servers/${uuid}`, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to get all servers
export const getAllServers = async () => {
  try {
    const response = await axios.get(`${baseURL}/servers`, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to get a specific server
export const getServer = async (uuid) => {
  try {
    const response = await axios.get(`${baseURL}/servers/${uuid}`, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to update a server's general information
export const updateServer = async (uuid, updateData) => {
  try {
    const response = await axios.patch(`${baseURL}/servers/${uuid}`, updateData, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to update a server's build
export const updateServerBuild = async (uuid, buildData) => {
  try {
    const response = await axios.patch(`${baseURL}/servers/${uuid}/settings/build`, buildData, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to suspend a server
export const suspendServer = async (uuid) => {
  try {
    const response = await axios.post(`${baseURL}/servers/${uuid}/settings/suspend`, {}, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to unsuspend a server
export const unsuspendServer = async (uuid) => {
  try {
    const response = await axios.post(`${baseURL}/servers/${uuid}/settings/unsuspend`, {}, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to get all users
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${baseURL}/users`, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to get a user by ID
export const getUser = async (id) => {
  try {
    const response = await axios.get(`${baseURL}/users/${id}`, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to create a new user
export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${baseURL}/users`, userData, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to update a user's information
export const updateUser = async (id, userData) => {
  try {
    const response = await axios.patch(`${baseURL}/users/${id}`, userData, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to delete a user
export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${baseURL}/users/${id}`, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to get all locations
export const getAllLocations = async () => {
  try {
    const response = await axios.get(`${baseURL}/locations`, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to get a location by ID
export const getLocation = async (id) => {
  try {
    const response = await axios.get(`${baseURL}/locations/${id}`, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to create a new location
export const createLocation = async (locationData) => {
  try {
    const response = await axios.post(`${baseURL}/locations`, locationData, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to update a location's information
export const updateLocation = async (id, locationData) => {
  try {
    const response = await axios.patch(`${baseURL}/locations/${id}`, locationData, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to delete a location
export const deleteLocation = async (id) => {
  try {
    const response = await axios.delete(`${baseURL}/locations/${id}`, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to get all nodes
export const getAllNodes = async () => {
  try {
    const response = await axios.get(`${baseURL}/nodes`, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to get a node by ID
export const getNode = async (id) => {
  try {
    const response = await axios.get(`${baseURL}/nodes/${id}`, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to create a new node
export const createNode = async (nodeData) => {
  try {
    const response = await axios.post(`${baseURL}/nodes`, nodeData, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to update a node's information
export const updateNode = async (id, nodeData) => {
  try {
    const response = await axios.patch(`${baseURL}/nodes/${id}`, nodeData, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to delete a node
export const deleteNode = async (id) => {
  try {
    const response = await axios.delete(`${baseURL}/nodes/${id}`, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to get all templates
export const getAllTemplates = async () => {
  try {
    const response = await axios.get(`${baseURL}/templates`, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to get a template by ID
export const getTemplate = async (id) => {
  try {
    const response = await axios.get(`${baseURL}/templates/${id}`, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to create a new template
export const createTemplate = async (templateData) => {
  try {
    const response = await axios.post(`${baseURL}/templates`, templateData, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to update a template's information
export const updateTemplate = async (id, templateData) => {
  try {
    const response = await axios.patch(`${baseURL}/templates/${id}`, templateData, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to delete a template
export const deleteTemplate = async (id) => {
  try {
    const response = await axios.delete(`${baseURL}/templates/${id}`, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to get IPAM information
export const getIPAM = async () => {
  try {
    const response = await axios.get(`${baseURL}/ipam`, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to get single sign-on information
export const getSSO = async () => {
  try {
    const response = await axios.get(`${baseURL}/single-sign-on`, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to update single sign-on settings
export const updateSSO = async (ssoData) => {
  try {
    const response = await axios.patch(`${baseURL}/single-sign-on`, ssoData, createHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
