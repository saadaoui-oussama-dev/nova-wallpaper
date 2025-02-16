const NeDB = require('nedb');
import { join } from 'path';
import { app } from 'electron';
import { AsyncResponse, DatabaseChannel } from '@/types/channels';

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
	const db = new NeDB({ filename: join(app.getPath('userData'), '../Nova Wallpaper/data.db'), autoload: true });

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
