// Setup
const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const server = http.createServer(app);
const multiplayer = require('./multiplayer');

// Read env variables
const port = process.env.PORT || '3001';
const deployed = process.env.DEPLOYED || false;

// Setup express to serve deployment build
// Necessary for single Heroku deployment
if(deployed) {
	const __client = __dirname.replace("\\server", '\\client');
	
	app.use(express.static(path.join(__client, "build")));

	// Route Request
	app.get('*', function (req, res) {
		res.sendFile(path.join(__client, "build", "index.html"));
	});
}

// Start 
server.listen(port, () => console.log(`Server running on port ${port}`));

// Setup Multiplayer Server
multiplayer(server);
