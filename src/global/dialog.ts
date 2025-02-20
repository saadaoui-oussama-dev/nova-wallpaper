import { SimpleMap } from '@/types/wallpaper';

export type Selector =
	| 'container'
	| 'visibleContainer'
	| 'modal'
	| 'visibleModal'
	| 'title'
	| 'buttons'
	| 'button'
	| 'buttonHover';

export type DialogStyle = SimpleMap | ((args: SimpleMap) => SimpleMap);

export type DialogButton = {
	text?: string;
	textColor?: string;
	backgroundColor?: string;
	backgroundColorHover?: string;
};

export type DialogOptions = Partial<{
	neutralBtn: string | DialogButton;
	cancelBtn: string | DialogButton;
	primaryBtn: string | (DialogButton & { danger?: boolean });
	closable: boolean;
	rtl: boolean;
	styles: { [selector in Selector]?: DialogStyle };
}>;

const styles: DialogOptions['styles'] = {
	container: {
		position: 'absolute',
		width: '100vw',
		height: '100vh',
		top: '0',
		left: '0',
		zIndex: '9999999999',
		backgroundColor: '#00000000',
		transition: 'background-color 0.3s ease-in-out',
	},
	visibleContainer: {
		backgroundColor: '#00000060',
	},
	modal: {
		position: 'fixed',
		top: '57%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		minWidth: '300px',
		maxWidth: '85vw',
		padding: '14px',
		backgroundColor: 'var(--body-bg, #1e1e1e)',
		border: '1px solid var(--border-color, #2e2e2e)',
		borderRadius: '7px',
		boxShadow: '0 4px 4px #00000080',
		visibility: 'hidden',
		opacity: '0',
		transition: 'top 0.3s ease-in-out, opacity 0.3s ease-in-out',
	},
	visibleModal: {
		top: '47%',
		visibility: 'visible',
		opacity: '1',
	},
	title: {
		fontSize: '17px',
		color: '#ffffff',
		fontFamily: "system-ui, 'Trebuchet MS', 'Segoe UI', Helvetica, Arial, sans-serif",
	},
	buttons: ({ rtl }) => ({
		marginTop: '14px',
		display: 'flex',
		justifyContent: 'flex-end',
		gap: '14px',
		flexDirection: rtl ? 'row-reverse' : 'row',
	}),
	button: ({ backgroundColor, textColor }) => ({
		backgroundColor: backgroundColor as string,
		color: textColor as string,
		display: 'block',
		padding: '8px 20px',
		border: 'none',
		borderRadius: '7px',
		cursor: 'pointer',
		fontSize: '14px',
		fontWeight: '500',
		fontFamily: "system-ui, 'Trebuchet MS', 'Segoe UI', Helvetica, Arial, sans-serif",
		transition: 'background-color 0.15s ease-in-out',
	}),
	buttonHover: ({ backgroundColorHover }) => ({
		backgroundColor: backgroundColorHover as string,
	}),
};

const buttons: Record<'neutralBtn' | 'cancelBtn' | 'primaryBtn', (args: SimpleMap) => DialogButton> = {
	neutralBtn: () => ({
		backgroundColor: 'var(--neutral-color, #343434)',
		backgroundColorHover: 'var(--neutral-hover, #444444)',
		textColor: '#ffffff',
	}),
	cancelBtn: () => ({
		backgroundColor: 'var(--danger-color, #a5352b)',
		backgroundColorHover: 'var(--danger-color-hover, #bf2a1b)',
		textColor: '#ffffff',
	}),
	primaryBtn: ({ danger }) => ({
		text: 'Got it!',
		backgroundColor: danger ? 'var(--danger-color, #a5352b)' : 'var(--primary-color, #007bff)',
		backgroundColorHover: danger ? 'var(--danger-color-hover, #bf2a1b)' : 'var(--primary-color-active, #0074f0)',
		textColor: '#ffffff',
	}),
};

const setStyles = (target: HTMLElement, source: DialogOptions['styles'], selector: Selector, args?: SimpleMap) => {
	const getStyles = (styles?: SimpleMap | ((args: SimpleMap) => SimpleMap)) =>
		typeof styles === 'function' ? styles(args || {}) : typeof styles === 'object' ? styles : undefined;
	Object.assign(target.style, { ...(styles && getStyles(styles[selector])), ...getStyles(source && source[selector]) });
};

function createButton(
	button: string | DialogButton | undefined,
	value: boolean | undefined,
	styles: DialogOptions['styles'],
	defaultButton: (args: SimpleMap) => DialogButton,
	response: (value: boolean | undefined) => void
): { ref: 0 | 1; button: HTMLButtonElement | null } {
	button = typeof button === 'string' ? { text: button } : button;
	if (!button && value !== true) return { ref: 0, button: null };
	button = { ...defaultButton(button || {}), ...button };
	if (!button || !button.text || typeof button.text !== 'string') return { ref: 0, button: null };
	const btn = document.createElement('button');
	btn.addEventListener('click', () => response(value));
	btn.textContent = button.text;
	setStyles(btn, styles, 'button', button);
	btn.addEventListener('mouseenter', () => setStyles(btn, styles, 'buttonHover', button));
	btn.addEventListener('mouseleave', () => setStyles(btn, styles, 'button', button));
	return { ref: 1, button: btn };
}

export function useDialog(title: string, options: DialogOptions) {
	const { cancelBtn, neutralBtn, primaryBtn, closable, rtl, styles } = options;

	return new Promise<boolean | undefined>((resolve) => {
		const container = document.createElement('div');
		const modal = document.createElement('div');
		const message = document.createElement('p');
		message.innerHTML = typeof title === 'string' ? title : '';
		const buttonsContainer = document.createElement('div');
		const neutral = createButton(neutralBtn, undefined, styles, buttons.neutralBtn, (v) => response(v));
		const cancel = createButton(cancelBtn, false, styles, buttons.cancelBtn, (v) => response(v));
		const primary = createButton(primaryBtn, true, styles, buttons.primaryBtn, (v) => response(v));

		if (closable !== false) {
			modal.addEventListener('click', (event) => event.stopPropagation());
			container.addEventListener('click', () => response(undefined));
		}

		if (neutral.button) buttonsContainer.appendChild(neutral.button);
		if (cancel.button) buttonsContainer.appendChild(cancel.button);
		if (primary.button) buttonsContainer.appendChild(primary.button);
		modal.appendChild(message);
		modal.appendChild(buttonsContainer);
		container.appendChild(modal);
		document.body.appendChild(container);

		setStyles(message, styles, 'title');
		setStyles(buttonsContainer, styles, 'buttons', { rtl: !!rtl, buttons: neutral.ref + cancel.ref + primary.ref });
		setStyles(modal, styles, 'modal');
		setStyles(container, styles, 'container');

		setTimeout(() => {
			setStyles(container, styles, 'visibleContainer');
			setStyles(modal, styles, 'visibleModal');
		}, 1);

		function response(value: boolean | undefined) {
			setStyles(container, styles, 'container');
			setStyles(modal, styles, 'modal');
			container.addEventListener('transitionend', () => container.remove());
			resolve(value);
		}
	});
}
