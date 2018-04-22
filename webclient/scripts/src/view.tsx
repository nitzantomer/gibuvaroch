import React from "react";
import ReactDOM from "react-dom";

import { PurchasedData } from "./client";

export type SearchResult = {
	id: string;
	title: string;
	description: string;
	score: number;
	price: number;
}

const RESULTS_MOCK: SearchResult[] = [
	{
		id: "1",
		score: 95,
		price: 13076,
		title: "Result #1",
		description: "Lorem ipsum dolor sit amet, dui ac consequat mauris pede nam sit, sapien qui erat nulla, ipsum accumsan tempor semper et qui, luctus praesent dolor condimentum ut. Rhoncus quis in, pellentesque mauris, elementum tristique, ultrices augue amet sapien ligula, cum est quam maecenas wisi lorem cras. In nulla scelerisque laoreet aenean, commodo sit nec accumsan, vel aptent cras augue a integer, varius magna felis neque ridiculus. Molestie integer, purus aliquam proin sed."
	},
	{
		id: "2",
		score: 89,
		price: 4293,
		title: "Result #2",
		description: "Lorem ipsum dolor sit amet, ante blandit eget nisl est, suspendisse eveniet eget, adipiscing dui facilisis lorem aliquet lacinia sollicitudin, ornare nec viverra vel mauris odio pretium, aliquid eu vestibulum. Vivamus dolor feugiat, vel vivamus cras leo dolor, nunc porta erat occaecati lorem elit cras, pellentesque nonummy cursus lacus sed ante."
	},
	{
		id: "3",
		score: 83,
		price: 877622,
		title: "Result #3",
		description: "Lorem ipsum dolor sit amet, amet etiam, pellentesque vitae dolor. Erat nam aenean, et vehicula. Ac sollicitudin. Laoreet lorem justo, mauris massa, ac sit molestie."
	},
	{
		id: "4",
		score: 76,
		price: 2345423,
		title: "Result #4",
		description: "Lorem ipsum dolor sit amet, in maecenas, tempus justo. Lectus dictum, tristique felis. Nonummy aliquam, vitae scelerisque. Nulla dignissim. Justo suspendisse eget. Urna diam. Turpis magna, suspendisse tellus convallis."
	},
	{
		id: "5",
		score: 75,
		price: 887323,
		title: "Result #5",
		description: "Lorem ipsum dolor sit amet, per sapien at dui lorem, nunc ac ut nec ante. Magna lorem ut mi, sociis augue aliquam quam sed. Sagittis vivamus sed nam, placerat sit nunc proin phasellus, odio purus dui mauris curabitur. Dictum sagittis in ut, lacinia morbi ullamcorper vitae, commodo a quis luctus. Lectus convallis pretium nunc sociis, mauris eros eget lorem felis. Amet tempor ut ac, non sodales vel ac sagittis, elit massa ipsum ullamcorper per, enim arcu tortor consectetuer."
	},
	{
		id: "6",
		score: 75,
		price: 328473,
		title: "Result #6",
		description: "Lorem ipsum dolor sit amet, massa in malesuada rhoncus, taciti aliquam dictum vel. Class aliquam vitae venenatis sodales, dolor leo mauris egestas, sit cras turpis aliquam eros. Cum augue dignissim mi, nunc mollis sem congue, cras neque pede metus."
	},
	{
		id: "7",
		score: 72,
		price: 436546,
		title: "Result #7",
		description: "Lorem ipsum dolor sit amet, litora mi molestie enim placerat aliquam magna, porttitor lacus id bibendum mauris quisque integer, elit fusce aenean vitae non enim, consectetuer ut nec et nunc turpis consectetuer, dolor eu donec quisque veniam duis."
	},
	{
		id: "8",
		score: 68,
		price: 654675474,
		title: "Result #8",
		description: "Lorem ipsum dolor sit amet, fermentum duis et eget libero cum, nunc ornare et urna, curabitur posuere quis lacus ipsum hymenaeos, quam amet blandit tincidunt consequat et nonummy. Ultricies eu nulla pellentesque odio vestibulum lectus, vivamus integer."
	},
	{
		id: "9",
		score: 66,
		price: 93273,
		title: "Result #9",
		description: "Lorem ipsum dolor sit amet, mauris ullamco eros sem eu, per sapien, faucibus non enim ipsum et. Vitae cras commodo corrupti ante sagittis, luctus aliquet nostrud mauris dolor sit, imperdiet vitae tellus pulvinar at, maecenas tincidunt risus quisque velit auctor sit."
	},
	{
		id: "10",
		score: 54,
		price: 327872,
		title: "Result #10",
		description: "Lorem ipsum dolor sit amet, lectus ipsum fermentum nec dolor, est ornare, posuere a egestas vulputate quam lectus, lobortis vitae congue doloremque. Proin sit libero quisque ipsum feugiat, vivamus massa condimentum mi vehicula, pellentesque at risus, totam vestibulum mauris."
	},
	{
		id: "11",
		score: 51,
		price: 238727,
		title: "Result #11",
		description: "Lorem ipsum dolor sit amet, curabitur pellentesque odio lacus vestibulum, ullamcorper a fusce. Torquent ornare in. Phasellus senectus nascetur suspendisse amet justo, mi semper, neque eros sed felis urna mi in, orci lacinia et condimentum velit, hendrerit tempor commodo mauris lobortis nec."
	}
];

