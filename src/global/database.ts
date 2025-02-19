const SQLite = require('better-sqlite3');
import bindings from 'bindings';
import { join } from 'path';
import { app } from 'electron';
import { joinPublic } from '@/global/utils';
import { Response, DatabaseChannel } from '@/types/channels';

const node = bindings({ bindings: 'better-sqlite3', module_root: joinPublic('@/public') });

type ReadOptions = {
	where?: { [key: string]: any };
};

type Database = {
	read: (table: string, options?: ReadOptions) => Response<DatabaseChannel>;
	insert: (table: string, entry: { [key: string]: any }) => Response<DatabaseChannel>;
	update: (table: string, entry: { [key: string]: any }) => Response<DatabaseChannel>;
	delete: (table: string, entry: { [key: string]: any }) => Response<DatabaseChannel>;
};

export const database: Database = new Proxy<Database>({} as Database, {
	get(target: Database, prop: 'read' | 'insert' | 'update' | 'delete') {
		if (prop !== 'read' && prop !== 'insert' && prop !== 'update' && prop !== 'delete') return;
		if (prop in target) return target[prop];
		else return initDatabase()[prop];
	},
});

const initDatabase = (): Database => {
	const db = new SQLite(join(app.getPath('userData'), '../Nova Wallpaper/data.db'), { nativeBinding: node });
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

	const json = ['settings', 'permissions', 'queryParams', 'content'];

	const boolean = ['favorite', 'taskbar'];

	const adaptEntry = (data: { [key: string]: any }, insert: boolean) => {
		try {
			data = { ...data, updated_at: Date.now() };
			if (insert) data.created_at = data.updated_at;
			const id = typeof data.id === 'number' ? data.id : undefined;
			delete data.id;
			const entries: [string, any][] = Object.entries(data).map(([key, value]) => {
				if (boolean.includes(key)) value = value ? 1 : 0;
				if (json.includes(key)) value = JSON.stringify(value);
				return [key, value];
			});
			const values = entries.map(([_, value]) => value);
			return { id, entries, values, error: '' };
		} catch {
			return { id: undefined, entries: [], values: [], error: 'Invalid data.' };
		}
	};

	const instance: Database = {
		read: (table: string, { where }: ReadOptions = {}) => {
			if (table !== 'wallpaper' && table !== 'active') return { doc: null, error: 'Invalid table name.' };
			try {
				let filterEntries = where ? Object.entries(where) : [];
				try {
					filterEntries = filterEntries.map(([key, value]) => {
						if (boolean.includes(key)) value = value ? 1 : 0;
						if (json.includes(key)) value = JSON.stringify(value);
						return [key, value];
					});
				} catch {
					return { doc: null, error: 'Invalid Filters.' };
				}
				const filterClause = filterEntries.map(([key]) => `${key} = ?`).join(' AND ');
				const filterValues = filterEntries.map(([_, value]) => value);
				const sql = filterEntries.length ? `SELECT * FROM ${table} WHERE ${filterClause}` : `SELECT * FROM ${table}`;
				const rows = filterEntries.length > 0 ? db.prepare(sql).all(...filterValues) : db.prepare(sql).all();
				if (table === 'wallpaper') {
					rows.forEach((row: { [key: string]: any }) => {
						boolean.forEach((key) => key in row && (row[key] = row[key] ? true : false));
						json.forEach((key) => key in row && typeof row[key] === 'string' && (row[key] = JSON.parse(row[key])));
					});
				}
				return { doc: rows, error: '' };
			} catch (error) {
				return { doc: null, error: getError(error) };
			}
		},

		insert: (table: string, entry: { [key: string]: any }) => {
			if (table !== 'wallpaper' && table !== 'active') return { doc: null, error: 'Invalid table name.' };
			const { entries, values, error } = adaptEntry(entry, true);
			if (error) return { doc: null, error };
			try {
				entry.created_at = entry.updated_at;
				const keys = entries.map(([key]) => key).join(', ');
				const placeholders = entries.map(() => '?').join(', ');
				const result = db.prepare(`INSERT INTO ${table} (${keys}) VALUES (${placeholders})`).run(...values);
				return { doc: { id: result.lastInsertRowid }, error: '' };
			} catch (error) {
				return { doc: null, error: getError(error) };
			}
		},

		update: (table: string, entry: { [key: string]: any }) => {
			if (table !== 'wallpaper' && table !== 'active') return { doc: null, error: 'Invalid table name.' };
			const { id, entries, values, error } = adaptEntry(entry, false);
			if (error) return { doc: null, error };
			try {
				const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
				let sql = `UPDATE ${table} SET ${setClause}`;
				if (typeof id === 'number') {
					sql += ' WHERE id = ?';
					values.push(id);
				}
				const result = db.prepare(sql).run(...values);
				return { doc: result.changes, error: '' };
			} catch (error) {
				return { doc: null, error: getError(error) };
			}
		},

		delete: (table: string, entry: { [key: string]: any }) => {
			if (table !== 'wallpaper' && table !== 'active') return { doc: null, error: 'Invalid table name.' };
			if (typeof entry.id !== 'string' && typeof entry.id !== 'number') return { doc: null, error: 'Invalid id.' };
			try {
				const result = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(entry.id);
				return { doc: result.changes, error: '' };
			} catch (error) {
				return { doc: null, error: getError(error) };
			}
		},
	};

	Object.assign(database, instance);
	return instance;
};

const getError = (error: any) =>
	error && 'message' in error ? (error.message as string) : typeof error === 'string' ? error : '';
