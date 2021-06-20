import React from 'react';

export default class Cell extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			player: null
		};
	}

	componentDidMount() { this.init(); }
	componentDidUpdate(prevprops) {
		if (prevprops !== this.props) {
			this.init();
		}
	}

	init() {
		this.setState({ player: null });
	}

	claim = (player) => {
		if (this.state.player === null) {
			this.setState({ player: player });
			return true;
		}

		return false;
	}

	render() {
		if (this.state.player !== null) {
			return (<div className={`cell ${(this.state.player ? 'black' : 'red')}`}></div>);
		} else {
			return (<span className="cell open"></span>);
		}
	};

}