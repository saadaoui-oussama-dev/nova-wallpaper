export const isSupported = (path: string): boolean => {
	return ['.mp4', '.png', '.jpg', '.jpeg', '.html'].some((ext) => path.toLowerCase().endsWith(ext));
};

export const isMediaSupported = (path: string): boolean => {
	return ['.mp4', '.png', '.jpg', '.jpeg'].some((ext) => path.toLowerCase().endsWith(ext));
};
