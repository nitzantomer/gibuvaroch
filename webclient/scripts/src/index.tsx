import React from "react";
import ReactDOM from "react-dom";

/*type OnQueryHandler = (query: string) => void;

type SearchBoxProps = {
	onQuery: OnQueryHandler;
};

const searchBoxOnPress = (onQuery: OnQueryHandler, event: React.KeyboardEvent<HTMLInputElement>) => {
	if (event.charCode === 13) {
		event.preventDefault();
		event.stopPropagation();
		onQuery(event.currentTarget.value);
	}
}

const BigSearchBox = (props: SearchBoxProps) => {
	return (
		<div id="searchbox">
			<img src="images/dino.png" />
			<input
				type="text"
				placeholder="Enter a query, then press enter"
				onKeyPress={ searchBoxOnPress.bind(null, props.onQuery) } />
		</div>
	);
};

const SmallSearchBox = (props: SearchBoxProps) => {
	return (
		<div id="searchbox">
			<img src="images/dino.png" />
			<input
				type="text"
				placeholder="Enter a query, then press enter"
				onKeyPress={ searchBoxOnPress.bind(null, props.onQuery) } />
		</div>
	);
};*/

type SearchBoxProps = {
	className: string;
	onQuery: (query: string) => void;
};
const SearchBox = (props: SearchBoxProps) => {
	const onPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.charCode === 13) {
			event.preventDefault();
			event.stopPropagation();
			props.onQuery(event.currentTarget.value);
		}
	};

	return (
		<div id="searchbox" className={ props.className }>
			<img src="images/dino.png" />
			<input type="text" placeholder="Enter a query, then press enter" onKeyPress={ onPress } />
		</div>
	);
};

type MainState = {
	display: "search" | "results";
};
class Main extends React.Component<{}, MainState> {
	constructor(props: {}) {
		super(props);

		this.state = {
			display: "search"
		}
	}

	render() {
		return (
			<main id="main">
				<SearchBox
					className={ this.state.display === "search" ? "big" : "small" }
					onQuery={ () => this.setState({ display: "results"}) }/>
			</main>
		);
	}
}

ReactDOM.render(<Main />, document.getElementById("reactroot"));