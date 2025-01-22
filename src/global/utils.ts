export type MenuOption = Electron.MenuItemConstructorOptions | Electron.MenuItem;

export const isSupported = (path: string): boolean => {
	return ['.mp4', '.png', '.jpg', '.jpeg', '.html'].some((ext) => path.toLowerCase().endsWith(ext));
};

export const isMediaSupported = (path: string): boolean => {
	return ['.mp4', '.png', '.jpg', '.jpeg'].some((ext) => path.toLowerCase().endsWith(ext));
};

export const noPadding = (label: string) => {
	return label.endsWith('        ') ? label.substring(0, label.length - '        '.length) : label;
};

export const padding = (label: string, padding = true) => {
	return `${noPadding(label)}${padding ? '        ' : ''}`;
};
