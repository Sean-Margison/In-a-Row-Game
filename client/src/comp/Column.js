import React from 'react';
import Cell from './Cell';

export default class Column extends React.Component {

	constructor(props) {
		 super(props);

		 this.state = {
			  cells: []
		 }
	}

	componentDidMount() { this.init(); }
	componentDidUpdate(prevprops){
		if(prevprops !== this.props){
			this.init();
		}
	}

	init(){
		let cells = [];
		for (let y = 0; y < this.props.rows; y++) {
			 cells.push(<Cell ref={React.createRef()} key={`cell-${this.props.x}-${y}`} x={this.props.x} y={y} />);
		}

		this.setState({ cells: cells });
	}

	render() {

		 return (<div className="col" onClick={(e) => this.props.clickedColumn(this, e)}>{this.state.cells}</div>);

	};

};