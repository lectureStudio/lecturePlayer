import { SlPopup } from "@shoelace-style/shoelace";
import { t } from "i18next";
import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { uiStateStore } from "../../store/ui-state.store";
import { animateTo, shimKeyframesHeightAuto, stopAnimations } from "../../utils/animate";
import { Component } from "../component";
import navbarStyles from './navbar.css';

@customElement('player-navbar')
export class PlayerNavbar extends Component {

	static override styles = [
		navbarStyles,
	];

	@property({ reflect: false })
	accessor appName: string = "lecture-player";

	@property({ type: Boolean })
	accessor expanded: boolean;

	@property({ type: Boolean })
	accessor expandedPopup: boolean;

	@query(".nav-collapse")
	accessor collapsible: HTMLElement;

	@query("#user-popup")
	accessor popup: SlPopup;


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

	async expandUserMenu() {
		await stopAnimations(this.popup.popup);

		this.popup.active = true;

		const { keyframes, options } = {
			keyframes: [
				{ opacity: 0, scale: 0.9 },
				{ opacity: 1, scale: 1 }
			],
			options: { duration: 100, easing: "ease" }
		};
		await animateTo(this.popup.popup, keyframes, options);
	}

	async hideUserMenu() {
		await stopAnimations(this.popup.popup);

		const { keyframes, options } = {
			keyframes: [
				{ opacity: 1, scale: 1 },
				{ opacity: 0, scale: 0.9 }
			],
			options: { duration: 100, easing: "ease" }
		};
		await animateTo(this.popup.popup, keyframes, options);

		this.popup.active = false;
	}

	private async toggleMenu() {
		if (this.expanded) {
			await this.hideMenu();
		}
		else {
			await this.expandMenu();
		}
	}

	private async toggleUserMenu() {
		if (this.expandedPopup) {
			await this.hideUserMenu();
		}
		else {
			await this.expandUserMenu();
		}

		this.expandedPopup = !this.expandedPopup;
	}

	override firstUpdated() {
		this.collapsible.style.height = this.expanded ? "auto" : "0";
		this.popup.active = this.expandedPopup;
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
								<sl-badge variant="neutral">${t(`media.profile.${uiStateStore.mediaProfile}`)}</sl-badge>
							</li>
						</ul>
						<ul class="nav-item ml-auto">

						</ul>
						<ul class="nav-item ml-auto">
							<li>
								<a href="/">${t("nav.courses")}</a>
							</li>
							<li>
								<a href="/settings">${t("nav.settings")}</a>
							</li>
							<li>
								<sl-button @click="${this.toggleUserMenu}" id="external-anchor" caret>Alex Andres</sl-button>
								<sl-popup anchor="external-anchor" placement="bottom-end" id="user-popup">
									<sl-menu>
										<sl-menu-item value="add-course"><a href="/course/add">${t("nav.course.add")}</a></sl-menu-item>
										<sl-divider></sl-divider>
										<sl-menu-item value="profile"><a href="/profile">${t("nav.profile")}</a></sl-menu-item>
										<sl-divider></sl-divider>
										<sl-menu-item value="logout"><a href="/logout">${t("nav.logout")}</a></sl-menu-item>
									</sl-menu>
								</sl-popup>
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
