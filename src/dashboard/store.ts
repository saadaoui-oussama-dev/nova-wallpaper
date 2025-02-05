import { defineStore } from 'pinia';
import { NovaWallpaper } from '@/dashboard/preload';
import { isSupported, replaceFileName } from '@/global/utils';
import { FilesContentResponse, FilesResponse, JSONResponse } from '@/dashboard/channels';

export type WallpaperType = 'image' | 'video' | 'webpage' | 'folder' | 'stickers';

export type Settings = { [key: string]: string | number | boolean };

export type Permission = { type: 'executable' | 'url' | 'folder'; name: string; label: string; value: string };

export type Query = { key: string; value: string };

export type Wallpaper = {
	id: string;
	label: string;
	type: WallpaperType;
	path: string;
	content: FilesContentResponse[];
	favorite: boolean;
	taskbar: boolean;
	settings: Settings;
	permissions: Permission[];
	queryParams: Query[];
};

export interface State {
	activeWallpaper: string;
	wallpapers: Wallpaper[];
	data: { [key: string]: { preview: Promise<FilesResponse> | null; json: Promise<JSONResponse> | null } };
	formWallpaper: Wallpaper | null;
}

export const useWallpaperStore = defineStore('wallpaper', {
	state: (): State => ({
		activeWallpaper: '',
		wallpapers: [],
		data: {},
		formWallpaper: null,
	}),

	actions: {
		async readData() {
			try {
				const { doc } = await NovaWallpaper.database.invoke('read', 'wallpaper');
				if (Array.isArray(doc)) this.wallpapers = doc;
				const { doc: active } = await NovaWallpaper.database.invoke('read', 'active');
				this.activeWallpaper = active[0].value;
			} catch {
				console.log();
			}
		},

		prepareToAddWallpaper(type: WallpaperType, path: string, content: FilesContentResponse[]) {
			this.formWallpaper = {
				id: '',
				label: '',
				type,
				path,
				content,
				taskbar: false,
				favorite: false,
				settings: {},
				permissions: [],
				queryParams: [],
			};
		},

		discardAdding() {
			if (this.formWallpaper) {
				if (this.wallpapers.every((wallpaper) => this.formWallpaper && wallpaper.path !== this.formWallpaper.path)) {
					if (this.formWallpaper) delete this.data[this.formWallpaper.path];
				}
			}
			this.formWallpaper = null;
		},

		async addWallpaper(wallpaper: Wallpaper) {
			try {
				const { doc } = await NovaWallpaper.database.invoke('insert', 'wallpaper', wallpaper);
				this.formWallpaper = null;
				await this.setActiveWallpaper(doc as Wallpaper);
			} catch {
				console.log();
			}
		},

		async setActiveWallpaper(wallpaper: Wallpaper) {
			try {
				const { doc } = await NovaWallpaper.database.invoke('update', 'active', { value: wallpaper.id });
				if (doc === 0) await NovaWallpaper.database.invoke('insert', 'active', { value: wallpaper.id });
				await this.readData();
			} catch {
				console.log();
			}
		},

		async toggleFavorite(wallpaper: Wallpaper) {
			await NovaWallpaper.database.invoke('update', 'wallpaper', { id: wallpaper.id, favorite: !wallpaper.favorite });
			await this.readData();
		},

		async fetchJSON(wallpaper: Wallpaper, forceFetch: boolean): Promise<JSONResponse> {
			const src = this.data[wallpaper.path];
			forceFetch = forceFetch || !src || !src.json;
			if (!(forceFetch || !src || !src.json)) return src.json;

			let resolver: (value: JSONResponse) => void = () => console.log();

			this.data[wallpaper.path] = {
				preview: this.data[wallpaper.path] ? this.data[wallpaper.path].preview : null,
				json:
					forceFetch || !src || !src.json
						? new Promise<JSONResponse>((resolve) => (resolver = resolve))
						: this.data[wallpaper.path].json,
			};

			const data: JSONResponse = { exist: false, valid: false, data: null };

			try {
				if (forceFetch || !src || !src.json) {
					if (wallpaper.type === 'image' || wallpaper.type === 'video') {
						await new Promise((resolve) => setTimeout(resolve, 1));
						data.valid = true;
						data.exist = true;
						data.data = { settings: ['default'] };
					} else if (wallpaper.type === 'webpage') {
						const filename = replaceFileName(wallpaper.path, { name: 'settings', extension: 'json' });
						const response = await NovaWallpaper.json.invoke('read', filename);
						data.valid = response.valid;
						data.exist = response.exist;
						data.data = response.data;
					}
				}
			} catch {
				console.log();
			}

			resolver(data);
			return data;
		},

		async fetchPreview(wallpaper: Wallpaper): Promise<FilesResponse> {
			const src = this.data[wallpaper.path];
			if (src && src.preview) return src.preview;

			let resolver: (value: FilesResponse) => void = () => console.log();

			this.data[wallpaper.path] = {
				preview: new Promise<FilesResponse>((resolve) => (resolver = resolve)),
				json: this.data[wallpaper.path] ? this.data[wallpaper.path].json : null,
			};
			if (this.data[wallpaper.path].json === null) {
				this.data[wallpaper.path].json = this.fetchJSON(wallpaper, false);
			}

			const data: FilesResponse = { path: '', error: '' };

			try {
				const json = await this.data[wallpaper.path].json;
				if (wallpaper.type === 'image' || wallpaper.type === 'video') {
					const response = await NovaWallpaper.files.invoke('get-url', wallpaper.path);
					data.error = response.error;
					data.path = response.path;
				} else if (wallpaper.type === 'webpage') {
					const attempts = [
						['preview', 'png'],
						['preview', 'jpg'],
						['preview', 'jpeg'],
						['preview', 'mp4'],
					];
					if (json && json.data && typeof json.data.preview === 'string') {
						if (json.data.preview && isSupported(json.data.preview, true)) {
							const parts = json.data.preview.split('.');
							const filename = parts.slice(0, parts.length - 1).join('.');
							const extension = parts[parts.length - 1];
							if (filename !== 'preview') attempts.unshift([filename, extension]);
						}
					}
					let cursor = 0;
					while (!data.error && !data.path && cursor < attempts.length) {
						const path = replaceFileName(wallpaper.path, { name: attempts[cursor][0], extension: attempts[cursor][1] });
						const response = await NovaWallpaper.files.invoke('get-url', path);
						if (response.path) data.path = response.path;
						else if (response.error?.includes('limit'))
							data.error = `The wallpaper preview<br />exceeds the 40MB limit.`;
						else cursor++;
					}
					if (cursor === attempts.length)
						data.error =
							'<p>Webpages can only be<br />rendered, not previewed.</p><p style="margin-top: 5px; opacity: 0.5">You can include a preview.png file<br />alongside the HTML file.</p>';
				}
			} catch {
				data.error = 'Unable to access the file.';
				console.log();
			}

			resolver(data);
			return data;
		},
	},
});
