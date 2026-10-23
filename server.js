const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const rooms = new Map();

wss.on('connection', (ws, req) => {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const room = urlParams.get('room');

    if (!room) {
        ws.close();
        return;
    }

    ws.room = room;
    if (!rooms.has(room)) {
        rooms.set(room, new Set());
    }
    rooms.get(room).add(ws);

    console.log(`[SUITE OPTIC] Conectado en sala: ${room}`);

    ws.on('message', (message) => {
        const roomClients = rooms.get(room);
        if (roomClients) {
            roomClients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message.toString());
                }
            });
        }
    });

    ws.on('close', () => {
        const roomClients = rooms.get(room);
        if (roomClients) {
            roomClients.delete(ws);
            if (roomClients.size === 0) rooms.delete(room);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[SUITE OPTIC] Servidor activo en puerto ${PORT}`);
});
