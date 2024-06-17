import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { animateTo, shimKeyframesHeightAuto, stopAnimations } from "../../utils/animate";
import { I18nLitElement } from '../i18n-mixin';
import navbarStyles from './navbar.css';

@customElement('player-navbar')
export class PlayerNavbar extends I18nLitElement {

	static override styles = [
		navbarStyles,
	];

	@property({ reflect: false })
	accessor appName: string = "lecture-player";

	@property({ type: Boolean })
	accessor expanded: boolean;

	@query(".nav-collapse")
	accessor collapsible: HTMLElement;


	async expandMenu() {
		if (this.expanded) {
			return undefined;
		}

		this.expanded = true;

		await stopAnimations(this.collapsible);

		const { keyframes, options } = {
			keyframes: [
				{ height: "0" },
				{ height: "auto" }
			],
			options: { duration: 350, easing: "ease" }
		};
		await animateTo(this.collapsible, shimKeyframesHeightAuto(keyframes, this.collapsible.scrollHeight), options);
		this.collapsible.style.height = "auto";
	}

	async hideMenu() {
		if (!this.expanded) {
			return undefined;
		}

		this.expanded = false;

		await stopAnimations(this.collapsible);

		const { keyframes, options } = {
			keyframes: [
				{ height: "auto" },
				{ height: "0" }
			],
			options: { duration: 350, easing: "ease" }
		};
		await animateTo(this.collapsible, shimKeyframesHeightAuto(keyframes, this.collapsible.scrollHeight), options);
		this.collapsible.style.height = "0";
	}

	private async toggleMenu() {
		if (this.expanded) {
			await this.hideMenu();
		}
		else {
			await this.expandMenu();
		}
	}

	override firstUpdated() {
		this.collapsible.style.height = this.expanded ? "auto" : "0";
	}

	override render() {
		return html`
			<nav>
				<div class="nav-container">
					<a href="/" class="nav-brand">${this.appName}</a>

					<sl-button @click="${this.toggleMenu}" class="nav-toggle">
						<sl-icon name="list" label="Navigation"></sl-icon>
					</sl-button>

					<div class="nav-collapse">
						<ul class="nav-item">
							<li>
								<sl-badge variant="neutral">Neutral</sl-badge>
							</li>
						</ul>
						<ul class="nav-item ml-auto">

						</ul>
						<ul class="nav-item ml-auto">
							<li>
								<a href="/">Kurse</a>
							</li>
							<li>
								<a href="/settings">Einstellungen</a>
							</li>
							<li>
								<sl-dropdown>
									<sl-button slot="trigger" caret>Alex Andres</sl-button>
									<sl-menu>
										<sl-menu-item value="add-course"><a href="/course/add">Kurs hinzufügen</a></sl-menu-item>
										<sl-divider></sl-divider>
										<sl-menu-item value="profile"><a href="/profile">Profil</a></sl-menu-item>
										<sl-divider></sl-divider>
										<sl-menu-item value="logout"><a href="/logout">Ausloggen</a></sl-menu-item>
									</sl-menu>
								</sl-dropdown>
							</li>
						</ul>
					</div>
				</div>
			</nav>
		`;
	}
}
