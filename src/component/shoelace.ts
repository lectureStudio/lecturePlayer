export * from '@shoelace-style/shoelace/dist/themes/light.css';
export * from '@shoelace-style/shoelace/dist/themes/dark.css';
export * from '@shoelace-style/shoelace/dist/components/alert/alert';
export * from '@shoelace-style/shoelace/dist/components/avatar/avatar';
export * from '@shoelace-style/shoelace/dist/components/badge/badge';
export * from '@shoelace-style/shoelace/dist/components/button/button';
export * from '@shoelace-style/shoelace/dist/components/button-group/button-group';
export * from '@shoelace-style/shoelace/dist/components/checkbox/checkbox';
export * from '@shoelace-style/shoelace/dist/components/color-picker/color-picker';
export * from '@shoelace-style/shoelace/dist/components/dialog/dialog';
export * from '@shoelace-style/shoelace/dist/components/divider/divider';
export * from '@shoelace-style/shoelace/dist/components/dropdown/dropdown';
export * from '@shoelace-style/shoelace/dist/components/icon/icon';
export * from '@shoelace-style/shoelace/dist/components/icon-button/icon-button';
export * from '@shoelace-style/shoelace/dist/components/input/input';
export * from '@shoelace-style/shoelace/dist/components/menu/menu';
export * from '@shoelace-style/shoelace/dist/components/menu-item/menu-item';
export * from '@shoelace-style/shoelace/dist/components/menu-label/menu-label';
export * from '@shoelace-style/shoelace/dist/components/option/option';
export * from '@shoelace-style/shoelace/dist/components/radio/radio';
export * from '@shoelace-style/shoelace/dist/components/radio-group/radio-group';
export * from '@shoelace-style/shoelace/dist/components/range/range';
export * from '@shoelace-style/shoelace/dist/components/resize-observer/resize-observer';
export * from '@shoelace-style/shoelace/dist/components/select/select';
export * from '@shoelace-style/shoelace/dist/components/split-panel/split-panel';
export * from '@shoelace-style/shoelace/dist/components/switch/switch';
export * from '@shoelace-style/shoelace/dist/components/tab/tab';
export * from '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel';
export * from '@shoelace-style/shoelace/dist/components/tab-group/tab-group';
export * from '@shoelace-style/shoelace/dist/components/textarea/textarea';
export * from '@shoelace-style/shoelace/dist/components/tooltip/tooltip';
export * from '@shoelace-style/shoelace/dist/components/visually-hidden/visually-hidden';

import { registerIconLibrary } from '@shoelace-style/shoelace/dist/components/icon/library';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path';

// Set the base path to the folder you copied Shoelace's assets to.
setBasePath('/');

registerIconLibrary('default', {
	resolver: name => `/icons/${name}.svg`
});