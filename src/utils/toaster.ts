export class Toaster {

	public static show(title: string, message?: string, duration = 3000): void {
		this.showNotification(title, message, "neutral", "info-circle", duration);
	}

	public static showInfo(title: string, message?: string, duration = 3000): void {
		this.showNotification(title, message, "primary", "info-circle", duration);
	}

	public static showSuccess(title: string, message?: string, duration = 3000): void {
		this.showNotification(title, message, "success", "check2-circle", duration);
	}

	public static showWarning(title: string, message?: string, duration = 3000): void {
		this.showNotification(title, message, "warning", "exclamation-triangle", duration);
	}

	public static showError(title: string, message?: string, duration = 3000): void {
		this.showNotification(title, message, "danger", "exclamation-octagon", duration);
	}

	public static showNotification(title: string, message: string | undefined, variant: string, icon: string, duration = 3000): Promise<void> {
		const alert = Object.assign(document.createElement("sl-alert"), {
			variant,
			closable: true,
			duration: duration,
			innerHTML: `
				<sl-icon name="${icon}" slot="icon"></sl-icon>
				${this.createContent(title, message)}
			`
		});

		document.body.append(alert);

		return alert.toast();
	}

	private static createContent(title: string, message?: string) {
		// Always escape HTML for text arguments!
		const div = document.createElement("div");
		const strong = document.createElement("strong");
		strong.textContent = title;

		div.appendChild(strong);

		if (message != null) {
			const p = document.createElement("p");
			p.textContent = message;

			div.appendChild(p);
		}

		return div.innerHTML;
	}
}
