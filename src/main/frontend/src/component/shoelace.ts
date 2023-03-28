export * from '@shoelace-style/shoelace/dist/themes/light.css';
export * from '@shoelace-style/shoelace/dist/themes/dark.css';
export * from '@shoelace-style/shoelace/dist/components/alert/alert.js';
export * from '@shoelace-style/shoelace/dist/components/button/button';
export * from '@shoelace-style/shoelace/dist/components/button-group/button-group';
export * from '@shoelace-style/shoelace/dist/components/color-picker/color-picker.js';
export * from '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
export * from '@shoelace-style/shoelace/dist/components/divider/divider';
export * from '@shoelace-style/shoelace/dist/components/icon/icon';
export * from '@shoelace-style/shoelace/dist/components/input/input.js';
export * from '@shoelace-style/shoelace/dist/components/checkbox/checkbox';
export * from '@shoelace-style/shoelace/dist/components/dropdown/dropdown';
export * from '@shoelace-style/shoelace/dist/components/menu/menu';
export * from '@shoelace-style/shoelace/dist/components/menu-item/menu-item';
export * from '@shoelace-style/shoelace/dist/components/menu-label/menu-label';
export * from '@shoelace-style/shoelace/dist/components/option/option.js';
export * from '@shoelace-style/shoelace/dist/components/radio/radio.js';
export * from '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
export * from '@shoelace-style/shoelace/dist/components/range/range.js';
export * from '@shoelace-style/shoelace/dist/components/resize-observer/resize-observer.js';
export * from '@shoelace-style/shoelace/dist/components/select/select.js';
export * from '@shoelace-style/shoelace/dist/components/split-panel/split-panel.js';
export * from '@shoelace-style/shoelace/dist/components/switch/switch.js';
export * from '@shoelace-style/shoelace/dist/components/tab/tab.js';
export * from '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
export * from '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
export * from '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
export * from '@shoelace-style/shoelace/dist/components/tooltip/tooltip';
export * from '@shoelace-style/shoelace/dist/components/visually-hidden/visually-hidden';

import { registerIconLibrary } from '@shoelace-style/shoelace/dist/components/icon/library';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path';

setBasePath('/js/shoelace');

registerIconLibrary('lect-icons', {
	resolver: name => `/icons/${name}.svg`
});