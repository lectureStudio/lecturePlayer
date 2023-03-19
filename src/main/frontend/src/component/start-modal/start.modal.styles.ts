import { css } from 'lit';

export const startModalStyles = css`
    :host sl-dialog::part(header-actions) {
        display: none;
    }

    :host sl-dialog article {
        padding: 20px 5px;
    }
`;