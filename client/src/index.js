import React from 'react';
import DOM from 'react-dom';
import './css/Main.css';
import Game from './comp/Game.js';
import SocketContext from './socket'
import * as io from 'socket.io-client'

const socket = io();

DOM.render(
	<SocketContext.Provider value={socket}>
		<SocketContext.Consumer>
			{socket => <Game socket={socket} />}
		</SocketContext.Consumer>
	</SocketContext.Provider>,
	document.getElementById('root')
);