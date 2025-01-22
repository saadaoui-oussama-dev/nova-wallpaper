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

export const getFileName = (name: string, type: 'path' | 'filename' | 'nameOnly', cutIn?: number): string => {
	try {
		if (type === 'path') {
			const pathParts = name.split('\\');
			name = pathParts[pathParts.length - 1];
			type = 'filename';
		}
		if (type === 'filename') {
			const filenameParts = name.split('.');
			name = filenameParts.slice(0, filenameParts.length - 1).join('.');
			type = 'nameOnly';
		}
		name = name.replace(/[^a-zA-Z0-9\sа-яёіїєґàáäâãåçèéêëìíîïñòóôõöùúüûýÿ]/gi, ' ');
		name = name.replace(/\s+/g, ' ').trim();
		if (cutIn && cutIn > 2) name = name.substring(0, cutIn);
		return name as string;
	} catch {
		return '';
	}
};
