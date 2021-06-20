const express = require('express');
const path = require('path');
const http = require('http');
const port = process.env.PORT || '3001';
const app = express();
const server = http.createServer(app);
const multiplayer = require('./multiplayer');

// Static serve
app.use(express.static(path.join(__dirname, "client\public")));

// Start 
server.listen(port, () => console.log(`Server running on port ${port}`));

// Setup Multiplayer Server
multiplayer(server);