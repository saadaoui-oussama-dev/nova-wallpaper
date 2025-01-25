export * from '@/global/events';

export const isSupported = (path: string, onlyMedia?: boolean): boolean => {
	const extensions = onlyMedia ? ['.mp4', '.png', '.jpg', '.jpeg'] : ['.mp4', '.png', '.jpg', '.jpeg', '.html'];
	return extensions.some((ext) => path.toLowerCase().endsWith(ext));
};

export const getFileType = (filePath: string): { ext: string; mime: string } => {
	const types: Record<string, string> = {
		mp4: 'video/mp4',
		png: 'image/png',
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		html: 'text/html',
	};
	const filenameParts = filePath.split('.');
	const ext = filenameParts[filenameParts.length - 1].toLowerCase();
	return { ext, mime: types[ext] };
};

export const replaceFileName = (fullPath: string, { name, extension }: { name: string; extension: string }) => {
	const filenameParts = fullPath.split('\\');
	const oldFile = filenameParts[filenameParts.length - 1];
	const oldName = oldFile.slice(0, oldFile.lastIndexOf('.'));
	const oldExtension = oldFile.slice(oldFile.lastIndexOf('.') + 1);
	filenameParts[filenameParts.length - 1] = `${name || oldName}.${extension || oldExtension}`;
	return filenameParts.join('\\');
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
