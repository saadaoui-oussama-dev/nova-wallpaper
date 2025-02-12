const NeDB = require('nedb');
import { join } from 'path';
import { app } from 'electron';
import { AsyncResponse, DatabaseChannel } from '@/types/channels';

type Database = {
	read: (table: string, query?: { [key: string]: any }) => AsyncResponse<DatabaseChannel>;
	insert: (table: string, data: { [key: string]: any }) => AsyncResponse<DatabaseChannel>;
	update: (table: string, data: { [key: string]: any }) => AsyncResponse<DatabaseChannel>;
};

export const database: Database = new Proxy<Database>({} as Database, {
	get(target: Database, prop: 'read' | 'insert' | 'update') {
		if (prop !== 'read' && prop !== 'insert' && prop !== 'update') return;
		if (prop in target) return target[prop];
		else {
			const dbPath = join(app.getPath('userData'), 'data.db');
			const db = new NeDB({ filename: dbPath, autoload: true });
			const instance: Database = {
				read(table: string, filters: { [key: string]: any } = {}) {
					return new Promise((resolve) => {
						db.find({ ...filters, table })
							.sort({ createdAt: -1 })
							.exec((error: Error | string | null, rows: { [key: string]: any }[]) => {
								if (error) {
									resolve({ doc: null, error: typeof error === 'string' ? error : error.message });
								} else {
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
								}
							});
					});
				},

				insert(table: string, data: { [key: string]: any }) {
					return new Promise((resolve) => {
						const now = Date.now();
						data = { ...data, table, createdAt: now, updatedAt: now };
						delete data.id;
						db.insert(data, (error: Error | string | null, newDoc: any) => {
							if (error) {
								resolve({ doc: null, error: typeof error === 'string' ? error : error.message });
							} else {
								resolve({ doc: { createdAt: newDoc.createdAt, id: newDoc._id }, error: '' });
							}
						});
					});
				},

				update(table: string, data: { [key: string]: any }) {
					return new Promise((resolve) => {
						const filters = data.id ? { _id: data.id, table } : { table };
						data = { ...data, updatedAt: Date.now() };
						delete data.id;
						db.update(filters, { $set: data }, { multi: true }, (error: Error | string | null, numReplaced: number) => {
							if (error) {
								resolve({ doc: null, error: typeof error === 'string' ? error : error.message });
							} else {
								resolve({ doc: numReplaced, error: '' });
							}
						});
					});
				},
			};

			Object.assign(database, instance);
			return instance[prop];
		}
	},
});
