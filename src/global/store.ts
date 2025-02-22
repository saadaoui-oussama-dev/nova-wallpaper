import { defineStore } from 'pinia';
import { NovaWallpaper } from '@/electron-vue/preload';
import { imageJSON, videoJSON } from '@/global/settings';
import { isSupported, replaceFileName } from '@/global/files';
import { Wallpaper, FolderItem } from '@/types/wallpaper';
import { SettingOption } from '@/types/json';
import { Response, FilesChannel, JSONChannel } from '@/types/channels';

type State = {
	activeWallpaper: number;
	wallpapers: Wallpaper[];
	formWallpaper: Wallpaper | null;
	data: {
		[key: string]: { preview: Promise<Response<FilesChannel>> | null; json: Promise<Response<JSONChannel>> | null };
	};
};

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
				const { doc } = await NovaWallpaper.database.invoke('read', 'wallpaper', {
					order_by: { property: 'created_at', type: 'DESC' },
				});
				if (Array.isArray(doc)) this.wallpapers = doc;
				const { doc: active } = await NovaWallpaper.database.invoke('read', 'active');
				this.activeWallpaper = active[0] ? active[0].value : '';
			} catch {
				return;
			}
		},

		async addWallpaper(path: string, content: FolderItem[]) {
			const wallpaper: Wallpaper = {
				id: -2,
				label: '',
				path,
				content: content ? [] : [],
				taskbar: false,
				favorite: false,
				settings: {},
				permissions: {},
				queryParams: {},
			};
			const { doc, error } = await NovaWallpaper.database.invoke('insert', 'wallpaper', wallpaper);
			if (error || !doc || typeof doc.id !== 'number') return false;
			wallpaper.id = doc.id;
			return this.selectWallpaper(wallpaper);
		},

		async selectWallpaper(wallpaper: Wallpaper) {
			const validAction = await this.setActiveWallpaper(wallpaper);
			if (validAction) NovaWallpaper.window.send('show-form');
			return validAction;
		},

		async viewWallpaper() {
			let newWallpaper: Wallpaper | null = null;
			const { doc: _active } = await NovaWallpaper.database.invoke('read', 'active');
			const active = Array.isArray(_active) && _active[0] ? _active[0].value : -1;
			if (active !== -1 && typeof active === 'number') {
				const { doc: list } = await NovaWallpaper.database.invoke('read', 'wallpaper', { where: { id: active } });
				if (Array.isArray(list) && list[0]) newWallpaper = list[0] as Wallpaper;
			}
			this.formWallpaper = null;
			await new Promise((resolve) => setTimeout(resolve, 150));
			this.formWallpaper = newWallpaper;
			if (this.formWallpaper) NovaWallpaper.window.send('show-form');
			else NovaWallpaper.window.send('close-form');
		},

		async setActiveWallpaper(wallpaper: Wallpaper | null) {
			let valid = false;
			try {
				if (!wallpaper) {
					valid = !(await NovaWallpaper.database.invoke('update', 'active', { value: '' })).error;
				} else {
					const { doc, error: err } = await NovaWallpaper.database.invoke('update', 'active', { value: wallpaper.id });
					if (!err && doc !== 0) valid = true;
					else valid = !(await NovaWallpaper.database.invoke('insert', 'active', { value: wallpaper.id })).error;
				}
				await this.readData();
			} catch {
				return false;
			}
			return valid;
		},

		async updateWallpaper(wallpaper: Partial<Wallpaper>) {
			const { error } = await NovaWallpaper.database.invoke('update', 'wallpaper', wallpaper);
			return !error;
		},

		async deleteWallpaper(wallpaper: Partial<Wallpaper>, trigger: 'dashboard' | 'form') {
			const { error } = await NovaWallpaper.database.invoke('delete', 'wallpaper', { id: wallpaper.id }, trigger);
			if (error) return false;
			if (trigger === 'form') NovaWallpaper.window.send('close-form');
			else await this.readData();
			return trigger !== 'form';
		},

		async fetchJSON(wallpaper: Wallpaper, forceFetch: boolean): Promise<Response<JSONChannel>> {
			const src = this.data[wallpaper.path];
			if (!(forceFetch || !src || !src.json)) return src.json;

			let resolver: (value: Response<JSONChannel>) => void = () => undefined as void;

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
					if (isSupported(wallpaper.path, true)) {
						await new Promise((resolve) => setTimeout(resolve, 1));
						Object.assign(data, { exist: true, valid: true });
						data.data = wallpaper.path.endsWith('.mp4') ? videoJSON : imageJSON;
					} else if (wallpaper.path.endsWith('.html')) {
						const filename = replaceFileName(wallpaper.path, { name: 'settings', extension: 'json' });
						const response = await NovaWallpaper.json.invoke('read', filename);
						const livelyFilename = replaceFileName(wallpaper.path, { name: 'LivelyProperties', extension: 'json' });
						const livelyResponse = await NovaWallpaper.json.invoke('read', livelyFilename);
						if (livelyResponse.valid) {
							Object.assign(data, { exist: true, valid: true });
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
				Object.assign(data, { exist: false, valid: false, data: null });
			}

			resolver(data);
			return data;
		},

		async fetchPreview(wallpaper: Wallpaper): Promise<Response<FilesChannel>> {
			const src = this.data[wallpaper.path];
			if (src && src.preview) return src.preview;

			let resolver: (value: Response<FilesChannel>) => void = () => undefined as void;

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
				if (isSupported(wallpaper.path, true)) {
					const response = await NovaWallpaper.files.invoke('get-url', wallpaper.path);
					data.error = response.error;
					data.path = response.path;
				} else if (wallpaper.path.endsWith('.html')) {
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
						const response = await this.fetchPreview({ ...wallpaper, path });
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
