import { html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { SlideView } from '../slide-view/slide-view';
import { PlayerViewController } from './player-view.controller';
import { playerViewStyles } from './player-view.styles';
import { SlSplitPanel } from '@shoelace-style/shoelace';
import { Data, DataSet, Edge, Network, Node } from "vis-network/standalone";
import { HttpRequest } from '../../utils/http-request';
import { Toaster } from '../../utils/toaster';
import { CourseParticipantPresence } from '../../model/course-state';
import { course } from '../../model/course';
import Chart, { ChartConfiguration } from 'chart.js/auto';

@customElement('player-view')
export class PlayerView extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		playerViewStyles,
	];

	private controller = new PlayerViewController(this);

	host = "https://" + window.location.host;

	@property({ type: Boolean, reflect: true })
	participantsVisible: boolean = true;

	@property({ type: Boolean, reflect: true })
	rightContainerVisible: boolean = true;

	@query("#inner-split-panel")
	innterSplitPanel: SlSplitPanel;

	@query("#outer-split-panel")
	outerSplitPanel: SlSplitPanel;

	@query("#network-panel")
	networkPanel: HTMLElement;

	network: Network;
	nodes: DataSet<Node, "id">;
	edges: DataSet<Edge, "id">;

	@state()
	selectedNode: Node;

	@query("#peer-chart")
	peerChartCanvas: HTMLCanvasElement;

	@query("#bandwidth-chart")
	bandwidthChartCanvas: HTMLCanvasElement;

	bandwidthChart: Chart;
	peerChart: Chart;

	bandwidthChartData: Array<any> = new Array();
	peerChartData: Array<any> = new Array();

	counter = 0;


	getController(): PlayerViewController {
		return this.controller;
	}

	getSlideView(): SlideView {
		return this.renderRoot.querySelector("slide-view");
	}

	cleanup() {

	}

	override connectedCallback() {
		super.connectedCallback();

		document.addEventListener("p2p-peer-joined", (event: CustomEvent) => {
			const peer = event.detail;

			this.onJoined(peer);
		});
		document.addEventListener("p2p-peer-left", (event: CustomEvent) => {
			const peer = event.detail;

			this.onLeft(peer);
		});
		document.addEventListener("p2p-peer-reorganize", (event: CustomEvent) => {
			const peer = event.detail;

			this.onReorganize(peer);
		});
		document.addEventListener("p2p-stats", (event: CustomEvent) => {
			const stats = event.detail;

			this.onStats(stats);
		});
		document.addEventListener("p2p-document-added", (event: CustomEvent) => {
			this.onDocumentAdded();
		});
		document.addEventListener("p2p-document-loaded", (event: CustomEvent) => {
			const peer = event.detail;

			this.onDocumentLoaded(peer);
		});
		document.addEventListener("participant-presence", (event: CustomEvent) => {
			const participant: CourseParticipantPresence = event.detail;

			// React only to events originated from other participants.
			if (participant.userId === course.userId) {
				return;
			}

			if (participant.presence === "CONNECTED") {
				// console.log("CONNECTED");
			}
			else if (participant.presence === "DISCONNECTED") {
				// console.log("DISCONNECTED");
			}
		});
	}

	protected firstUpdated() {
		this.setupBandwidthChart();
		this.setupPeerChart();
		this.setupNetwork();
	}

	protected render() {
		return html`
			<div class="left-container">
				<div id="chart-container">
					<canvas id="bandwidth-chart"></canvas>
					<canvas id="peer-chart"></canvas>
				</div>
				<div class="slide-container">
					<slide-view class="slides"></slide-view>
				</div>
			</div>
			<div class="center-container">
				<div id="network-panel"></div>
			</div>
			<div class="right-container">
				<div class="controls">
					<form id="demo-form">
						<sl-input type="number" name="server-bandwidth" label="Server Bandwidth (MBit/s)" placeholder="Server Bandwidth" size="small" min="1" max="10000" value="1000"></sl-input>
						<sl-input type="number" name="peers-max" label="Peers" placeholder="Number of Peers" size="small" min="1" max="1000" value="10"></sl-input>
						<sl-input type="number" name="super-peers-max" label="Super-Peers" placeholder="Number of Super-Peers" size="small" min="1" max="10"  value="2"></sl-input>
						<sl-input type="number" name="super-peer-bandwidth-threshold" label="Super-Peer Bandwidth Threshold (MBit/s)" placeholder="Super-Peer Bandwidth Threshold" size="small" min="1" max="1000" value="100"></sl-input>
						<sl-button @click="${this.start}" variant="neutral" size="small" form="demo-form">Start</sl-button>
					</form>
				</div>
				${when(this.selectedNode, () => html`
					<div class="selected-node">
						<dt>ID</dt>
						<dd>${this.selectedNode.id}</dd>
						<dt>Type</dt>
						<dd>${this.getPeerDescription(this.selectedNode)}</dd>

						<sl-button @click="${this.disconnectPeer}" ?disabled="${this.isServer(this.selectedNode)}" variant="warning" size="small">Disconnect</sl-button>
					</div>
				`)}
			</div>
		`;
	}

	private onJoined(client: any) {
		console.log("joined", client);

		this.nodes.add({
			id: client.uid,
			label: client.name ? client.name : client.type === "SUPER_PEER" ? "SP" : "P",
			level: client.type === "SUPER_PEER" ? 1 : 2,
			color: {
				border: client.name ? "#FB923C" : client.type === "SUPER_PEER" ? "#A78BFA" : "#60A5FA",
				background: client.name ? "#FB923C" : client.type === "SUPER_PEER" ? "#A78BFA" : "#60A5FA",
			}
		});

		for (const server of client.servers) {
			this.edges.add({
				from: client.uid,
				to: server.uid,
				value: client.bandwidth,
				title: client.bandwidth + "Mbit/s"
			});
		}
	}

	private onLeft(client: any) {
		console.log("left", client);

		this.nodes.remove(client.uid);
	}

	private onReorganize(client: any) {
		console.log("reorganize", client);

		const connectedEdges = this.network.getConnectedEdges(client.uid);
		this.edges.remove(connectedEdges);

		this.nodes.update({
			id: client.uid,
			label: client.name ? client.name : client.type === "SUPER_PEER" ? "SP" : "P",
			level: client.type === "SUPER_PEER" ? 1 : 2,
			color: {
				border: "#059669",
				background: client.name ? "#FB923C" : client.type === "SUPER_PEER" ? "#A78BFA" : "#60A5FA",
			}
		});

		for (const server of client.servers) {
			this.edges.add({
				from: client.uid,
				to: server.uid,
				value: client.bandwidth,
				title: client.bandwidth + "Mbit/s"
			});
		}
	}

	private onStats(stats: any) {
		console.log("stats", stats);

		this.addBandwidthData({ x: ""+this.counter++, y: stats.currentBandwidth });
		this.addPeerData({ x: ""+this.counter++, y: stats.totalPeers });
	}

	private onDocumentAdded() {
		console.log("document added");

		this.nodes.forEach((node: Node) => {
			node.color = {
				border: "#60A5FA",
			};

			this.nodes.update(node);
		});
	}

	private onDocumentLoaded(client: any) {
		console.log("loaded", this.nodes.get(client.uid));

		const node = this.nodes.get(client.uid) as Node;
		node.color = {
			border: "#059669",
		};

		this.nodes.update(node);
	}

	private start(event: Event): void {
		if (this.nodes.length > 2) {
			this.edges.clear();
			this.nodes.clear();
	
			this.nodes.add({
				id: "19ba501f-cd70-42ad-855b-8423d0b5c4a2",
				label: "S",
				color: "#F472B6",
				level: 0
			});
		}

		this.bandwidthChartData = new Array();
		this.peerChartData = new Array();

		const demoForm: HTMLFormElement = this.renderRoot.querySelector("#demo-form");
		const data = new FormData(demoForm);

		const submitButton = <HTMLButtonElement> event.target;
		// submitButton.disabled = true;

		new HttpRequest().post(this.host + "/p2p/start", data)
			.then(() => {

			})
			.catch(cause => {
				console.error(cause);
			});
	}

	private disconnectPeer() {
		console.log("disconnect peer", this.selectedNode);

		new HttpRequest().get(this.host + "/p2p/disconnect/" + this.selectedNode.id)
			.then(() => {
				this.selectedNode = null;

				Toaster.showSuccess("Peer disconnected successfully");
			})
			.catch(cause => {
				console.error(cause);
			});
	}

	private getPeerDescription(node: Node) {
		switch (node.label) {
			case "S": return "Server";
			case "SP": return "Super Peer";
			case "P": return "Peer";
			default: return node.label;
		}
	}

	private isServer(node: Node) {
		return node.label === "S";
	}

	private showConnectedEdgeLabels(nodeId: any, show: boolean) {
		const connectedEdges = this.network.getConnectedEdges(nodeId);
		const items = this.edges.get(connectedEdges);

		items.forEach((value: Edge) => {
			// this.edges.update({ id: value.id, label: show ? value.title : null, title: show ? value.title : null });

			console.log("update", value);
		});
	}

	private setupBandwidthChart() {
		const config: ChartConfiguration = {
			type: 'line',
			data: {
				datasets: [{
					label: 'Bandwidth (kbit/s)',
					data: this.bandwidthChartData,	// Count
					borderColor: 'rgb(75, 192, 192)',
					tension: 0.1
				}]
			},
			options: {
				// responsive: true,
				animation: false,
				plugins: {
					title: {
						display: false,
					},
				},
				scales: {
					x: {
						display: true,
						title: {
							display: true,
							text: 'Time'
						},
						ticks: {
							display: false
						}
					},
					y: {
						display: true,
						title: {
							display: false,
							text: 'Bandwidth (kbit/s)'
						},
						suggestedMin: 0,
						ticks: {
							// forces step size to be 50 units
							stepSize: 1
						}
					}
				}
			},
		};

		this.bandwidthChart = new Chart(this.bandwidthChartCanvas, config);
	}

	private setupPeerChart() {
		const config: ChartConfiguration = {
			type: 'line',
			data: {
				datasets: [{
					label: '# of Peers',
					data: this.peerChartData,	// Count
					tension: 0.1
				}]
			},
			options: {
				// responsive: true,
				animation: false,
				plugins: {
					title: {
						display: false,
					},
				},
				scales: {
					x: {
						display: true,
						title: {
							display: true,
							text: 'Time'
						},
						ticks: {
							display: false
						}
					},
					y: {
						display: true,
						title: {
							display: false,
							text: '# of Peers'
						},
						suggestedMin: 0,
						ticks: {
							// forces step size to be 50 units
							stepSize: 1
						}
					}
				}
			},
		};

		this.peerChart = new Chart(this.peerChartCanvas, config);
	}

	private addBandwidthData(data: any) {
		this.bandwidthChart.destroy();
		this.bandwidthChartData.push(data);

		this.setupBandwidthChart();
	}

	private addPeerData(data: any) {
		this.peerChart.destroy();
		this.peerChartData.push(data);

		this.setupPeerChart();
	}

	private setupNetwork() {
		this.nodes = new DataSet([{
			id: "19ba501f-cd70-42ad-855b-8423d0b5c4a2",
			label: "S",
			color: "#F472B6",
			level: 0
		}]);

		this.edges = new DataSet([]);

		// Create a network
		const data: Data = {
			nodes: this.nodes,
			edges: this.edges,
		};
		const options = {
			height: "100%",
			width: "100%",
			autoResize: true,
			nodes: {
				shape: "dot",
			},
			layout: {
				improvedLayout: true,
				clusterThreshold: 150,
				hierarchical: {
					enabled: false,
					levelSeparation: 150,
					nodeSpacing: 100,
					treeSpacing: 200,
					blockShifting: true,
					edgeMinimization: true,
					parentCentralization: true,
					sortMethod: 'hubsize',  // hubsize, directed
					shakeTowards: 'leaves'  // roots, leaves
				}
			},
			interaction: {
				hover: true,
				dragNodes: true,
				zoomView: true,
				dragView: true
			}
		};

		this.network = new Network(this.networkPanel, data, options);
		this.network.on("click", (properties) => {
			const ids = properties.nodes;
			const clickedNodes = this.nodes.get(ids);

			if (clickedNodes && clickedNodes.length > 0) {
				this.selectedNode = clickedNodes[0];

				console.log("selected node", this.selectedNode);
			}
			else {
				this.selectedNode = null;
			}
		});
		this.network.on("hoverNode", (params) => {
			// this.showConnectedEdgeLabels(params.node, true);
		});
		this.network.on("blurNode", (params) => {
			// this.showConnectedEdgeLabels(params.node, false);
		});

		// Center server node.
		setInterval(() => {
			this.network.fit();
		}, 10);
	}
}
