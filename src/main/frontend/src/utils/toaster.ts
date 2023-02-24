export class Toaster {

	public static show(message: string): void {
		this.showNotification(message, "neutral", "info-circle");
	}

	public static showInfo(message: string): void {
		this.showNotification(message, "primary", "info-circle");
	}

	public static showSuccess(message: string): void {
		this.showNotification(message, "success", "check2-circle");
	}

	public static showWarning(message: string): void {
		this.showNotification(message, "warning", "exclamation-triangle");
	}

	public static showError(message: string): void {
		this.showNotification(message, "danger", "exclamation-octagon");
	}

	public static showNotification(message: string, variant: string, icon: string, duration = 3000): void {
		// Always escape HTML for text arguments!
		const div = document.createElement("div");
		div.textContent = message;

		const alert = Object.assign(document.createElement("sl-alert"), {
			variant,
			closable: true,
			duration: duration,
			innerHTML: `
				<sl-icon name="${icon}" slot="icon"></sl-icon>
				<strong>${div.innerHTML}</strong>
			`
		});

		document.body.append(alert);

		alert.toast();
	}
}