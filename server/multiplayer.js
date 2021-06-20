const socket = require('socket.io');

function multiplayer(server) {

	const io = socket(server);

	// Handle connection request
	const players = [];
	const tictacQueue = [];
	const connectQueue = [];
	const delay = 5000;

	let processing = false;

	let processQueue = (queue, io) => {
		if (queue.length > 1) {
			let weHaveGame = () => {
				if (queue.length > 1) {
					let p1 = queue[0];
					let p2 = queue[1];

					if (!players[p1] || p1 === p2) {
						queue.shift();
						return weHaveGame();
					} else if (!players[p2]) {
						queue.splice(1, 1);
						return weHaveGame();
					} else {
						return true;
					}
				} else {
					return false;
				}
			};

			if (weHaveGame()) {
				// Game Found
				let p1 = queue.shift();
				let p2 = queue.shift();

				let gameid = `${p1}|vs|${p2}`;

				// Update Players
				io.emit(`game:${p1}`, { id: gameid, player: true });
				io.emit(`game:${p2}`, { id: gameid, player: false });

				console.log("Game Started: " + gameid);

				processQueue(queue, io);
			} else {
				setTimeout(() => processQueue(queue, io), delay);
			}

			setTimeout(() => processQueue(queue, io), delay);
		} else {
			setTimeout(() => processQueue(queue, io), delay);
		}
	};

	let removeFromQueues = (guid) => {

		let removeFromQueue = (queue) => {
			if (queue.indexOf(guid) >= 0) {
				try {
					queue.splice(queue.indexOf(guid), 1);
					console.log("Player Removed from Queue.");
				} catch { }
			}
		};

		removeFromQueue(tictacQueue);
		removeFromQueue(connectQueue);
	};

	io.on('connection', socket => {

		let guid = () => {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
				var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			})
		};

		const player = guid();
		players[player] = true;

		// Assign Identifier
		socket.emit("guid", player);

		// Disconnect
		socket.on("disconnect", () => {
			removeFromQueues(player);
			players[player] = undefined;

			// Send to anyone listening for this player
			io.emit("player:" + player, { event: "forfeit", sender: guid });

			console.log("Player Disconnected.");
		});

		// Check if other player is ready
		socket.on("start", (guid, mode) => {
			if (mode === "connect") {
				if (!connectQueue[guid]) {
					players[guid] = true;
					connectQueue.push(guid);
					console.log("Player Added to Connect Queue");
				}
			} else if (mode === "tictac") {
				if (!tictacQueue[guid]) {
					players[guid] = true;
					tictacQueue.push(guid);
					console.log("Player Added to TicTacToe Queue");
				}
			}
		});

		// Pass on move
		socket.on("turn-played", (data) => {
			io.emit("game:" + data.id, data.data);
		});

		// Forfeit
		socket.on("forfeit", (guid) => {
			removeFromQueues(guid);
			io.emit("player:" + guid, { event: "forfeit", sender: guid });
			console.log("Player Forfeited.");
		});

		if (!processing) {
			processing = true;
			processQueue(tictacQueue, io);
			processQueue(connectQueue, io);
			console.log("Processing Queues...");
		}
	});

}

module.exports = multiplayer;