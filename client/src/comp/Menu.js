import React from 'react';
import '../css/Hamburger.css';
import '../css/Toggle.css';
import '../css/Menu.css';

export default class Menu extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			rows: 5,
			cols: 5,
			runs: 3,
			gravity: true,
			isPlaying: false
		}
	}

	custom() {
		if (this.state.cols < 0 || this.state.cols > 10) {
			alert("Columns must be between 1 and 10");
			return;
		} else if (this.state.rows < 0 || this.state.rows > 10) {
			alert("Rows must be between 1 and 10");
			return;
		} else if (this.state.runs < 2 || this.state.runs > Math.max(this.state.cols, this.state.rows)) {
			alert("Runs must be less than either rows or columns");
			return;
		}

		this.changeGame(this.state.cols, this.state.rows, this.state.runs, this.state.gravity, true);
	}

	componentDidMount() { this.init(); }
	componentDidUpdate(prevprops) {
		if (prevprops !== this.props) {
			this.init();
		}
	}

	init() {
		this.setState({ isPlaying: this.props.isPlaying });
	}

	restart(e) {
		this.props.restart(e);
	}

	endGame(e) {
		this.props.endGame(e);
	}

	changeGame(rows, cols, runs, gravity, custom) {
		this.setState({ isPlaying: true });
		this.props.setGameMode(rows, cols, runs, gravity, custom);

		document.querySelector(".hamburger").classList.remove("is-active");
		document.getElementById("menu").classList.remove("open");
	}

	toggleMenu(e) {
		e.currentTarget.classList.toggle("is-active");
		document.getElementById("menu").classList.toggle("open");
	}

	render() {
		let main = (
			<div>
				<h1>In-a-Row</h1>
				<ul>
					<li>
						<label id="multi" className={this.props.multiplayer ? "enabled" : "disabled"}><span>Multiplayer</span> <span>{this.props.multiplayer ? "Online" : "Offline"}</span></label>
					</li>
					<li><button onClick={(e) => this.changeGame(7, 6, 4, true)}>Connect Four</button></li>
					<li><button onClick={(e) => this.changeGame(3, 3, 3, false)}>Tic-Tac-Toe</button></li>
					<li>
						<label>Local Custom</label>
						<ul className="custom">
							<li>
								<label htmlFor="col">Columns: {this.state.cols}</label>
								<button className="inc" alt="Add Columns" onClick={() => this.setState({ cols: Math.min(10, this.state.cols + 1) })}>+</button>
								<button className="inc" alt="Subtract Columns" onClick={() => this.setState({ cols: Math.max(1, this.state.cols - 1) })}>-</button>
							</li>
							<li>
								<label htmlFor="row">Rows: {this.state.rows}</label>
								<button className="inc" alt="Add Rows" onClick={() => this.setState({ rows: Math.min(10, this.state.rows + 1) })}>+</button>
								<button className="inc" alt="Subtract Rows" onClick={() => this.setState({ rows: Math.max(1, this.state.rows - 1) })}>-</button>
							</li>
							<li>
								<label htmlFor="run">To Win: {this.state.runs}</label>
								<button className="inc" alt="Add Runs" onClick={() => this.setState({ runs: Math.min(10, this.state.runs + 1) })}>+</button>
								<button className="inc" alt="Subtract Runs" onClick={() => this.setState({ runs: Math.max(2, this.state.runs - 1) })}>-</button>
							</li>
							<li>
								<label htmlFor="checkbox">Gravity</label>
								<div>
									<div id="toggle">
										<input type="checkbox" className="checkbox" defaultChecked="" onChange={(e) => this.setState({ gravity: !e.target.checked })} />
										<div className="knobs"></div>
										<div className="layer"></div>
									</div>
								</div>
							</li>
							<li>
								<button onClick={(e) => this.custom()}>Play Local</button>
							</li>
						</ul>
					</li>
				</ul>
			</div>
		);

		let ingame = (
			<div>
				<h1>In-a-Row</h1>
				<ul>
					<li><button onClick={(e) => this.restart(e)}>Restart</button></li>
					<li><button onClick={(e) => this.endGame(e)}>Leave Game</button></li>
				</ul>
			</div>
		);

		return (
			<div className={(this.state.isPlaying ? "play" : "start")}>
				<button title="Menu" className="hamburger hamburger--squeeze js-hamburger" onClick={(e) => this.toggleMenu(e)}>
					<div className="hamburger-box">
						<div className="hamburger-inner"></div>
					</div>
				</button>
				<div id="menu">
					{this.state.isPlaying ? ingame : main}
					<span id="author"><span>By:</span> Sean Margison</span>
				</div>
			</div>
		)
	}
}
