const NeDB = require('nedb');
const SQLite = require('better-sqlite3');
import bindings from 'bindings';
import { join } from 'path';
import { app } from 'electron';
import { joinPublic } from '@/global/utils';
import { AsyncResponse, DatabaseChannel } from '@/types/channels';

const better_sqlite3 = bindings({
	bindings: 'better_sqlite3',
	module_root: joinPublic('@/public/build/better-sqlite3'),
});

type Database = {
	read: (table: string, filters?: { [key: string]: any }) => AsyncResponse<DatabaseChannel>;
	insert: (table: string, data: { [key: string]: any }) => AsyncResponse<DatabaseChannel>;
	update: (table: string, data: { [key: string]: any }) => AsyncResponse<DatabaseChannel>;
};

export const database: Database = new Proxy<Database>({} as Database, {
	get(target: Database, prop: 'read' | 'insert' | 'update') {
		if (prop !== 'read' && prop !== 'insert' && prop !== 'update') return;
		if (prop in target) return target[prop];
		else return initDatabase()[prop];
	},
});

const initDatabase = (): Database => {
	const db = new SQLite(join(app.getPath('userData'), '../Nova Wallpaper/data.db'), { nativeBinding: better_sqlite3 });
	db.pragma('journal_mode = WAL');

	db.prepare(
		`
			CREATE TABLE IF NOT EXISTS wallpaper (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL,
				label TEXT NOT NULL,
				type TEXT NOT NULL,
				path TEXT NOT NULL,
				favorite INTEGER NOT NULL CHECK(favorite IN (0, 1)),
				taskbar INTEGER NOT NULL CHECK(taskbar IN (0, 1)),
				settings TEXT NOT NULL,
				permissions TEXT NOT NULL,
				queryParams TEXT NOT NULL,
				content TEXT NOT NULL
			);
		`
	).run();

	db.prepare(
		`
			CREATE TABLE IF NOT EXISTS active (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL,
				value INTEGER NOT NULL
			);
		`
	).run();

	const JSONs = ['settings', 'permissions', 'queryParams', 'content'];

	const Booleans = ['favorite', 'taskbar'];

	const instance: Database = {
		read: async () => {
			return new Promise((resolve) => {
				console.log('Database is not prepared yet.');
				resolve({ doc: null, error: 'Database is not prepared yet.' });
			});
		},
		insert: async () => {
			return new Promise((resolve) => {
				console.log('Database is not prepared yet.');
				resolve({ doc: null, error: 'Database is not prepared yet.' });
			});
		},
		update: async () => {
			return new Promise((resolve) => {
				console.log('Database is not prepared yet.');
				resolve({ doc: null, error: 'Database is not prepared yet.' });
			});
		},
	};

	Object.assign(database, instance);
	return instance;
};

const initDatabaseOldNeDBDatabase = (): Database => {
	const db = new NeDB({ filename: join(app.getPath('userData'), '../Nova Wallpaper/data-old.db'), autoload: true });

	const instance: Database = {
		read(table: string, filters: { [key: string]: any } = {}) {
			filters = 'id' in filters ? { ...filters, _id: filters.id } : { ...filters };
			delete filters.id;
			return new Promise((resolve) => {
				try {
					db.find({ ...filters, table })
						.sort({ createdAt: -1 })
						.exec((error: Error, rows: { [key: string]: any }[]) => {
							if (error) return resolve({ doc: null, error: getError(error) });
							const ids: string[] = [];
							const row = rows.map((data) => {
								if (!data) return;
								data = { ...data };
								data.id = data._id;
								delete data._id;
								if (!data.id || ids.includes(data.id)) return;
								ids.push(data.id);
								return data;
							});
							resolve({ doc: row.filter((data) => data), error: '' });
						});
				} catch (error) {
					resolve({ doc: null, error: getError(error) });
				}
			});
		},

		insert(table: string, data: { [key: string]: any }) {
			return new Promise((resolve) => {
				try {
					const now = Date.now();
					data = { ...data, table, createdAt: now, updatedAt: now };
					delete data.id;
					db.insert(data, (error: Error, newDoc: any) => {
						error
							? resolve({ doc: null, error: getError(error) })
							: resolve({ doc: { createdAt: newDoc.createdAt, id: newDoc._id }, error: '' });
					});
				} catch (error) {
					resolve({ doc: null, error: getError(error) });
				}
			});
		},

		update(table: string, data: { [key: string]: any }) {
			return new Promise((resolve) => {
				try {
					const filters = 'id' in data ? { _id: data.id, table } : { table };
					data = { ...data, updatedAt: Date.now() };
					delete data.id;
					db.update(filters, { $set: data }, { multi: true }, (error: Error, numReplaced: number) => {
						error ? resolve({ doc: null, error: getError(error) }) : resolve({ doc: numReplaced, error: '' });
					});
				} catch (error) {
					resolve({ doc: null, error: getError(error) });
				}
			});
		},
	};

	Object.assign(database, instance);
	return instance;
};

const getError = (error: any) =>
	error && 'message' in error ? (error.message as string) : typeof error === 'string' ? error : '';
