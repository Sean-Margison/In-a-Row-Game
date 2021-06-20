import React from 'react';
import '../css/Hamburger.css';
import '../css/Toggle.css';
import '../css/Menu.css';

export default class Menu extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			rows: 10,
			cols: 10,
			runs: 4,
			gravity: true,
			isPlaying: false
		}
	}

	custom(e) {
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

		this.changeGame(this.state.cols, this.state.rows, this.state.runs, this.state.gravity, true, e);
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

	changeGame(rows, cols, runs, gravity, custom, e) {
		this.setState({ isPlaying: true });
		this.props.setGameMode(rows, cols, runs, gravity, custom, e);

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
					<li><button onTouchEnd={(e) => this.changeGame(7, 6, 4, true, e)} onClick={(e) => this.changeGame(7, 6, 4, true, false)}>Connect Four</button></li>
					<li><button onTouchEnd={(e) => this.changeGame(3, 3, 3, false, e)} onClick={(e) => this.changeGame(3, 3, 3, false, false)}>Tic-Tac-Toe</button></li>
					<li>
						<label>Local Custom</label>
						<ul className="custom">
							<li onChange={(e) => this.setState({ cols: e.target.value })}>
								<label htmlFor="col">Columns</label>
								<input type="number" name="col" min="1" max="10" defaultValue="10" title="The number of columns for the board (1-10)" />
							</li>
							<li onChange={(e) => this.setState({ rows: e.target.value })}>
								<label htmlFor="row">Rows</label>
								<input type="number" name="row" min="1" max="10" defaultValue="10" title="The number of rows for the board (1-10)" />
							</li>
							<li onChange={(e) => this.setState({ runs: e.target.value })}>
								<label htmlFor="run">To Win</label>
								<input type="number" name="run" min="2" defaultValue="4" title="The number of matches in a row to win!" />
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
								<button onTouchEnd={(e) => this.custom(e)} onClick={(e) => this.custom(e)}>Play Local</button>
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