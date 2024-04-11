const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Serve static files from 'public' directory
app.use(express.static('public'));

// Define WebSocket server
const wssCamera1 = new WebSocket.Server({ noServer: true });

wssCamera1.on('connection', socket => {
    console.log('Camera 1 connected');
    socket.on('message', message => {
        // Broadcast the message to all connected clients
        wssCamera1.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;

    if (pathname === '/camera1') {
        wssCamera1.handleUpgrade(request, socket, head, ws => {
            wssCamera1.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/`);
});
