// Setup
const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const server = http.createServer(app);
const multiplayer = require('./multiplayer');

// Read env variables
const port = process.env.PORT || '3001';
const prod = process.env.PRODUCTION || false;

// Setup express to serve deployment build
// Necessary for single Heroku deployment
if(prod) {
	app.enable("trust proxy");

	app.use(express.static(path.join(__dirname, "/../client/build")));

	// Route Request
	app.get('*', function (req, res) {
		res.sendFile(path.join(__dirname, "/../client/build", "index.html"));
	});
}

// Start 
server.listen(port, () => console.log(`Server running on port ${port}`));

// Setup Multiplayer Server
multiplayer(server);