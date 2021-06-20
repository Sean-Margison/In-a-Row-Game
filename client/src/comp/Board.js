import React from 'react';
import Column from './Column.js';
import '../css/Board.css';

export default class Board extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			moves: 0,
			player: true,
			rows: 0,
			columns: [],
			winner: null,
			gravity: true,
			runs: 0,
			mode: this.props.mode,
			multiplayer: {
				enabled: this.props.multiplayer,
				guid: this.props.guid,
				gameid: null,
				started: false,
				bound: false,
				turn: false
			}
		}
	}

	componentDidMount() { this.init(); }
	componentDidUpdate(prevprops) {
		if (prevprops !== this.props) {
			this.init();
		}
	}

	init() {
		let columns = [];

		for (let x = 0; x < this.props.cols; x++) {
			columns.push(<Column ref={React.createRef()} rows={this.props.rows} clickedColumn={this.playLocal.bind(this)} key={`column-${x}`} index={x} />);
		}

		if (this.props.multiplayer && this.props.mode !== "create") {
			let gamestart = "game:" + this.props.guid;

			let copy = this.state.multiplayer;
			copy.socket = this.props.socket;
			copy.enabled = this.props.multiplayer;
			copy.guid = this.props.guid;
			copy.started = false;
			copy.turn = false;

			this.setState({ multiplayer: copy });

			// Register to game listener first
			this.props.socket.on(gamestart, (data) => {
				// Register for game events
				this.props.socket.on("game:" + data.id, (data) => this.receiveEvent(data));
				// Register if opponent disconnects
				this.props.socket.on("player:" + data.id.split("|vs|")[data.player ? 1 : 0], (data) => this.receiveEvent(data));
				this.props.socket.off(gamestart);

				let copy = this.state.multiplayer;
				copy.gameid = data.id;
				copy.started = true;
				copy.turn = data.player;

				this.setState({ multiplayer: copy });
			});

			// Request game start
			this.props.socket.emit("start", this.state.multiplayer.guid, this.state.mode);
		}

		this.setState({
			columns: columns,
			cols: this.props.cols,
			rows: this.props.rows,
			moves: this.props.cols * this.props.rows,
			player: true,
			winner: null,
			gravity: this.props.gravity,
			runs: this.props.runs,
			mode: this.props.mode
		});
	}

	componentWillUnmount() {
		if (this.state.multiplayer.enabled) {
			this.state.multiplayer.socket.emit("forfeit", this.state.multiplayer.guid);
			this.state.multiplayer.socket?.off();
		}
	}

	// Get opponent move
	receiveEvent(data) {
		// Ignore your own moves
		if (data.sender !== this.state.multiplayer.guid) {
			switch (data.event) {
				case "played":
					if (data.x >= 0 && data.y >= 0) {
						let column = this.state.columns[data.x].ref.current;
						if (column !== null) {
							this.playTurn(column, data.y, true);

							if (this.state.winner === null) {
								let copy = this.state.multiplayer;
								copy.turn = true;
								this.setState({ multiplayer: copy });
							}
						}
					}
					break;
				case "forfeit":
					if (this.state.winner === null) {
						let copy = this.state.multiplayer;
						copy.turn = true;
						this.setState({ winner: true, multiplayer: copy });
					}
					break;
				default:
					break;
			}
		}
	}

	// Replicate move to opponent
	replicateTurn(x, y, win) {
		this.props.socket.emit("turn-played", { id: this.state.multiplayer.gameid, data: { event: "played", x: x, y: y, sender: this.state.multiplayer.guid } });

		// Stay the winner
		if (!win) {
			let copy = this.state.multiplayer;
			copy.turn = false;
			this.setState({ multiplayer: copy });
		} else {
			this.props.socket.off();
		}
	}

	playLocal(column, e) {
		this.playTurn(column, Array.from(e.currentTarget.children).indexOf(e.target));
	}

	playTurn(column, yIndex, forced) {

		let playedX;
		let playedY;

		let replicate = (winner) => {
			if (this.state.multiplayer.enabled && playedX >= 0 && playedY >= 0) {
				if (this.state.multiplayer.turn) {
					this.replicateTurn(playedX, playedY, winner);
				}
			}
		}

		if (!this.state.multiplayer.enabled || this.state.multiplayer.turn || forced) {
			const cells = column.state.cells;
			if (this.state.winner !== null) return;

			if (this.state.gravity) {
				// Check and Claim First Available Cell: (0,0) is top-left, chips fall to the bottom
				for (let y = cells.length - 1; y >= 0; y--) {

					// Try to claim cell
					if (cells[y].ref.current.claim(this.state.player)) {
						playedX = column.props.index;
						playedY = y;

						if (this.winner(column.props.index, y)) {
							this.setState({ winner: this.state.multiplayer.enabled ? this.state.multiplayer.turn : this.state.player });
							replicate(true);
							return;
						} else {
							// Swap Players
							this.setState({ player: !this.state.player, moves: this.state.moves - 1 });
						}

						break;
					}

				}
			} else {
				if (cells[yIndex]) {
					if (cells[yIndex].ref.current.claim(this.state.player)) {
						playedX = column.props.index;
						playedY = yIndex;

						if (this.winner(column.props.index, yIndex)) {
							this.setState({ winner: this.state.multiplayer.enabled ? this.state.multiplayer.turn : this.state.player });
							replicate(true);
							return;
						} else {
							// Swap Players
							this.setState({ player: !this.state.player, moves: this.state.moves - 1 });
						}
					}
				}
			}

			replicate(false);
		}
	}

	cell = (x, y) => {
		return this.state.columns[x].ref.current.state.cells[y].ref.current;
	}

	// Check if move was a winner
	winner(x, y) {

		let matches = (cell) => {
			return cell.state.player === this.state.player;
		}

		// Check vertical
		let vertical = () => {
			let vert = 1;

			// Up
			for (let up = y + 1; up < this.state.rows; up++) {
				if (!matches(this.cell(x, up))) break;
				vert++;
			}

			// Down
			for (let down = y - 1; down >= 0; down--) {
				if (!matches(this.cell(x, down))) break;
				vert++;
			}

			return vert >= this.state.runs;
		}

		// Check horizontal
		let horizontal = () => {
			let horz = 1;

			// Right
			for (let right = x + 1; right < this.state.cols; right++) {
				if (!matches(this.cell(right, y))) break;
				horz++;
			}

			// Left
			for (let left = x - 1; left >= 0; left--) {
				if (!matches(this.cell(left, y))) break;
				horz++;
			}

			return horz >= this.state.runs;
		}

		// Check Diagonal Up
		let diagUp = () => {
			let diag = 1;

			// Up + Right
			let pos = { x: x, y: y };
			while (++pos.x < this.state.cols && --pos.y >= 0) {
				if (!matches(this.cell(pos.x, pos.y))) break;
				diag++;
			}

			// Down + Left
			pos = { x: x, y: y }
			while (--pos.x >= 0 && ++pos.y < this.state.rows) {
				if (!matches(this.cell(pos.x, pos.y))) break;
				diag++;
			}

			return diag >= this.state.runs;
		}

		// Check Diagonal Down
		let diagDown = () => {
			let diag = 1;

			// Up + Left
			let pos = { x: x, y: y };
			while (--pos.x >= 0 && --pos.y >= 0) {
				if (!matches(this.cell(pos.x, pos.y))) break;
				diag++;
			}

			// Down + Right
			pos = { x: x, y: y }
			while (++pos.x < this.state.cols && ++pos.y < this.state.rows) {
				if (!matches(this.cell(pos.x, pos.y))) break;
				diag++;
			}

			return diag >= this.state.runs;
		}

		return vertical() || horizontal() || diagUp() || diagDown();
	}

	render() {
		let message = "";
		if (this.state.multiplayer.enabled) {
			if (this.state.multiplayer.started) {
				if (this.state.winner !== null) {
					message = this.state.multiplayer.turn ? "YOU WIN!" : "You Lost.";
				} else if (this.state.moves <= 0) {
					message = "DRAW";
				} else {
					if (this.state.multiplayer.turn) {
						message = "Your Turn...";
					} else {
						message = "Opponent's Turn...";
					}
				}
			} else {
				message = "Finding Opponent...";
			}
		} else {
			if (this.state.winner !== null) {
				message = (this.state.player ? "Black" : "Red") + " WINS!";
			} else if (this.state.moves <= 0) {
				message = "DRAW";
			}
		}

		if (message.length > 0) {
			message = <span className="message">{message}</span>;
		}

		return (
			<div className={(this.state.multiplayer.enabled && this.state.multiplayer.turn ? "turn" : "")}>
				{message}
				<div
					id="board"
					className={
						(this.state.player ? 'black' : 'red') +
						(this.state.gravity ? " gravity" : "") +
						(this.state.winner !== null ? " done" : "")
					}>
					{this.state.columns}
				</div>
			</div>
		);
	};
};