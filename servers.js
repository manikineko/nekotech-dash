const express = require('express');
const axios = require('axios').default;
const http = require('http');
const cors = require('cors');
const fs = require('fs');
const WebSocket = require('ws');
const https = require('https');

const app = express();
const port = 35300;
const usersFile = 'users.json';
/// stop NYA STOP
// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Utility functions to read and write users from/to a JSON file
const readUsers = () => {
    if (!fs.existsSync(usersFile)) {
        fs.writeFileSync(usersFile, JSON.stringify([]));
    }
    const data = fs.readFileSync(usersFile);
    return JSON.parse(data);
};

const writeUsers = (users) => {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

// Proxmox API configuration
const proxmoxConfig = {
    baseURL: 'https://proxmox.astralaxis.tech/api2/json',
    headers: {
        'Authorization': 'PVEAPIToken=root@pam!console-user=f6576457-0126-41b3-88de-c580a24606c6',
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    httpsAgent: new https.Agent({ rejectUnauthorized: false }) // Ignore SSL certificate issues
};

// Discord webhook URL
const discordWebhookURL = 'https://discordapp.com/api/webhooks/1248310846086578297/imqo4VsowiMzlIjVbzN0G8YzoGGGM5IhdpxqZMUI6S37CiEoMHkoxtM7NQ8e9aqhZUrQ';

// Function to send error message to Discord webhook
const sendErrorToDiscord = async (error, endpoint) => {
    const embed = {
        title: 'API Error',
        description: `Error occurred at endpoint: ${endpoint}`,
        color: 16711680, // Red color
        fields: [
            {
                name: 'Error Message',
                value: error.message || 'Unknown error'
            }
        ],
        timestamp: new Date()
    };

    try {
        await axios.post(discordWebhookURL, {
            embeds: [embed]
        });
    } catch (webhookError) {
        console.error('Failed to send error message to Discord webhook:', webhookError);
    }
};

// Function to send success message to Discord webhook
const sendOkay = async (endpoint) => {
    const embed = {
        title: 'API Healthy! 🟢',
        description: `Request given to: ${endpoint} has worked!`,
        color: 51968, // Green color
        fields: [
            {
                name: '🟢 Online',
                value: 'Works fine!'
            }
        ],
        timestamp: new Date()
    };

    try {
        await axios.post(discordWebhookURL, {
            embeds: [embed]
        });
    } catch (webhookError) {
        console.error('Failed to send success message to Discord webhook:', webhookError);
    }
};

// Create HTTP server instance
const server = http.createServer(app);

// WebSocket server for VNC connections
const wss = new WebSocket.Server({ server });

// WebSocket server connection handler
wss.on('connection', (ws, req) => {
    const containerId = req.url.split('/').pop(); // Assuming URL is like ws://localhost:35300/103

    // Function to obtain access token from Proxmox API
    const getAccessToken = async () => {
        try {
            const response = await axios.post(`${proxmoxConfig.baseURL}/nodes/h3066910/lxc/${containerId}/termproxy`, {}, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': proxmoxConfig.headers.Authorization
                },
                httpsAgent: proxmoxConfig.httpsAgent
            });

            return response.data.data.ticket;
        } catch (error) {
            console.error('Failed to obtain access token:', error);
            throw error;
        }
    };

    // Handle WebSocket connection
    const handleWebSocket = async () => {
        try {
            const accessToken = await getAccessToken();
            const proxmoxWsUrl = `wss://proxmox.astralaxis.tech/nodes/h3066910/lxc/${containerId}/vncwebsocket?port=5900&vncticket=${accessToken}`;

            console.log(`Connecting to WebSocket URL: ${proxmoxWsUrl}`);

            const proxmoxWs = new WebSocket(proxmoxWsUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Sec-Websocket-Protocol': 'binary',
                    'Sec-Websocket-Version': '13',
                    'Sec-Websocket-Extensions': 'permessage-deflate; client_max_window_bits'
                }
            });

            proxmoxWs.on('open', () => {
                console.log(`WebSocket connection opened for container ${containerId}`);
            });

            proxmoxWs.on('message', (message) => {
                // Forward messages from Proxmox WebSocket to the client WebSocket
                ws.send(message);
            });

            proxmoxWs.on('close', () => {
                console.log(`WebSocket connection closed for container ${containerId}`);
                ws.close();
            });

            proxmoxWs.on('error', (error) => {
                console.error(`WebSocket error for container ${containerId}:`, error);
                // Handle error appropriately, e.g., close WebSocket connection
                proxmoxWs.close();
            });

            // WebSocket client connection handler
            ws.on('message', (message) => {
                // Forward messages from client WebSocket to Proxmox WebSocket
                proxmoxWs.send(message);
            });

            ws.on('close', () => {
                console.log(`Client WebSocket connection closed for container ${containerId}`);
                proxmoxWs.close();
            });

            ws.on('error', (error) => {
                console.error(`Client WebSocket error for container ${containerId}:`, error);
                // Handle error appropriately, e.g., close WebSocket connection
                proxmoxWs.close();
            });
        } catch (error) {
            console.error('Failed to handle WebSocket connection:', error);
            // Handle error appropriately
            ws.close();
        }
    };

    // Start handling WebSocket connection
    handleWebSocket();
});

