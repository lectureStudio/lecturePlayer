export * from '@shoelace-style/shoelace/dist/themes/light.css';
export * from '@shoelace-style/shoelace/dist/components/avatar/avatar.js';
export * from '@shoelace-style/shoelace/dist/components/button/button.js';
export * from '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
export * from '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
export * from '@shoelace-style/shoelace/dist/components/divider/divider.js';
export * from '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
export * from '@shoelace-style/shoelace/dist/components/input/input.js';
export * from '@shoelace-style/shoelace/dist/components/menu/menu.js';
export * from '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
export * from '@shoelace-style/shoelace/dist/components/menu-label/menu-label.js';
export * from '@shoelace-style/shoelace/dist/components/option/option.js';
export * from '@shoelace-style/shoelace/dist/components/radio/radio.js';
export * from '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
export * from '@shoelace-style/shoelace/dist/components/select/select.js';
export * from '@shoelace-style/shoelace/dist/components/split-panel/split-panel.js';
export * from '@shoelace-style/shoelace/dist/components/tab/tab.js';
export * from '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
export * from '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
export * from '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
export * from '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';

import { registerIconLibrary } from '@shoelace-style/shoelace/dist/components/icon/library';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path';

// Set the base path to the folder you copied Shoelace's assets to.
setBasePath('/');

registerIconLibrary('default', {
	resolver: name => `/icons/${name}.svg`
});
registerIconLibrary('system', {
	resolver: name => `/icons/${name}.svg`
});