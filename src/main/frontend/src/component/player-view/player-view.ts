import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { SlideView } from '../slide-view/slide-view';
import { PlayerViewController } from './player-view.controller';
import { playerViewStyles } from './player-view.styles';
import { SlSplitPanel } from '@shoelace-style/shoelace';
import { Data, DataSet, Edge, Network, Node } from "vis-network/standalone";
import { HttpRequest } from '../../utils/http-request';
import { Toaster } from '../../utils/toaster';

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

	selectedNode: Node;


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
		document.addEventListener("p2p-document-loaded", (event: CustomEvent) => {
			const peer = event.detail;

			this.onDocumentLoaded(peer);
		});
	}

	protected firstUpdated() {
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

			this.requestUpdate();
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

	protected render() {
		return html`
			<div class="left-container">
				<div class="left-top">
					<span>Join the demo on the web!</span>
					<sl-qr-code value="https://lecturestudio.dek.e-technik.tu-darmstadt.de/" label="Scan this code to visit the demo on the web!"></sl-qr-code>
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
						<sl-input type="number" name="server-bandwidth" label="Server Bandwidth (MBit/s)" placeholder="Server Bandwidth" size="small" min="1" max="1000" value="10"></sl-input>
						<sl-input type="number" name="peers-max" label="Peers" placeholder="Number of Peers" size="small" min="1" max="1000" value="10"></sl-input>
						<sl-input type="number" name="super-peers-max" label="Super-Peers" placeholder="Number of Super-Peers" size="small" min="1" max="10"  value="2"></sl-input>
						<sl-input type="number" name="super-peer-bandwidth-threshold" label="Super-Peer Bandwidth Threshold (MBit/s)" placeholder="Super-Peer Bandwidth Threshold" size="small" min="1" max="1000000" value="20"></sl-input>
						<sl-button @click="${this.post}" variant="neutral" size="small" form="demo-form">Start</sl-button>
					</form>
				</div>
				${when(this.selectedNode, () => html`
					<div class="selected-node">
						<dt>ID</dt>
						<dd>${this.selectedNode.id}</dd>
						<dt>Type</dt>
						<dd>${this.getPeerDescription(this.selectedNode.label)}</dd>

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
			label: client.type === "SUPER_PEER" ? "SP" : "P",
			level: client.type === "SUPER_PEER" ? 1 : 2,
			color: {
				border: client.type === "SUPER_PEER" ? "#A78BFA" : "#60A5FA",
				background: client.type === "SUPER_PEER" ? "#A78BFA" : "#60A5FA",
			}
		});

		for (const server of client.servers) {
			const bandwidth = Math.min(client.bandwidth, server.bandwidth);

			this.edges.add({
				from: client.uid,
				to: server.uid,
				value: bandwidth,
				title: "Bandwidth: " + bandwidth
			});
		}
	}

	private onLeft(client: any) {
		console.log("left", client);

		this.nodes.remove(client.uid);
	}

	private onDocumentLoaded(client: any) {
		console.log("loaded", this.nodes.get(client.uid));

		const node = this.nodes.get(client.uid) as Node;
		node.color = {
			border: "#059669",
		};

		this.nodes.update(node);
	}

	private post(event: Event): void {
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
				Toaster.showSuccess("Peer disconnected successfully")
			})
			.catch(cause => {
				console.error(cause);
			});
	}

	private getPeerDescription(type: string) {
		switch (type) {
			case "S": return "Server";
			case "SP": return "Super Peer";
			case "P": return "Peer";
			default: return "Unknown";
		}
	}

	private isServer(node: Node) {
		return node.label === "S";
	}

	private showConnectedEdgeLabels(nodeId: any, show: boolean) {
		const connectedEdges = this.network.getConnectedEdges(nodeId);
		const items = this.edges.get(connectedEdges);

		items.forEach((value: Edge) => {
			this.edges.update({ id: value.id, label: show ? value.title : null, title: show ? value.title : null });

			console.log("update", value);
		});
	}
}
