import { getFormControls } from "@shoelace-style/shoelace";

export function validateForm(form: HTMLFormElement): boolean {
	let valid = true;
	const formControls = getFormControls(form);

	for (const control: HTMLFormElement of formControls) {
		if (!control.reportValidity()) {
			control.setAttribute("form-input-invalid", "true");
			valid = false;
		}
	}

	return valid;
}
