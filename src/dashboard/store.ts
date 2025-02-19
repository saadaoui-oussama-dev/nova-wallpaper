import { defineStore } from 'pinia';
import { NovaWallpaper } from '@/dashboard/preload';
import { imageJSON, videoJSON } from '@/global/settings';
import { isSupported, replaceFileName } from '@/global/files';
import { Wallpaper, WallpaperType, FolderItem } from '@/types/wallpaper';
import { SettingOption } from '@/types/json';
import { AsyncResponse, Response, FilesChannel, JSONChannel } from '@/types/channels';

export interface State {
	activeWallpaper: number;
	wallpapers: Wallpaper[];
	data: { [key: string]: { preview: AsyncResponse<FilesChannel> | null; json: AsyncResponse<JSONChannel> | null } };
	formWallpaper: Wallpaper | null;
}

export const useWallpaperStore = defineStore('wallpaper', {
	// To access the state in the console: const pinia = () => ({ ...window.__VUE_DEVTOOLS_PLUGINS__[1].pluginDescriptor.app.config.globalProperties.$pinia.state.value.wallpaper })

	state: (): State => ({
		activeWallpaper: -3,
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
				this.activeWallpaper = active[0] ? active[0].value : '';
			} catch {
				console.log();
			}
		},

		async addWallpaper(type: WallpaperType, path: string, content: FolderItem[]) {
			const wallpaper = {
				id: -2,
				label: '',
				type,
				path,
				content: content ? [] : [],
				taskbar: false,
				favorite: false,
				settings: {},
				permissions: {},
				queryParams: {},
			};
			const { doc, error } = await NovaWallpaper.database.invoke('insert', 'wallpaper', {
				...wallpaper,
				label: 'Draft',
			});
			if (error || !doc || typeof doc.id !== 'number') return false;
			wallpaper.id = doc.id;
			return this.viewWallpaper(wallpaper);
		},

		async viewWallpaper(wallpaper: Wallpaper) {
			const validAction = await this.setActiveWallpaper(wallpaper, false);
			if (validAction) this.formWallpaper = wallpaper;
			return validAction;
		},

		async setActiveWallpaper(wallpaper: Wallpaper | null, readData = true) {
			let valid = false;
			try {
				if (!wallpaper) {
					valid = !(await NovaWallpaper.database.invoke('update', 'active', { value: '' })).error;
				} else {
					const { doc, error: err } = await NovaWallpaper.database.invoke('update', 'active', { value: wallpaper.id });
					if (!err && doc !== 0) valid = true;
					else valid = !(await NovaWallpaper.database.invoke('insert', 'active', { value: wallpaper.id })).error;
				}
				if (readData) await this.readData();
			} catch {
				console.log();
			}
			return valid;
		},

		async updateWallpaper(wallpaper: Partial<Wallpaper>) {
			const { error } = await NovaWallpaper.database.invoke('update', 'wallpaper', wallpaper);
			return !error;
		},

		async deleteWallpaper(wallpaper: Partial<Wallpaper>) {
			const { error } = await NovaWallpaper.database.invoke('delete', 'wallpaper', { id: wallpaper.id });
			if (error) return false;
			await this.readData();
			return true;
		},

		async fetchJSON(wallpaper: Wallpaper, forceFetch: boolean): AsyncResponse<JSONChannel> {
			const src = this.data[wallpaper.path];
			if (!(forceFetch || !src || !src.json)) return src.json;

			let resolver: (value: Response<JSONChannel>) => void = () => console.log();

			this.data[wallpaper.path] = {
				preview: this.data[wallpaper.path] ? this.data[wallpaper.path].preview : null,
				json:
					forceFetch || !src || !src.json
						? new Promise((resolve) => (resolver = resolve))
						: this.data[wallpaper.path].json,
			};

			const data: Response<JSONChannel> = { exist: false, valid: false, data: null };

			try {
				if (forceFetch || !src || !src.json) {
					if (wallpaper.type === 'image' || wallpaper.type === 'video') {
						await new Promise((resolve) => setTimeout(resolve, 1));
						data.valid = true;
						data.exist = true;
						data.data = wallpaper.type === 'image' ? imageJSON : videoJSON;
					} else if (wallpaper.type === 'webpage') {
						const filename = replaceFileName(wallpaper.path, { name: 'settings', extension: 'json' });
						const response = await NovaWallpaper.json.invoke('read', filename);
						const livelyFilename = replaceFileName(wallpaper.path, { name: 'LivelyProperties', extension: 'json' });
						const livelyResponse = await NovaWallpaper.json.invoke('read', livelyFilename);
						if (livelyResponse.valid) {
							response.valid = true;
							response.exist = true;
							if (!response.data) response.data = { settings: [] };
							if (!response.data.settings) response.data.settings = [];
							Object.entries(livelyResponse.data as { [key: string]: SettingOption }).map(([p, v]) => {
								response.data.settings.push({ ...v, id: p });
							});
						}
						Object.assign(data, response);
					}
				}
			} catch {
				console.log();
			}

			resolver(data);
			return data;
		},

		async fetchPreview(wallpaper: Wallpaper): AsyncResponse<FilesChannel> {
			const src = this.data[wallpaper.path];
			if (src && src.preview) return src.preview;

			let resolver: (value: Response<FilesChannel>) => void = () => console.log();

			this.data[wallpaper.path] = {
				preview: new Promise((resolve) => (resolver = resolve)),
				json: this.data[wallpaper.path] ? this.data[wallpaper.path].json : null,
			};
			if (this.data[wallpaper.path].json === null) {
				this.data[wallpaper.path].json = this.fetchJSON(wallpaper, false);
			}

			const data: Response<FilesChannel> = { path: '', error: '' };

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
						['preview', 'gif'],
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
						const type = attempts[cursor][1] === 'mp4' ? 'video' : 'image';
						const response = await this.fetchPreview({ ...wallpaper, path, type });
						if (response.path) data.path = response.path;
						else if (response.error && !response.error.includes('limit')) cursor++;
						else data.error = `The wallpaper preview<br />exceeds the 40MB limit.`;
					}
					if (cursor === attempts.length)
						data.error =
							'<p>Webpages can only be<br />rendered, not previewed.</p><p style="margin-top: 5px; opacity: 0.5">You can include a preview.png file<br />alongside the HTML file.</p>';
				}
			} catch {
				data.error = 'Unable to access the file.';
			}

			resolver(data);
			return data;
		},
	},
});