// Define other routes as needed (e.g., /lxc, /node/status, /vms)

// Define a route for /lxc/:id to fetch container specifications
app.get('/lxc/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const apiUrl = `${proxmoxConfig.baseURL}/nodes/h3066910/lxc/${id}/status/current`;

        const response = await axios.get(apiUrl, {
            ...proxmoxConfig
        });

        const containerSpecs = {
            vcpu: response.data.data.cpus,
            cpuUsage: response.data.data.cpu,
            memoryUsage: response.data.data.mem,
            maxMemory: response.data.data.maxmem,
            diskUsage: response.data.data.disk,
            maxDisk: response.data.data.maxdisk,
            network: response.data.data.netin,
            maxNetwork: response.data.data.netout
        };

        res.json(containerSpecs);
        await sendOkay(`/lxc/${id}`);
    } catch (error) {
        console.error(error);
        await sendErrorToDiscord(error, `/lxc/${id}`);
        res.status(500).json({ error: 'Failed to fetch container specifications' });
    }
});

// Define a route for /lxc to fetch all LXC containers
app.get('/lxc', async (req, res) => {
    try {
        const apiUrl = `${proxmoxConfig.baseURL}/nodes/h3066910/lxc`;

        const response = await axios.get(apiUrl, {
            ...proxmoxConfig
        });

        res.json(response.data);
        await sendOkay('/lxc');
    } catch (error) {
        console.error(error);
        await sendErrorToDiscord(error, '/lxc');
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// Define a route for /lxc/stop/:id to stop the LXC container
app.post('/lxc/stop/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const apiUrl = `${proxmoxConfig.baseURL}/nodes/h3066910/lxc/${id}/status/stop`;

        console.log(`Attempting to stop container ${id}`);

        const response = await axios.post(apiUrl, null, proxmoxConfig);

        console.log(`Successfully stopped container ${id}`);
        res.json({ message: `Successfully stopped container ${id}` });
        await sendOkay(`/lxc/stop/${id}`);
    } catch (error) {
        console.error(`Failed to stop container ${id}:`, error);
        await sendErrorToDiscord(error, `/lxc/stop/${id}`);
        res.status(500).json({ error: `Failed to stop container ${id}` });
    }
});

// Define a route for /lxc/start/:id to start the LXC container
app.post('/lxc/start/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const apiUrl = `${proxmoxConfig.baseURL}/nodes/h3066910/lxc/${id}/status/start`;

        console.log(`Attempting to start container ${id}`);

        const response = await axios.post(apiUrl, null, proxmoxConfig);

        console.log(`Successfully started container ${id}`);
        res.json({ message: `Successfully started container ${id}` });
        await sendOkay(`/lxc/start/${id}`);
    } catch (error) {
        console.error(`Failed to start container ${id}:`, error);
        await sendErrorToDiscord(error, `/lxc/start/${id}`);
        res.status(500).json({ error: `Failed to start container ${id}` });
    }
});

// Define a route for /node/status to fetch node status
app.get('/node/status', async (req, res) => {
    try {
        const apiUrl = `${proxmoxConfig.baseURL}/nodes/h3066910/status`;

        const response = await axios.get(apiUrl, {
            ...proxmoxConfig
        });

        res.json(response.data);
        await sendOkay('/node/status');
    } catch (error) {
        console.error(error);
        await sendErrorToDiscord(error, '/node/status');
        res.status(500).json({ error: 'Failed to fetch node status' });
    }
});

// Start HTTP server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
