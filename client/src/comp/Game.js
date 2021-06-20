import React from 'react';
import Board from './Board';
import Menu from './Menu';
import SocketContext from '../socket';

export default class Game extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			isPlaying: false,
			gameOver: false,
			cols: 7,
			rows: 6,
			runs: 4,
			gravity: true,
			isTouch: false,
			mode: "",
			multiplayer: {
				socket: this.props.socket,
				guid: null,
				enabled: false
			}
		}
	}

	componentDidMount() {
		this.state.multiplayer.socket.on("guid", guid => {
			let copy = this.state.multiplayer;
			copy.enabled = true;
			copy.guid = guid;

			this.setState({ multiplayer: copy });
		});
	}

	endGame() {
		let copy = this.state.multiplayer;
		copy.enabled = this.state.multiplayer.socket !== null && this.state.multiplayer.guid !== null;
		this.setState({ isPlaying: false, multiplayer: copy });
	}

	// Local Only
	restart() {
		let copy = this.state.multiplayer;
		copy.enabled = this.state.multiplayer.socket !== null && this.state.multiplayer.guid !== null;
		this.setGameMode();
	}

	setGameMode(cols, rows, runs, gravity, custom, e) {
		// e null on restart
		let mode;
		let touch = (e ? e.type === 'touchend' : this.state.isTouch);

		if (custom) {
			mode = "create";
		} else if (cols === 7 && rows === 6 && gravity && runs === 4) {
			mode = "connect";
		} else if (cols === 3 && rows === 3 && !gravity && runs === 3) {
			mode = "tictac";
		}

		mode = mode || this.state.mode;

		let copy = this.state.multiplayer;
		copy.enabled = this.state.multiplayer.socket !== null && mode !== "create" && this.state.multiplayer.guid !== null;

		this.setState({
			cols: cols || this.state.cols,
			rows: rows || this.state.rows,
			runs: runs || this.state.runs,
			gravity: gravity !== undefined ? gravity : this.state.gravity,
			isPlaying: true,
			isTouch: touch,
			mode: mode,
			multiplayer: copy
		});
	}

	render() {
		let board = "";
		if (this.state.isPlaying) {
			board =
				<SocketContext.Consumer>
				{
					socket =>
						<Board
							cols={this.state.cols}
							rows={this.state.rows}
							runs={this.state.runs}
							mode={this.state.mode}
							gravity={this.state.gravity}
							multiplayer={this.state.multiplayer.enabled}
							socket={socket}
							guid={this.state.multiplayer.guid}
						/>
				}
				</SocketContext.Consumer>
		}

		return (
			<div id="game" className={(this.state.mode) + (this.state.isTouch ? " touch" : "") + (this.state.multiplayer.enabled ? " multi" : "")}>
				<div className="bg"></div>
				<Menu setGameMode={this.setGameMode.bind(this)} isPlaying={this.state.isPlaying} endGame={this.endGame.bind(this)} restart={this.restart.bind(this)} multiplayer={this.state.multiplayer.enabled} />
				{board}
				<div id="logos">
					<img width="100" alt="React Logo" src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" />
					<img width="100" alt="Node Logo" src="https://nodejs.org/static/images/logos/nodejs-new-pantone-white.svg" />
					<img width="65" alt="Socket IO Logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Socket-io.svg/1024px-Socket-io.svg.png" style={{ paddingLeft: 15 }} />
				</div>
			</div>
		)
	};
};