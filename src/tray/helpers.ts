export type MenuOption = Electron.MenuItemConstructorOptions | Electron.MenuItem;

export const noPadding = (label: string) => {
	return label.endsWith('        ') ? label.substring(0, label.length - '        '.length) : label;
};

export const padding = (label: string, padding = true) => {
	return `${noPadding(label)}${padding ? '        ' : ''}`;
};