type SearchBoxProps = {
	className: string;
	isLoading?: boolean;
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
			<div className="wrapper">
				<input type="text" placeholder="Enter a query, then press enter" onKeyPress={ onPress } />
				<div id="loading" className={ props.isLoading ? "on" : "off" }></div>
			</div>
		</div>
	);
};

function weiToString(value: number): string {
	return value.toLocaleString("en-IN");
}

type ResultViewProps = SearchResult & {
	onPurchase: () => void;
};
const ResultView = (props: ResultViewProps) => {
	return (
		<li>
			<div className="header">
				<span className="title">{ props.title }</span>
				<span className="buy">
					<a href="#" onClick={ event => { event.preventDefault(); props.onPurchase(); }}>purchase</a>
					<span className="price">
						<span>for </span>
						<span className="value">{ weiToString(props.price) } </span>
						<span className="wei">wei</span>
					</span>
				</span>
			</div>
			<div className="description">
				{ props.description }
			</div>
		</li>
	);
};

type MainProps = {
	onPurchase: (id: string) => Promise<PurchasedData>;
	onQuery: (query: string) => Promise<SearchResult[]>;
};
type MainState = {
	display: "search" | "results";
	results?: SearchResult[];
	purchasedData?: PurchasedData;
	showPurchasedDataAnimationEnded?: boolean;
};
class Main extends React.Component<MainProps, MainState> {
	private textarea: HTMLTextAreaElement;

	constructor(props: MainProps) {
		super(props);

		this.state = {
			display: "search"
		}
	}

	render() {
		return (
			<main id="main">
				<SearchBox
					isLoading={ this.state.results == null }
					className={ this.state.display === "search" ? "big" : "small" }
					onQuery={ this.onQuery.bind(this) }/>

				{ this.renderResults() }
				{ this.renderPurchasedData() }
			</main>
		);
	}

	private onQuery(query: string) {
		if (this.state.display !== "results") {
			this.setState({
				results: null,
				display: "results"
			});
		} else {
			this.setState({
				results: null
			});
		}

		this.props.onQuery(query).then(results => {
			this.setState({
				results
			});
		});
		/*setTimeout(() => {
			this.setState({
				results: RESULTS_MOCK
			});
		}, 2500);*/
	}

	private renderResults(): JSX.Element | null {
		if (!this.state.results) {
			return null;
		}

		if (this.state.results.length === 0) {
			return (
				<div className="noresults">No results found, try something else</div>
			);
		}

		const results = this.state.results.map(result => ResultView(Object.assign({}, result, {
			onPurchase: () => {
				this.props.onPurchase(result.id).then(data => {
					this.setState({
						purchasedData: data
					});
				});
			}
		})));

		return <ol id="results">{ results }</ol>;
	}

	private renderPurchasedData() {
		if (!this.state.purchasedData) {
			return null;
		}

		const className = this.state.showPurchasedDataAnimationEnded ? "done" : "";

		return (
			<div id="purchasedata" ref={ el => el && el.addEventListener("animationend", () => this.setState({ showPurchasedDataAnimationEnded: true }))} className={ className }>
				<div className="header">
					Here's the data for <span className="title">{ this.state.purchasedData.id }</span>:
				</div>
				<textarea ref={ el => this.textarea = el }>{ this.state.purchasedData.contents }</textarea>
				<ul className="actions">
					<li>You paid { this.state.purchasedData.price } wei</li>
					<li><a href="#" onClick={ this.closeDialog.bind(this) } style={ { paddingLeft: "10px" } }>close</a></li>
					<li><a href="#" onClick={ this.copyToClipboard.bind(this) }>copy to clipboard</a></li>
				</ul>
			</div>
		);
	}

	private copyToClipboard(event: React.MouseEvent<any>) {
		event.preventDefault();

		this.textarea.select();
		document.execCommand("copy");
		window.getSelection().removeAllRanges();
	}

	private closeDialog(event: React.MouseEvent<any>) {
		event.preventDefault();
		this.setState({
			purchasedData: null,
			showPurchasedDataAnimationEnded: false
		});
	}
}

export function init(queryHandler: (query: string) => Promise<SearchResult[]>, purchaseHandler: (id: string) => Promise<PurchasedData>) {
	ReactDOM.render(<Main onQuery={ queryHandler } onPurchase={ purchaseHandler }/>, document.getElementById("reactroot"));
}
