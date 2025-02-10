import path from 'path';
import { app } from 'electron';
const NeDB = require('nedb');

import { DatabaseResponse } from '@/dashboard/channels';

type Database = {
	read: (table: string, query?: { [key: string]: any }) => Promise<DatabaseResponse>;
	insert: (table: string, data: { [key: string]: any }) => Promise<DatabaseResponse>;
	update: (table: string, data: { [key: string]: any }) => Promise<DatabaseResponse>;
};

export const database: Database = new Proxy<Database>({} as Database, {
	get(target: Database, prop: 'read' | 'insert' | 'update') {
		if (prop !== 'read' && prop !== 'insert' && prop !== 'update') return;
		if (prop in target) return target[prop];
		else {
			const dbPath = path.join(app.getPath('userData'), 'data.db');
			const db = new NeDB({ filename: dbPath, autoload: true });
			const instance = {
				read(table: string, query: { [key: string]: any } = {}): Promise<DatabaseResponse> {
					return new Promise<DatabaseResponse>((resolve) => {
						db.find({ ...query, table })
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

				insert(table: string, data: { [key: string]: any }): Promise<DatabaseResponse> {
					delete data.id;
					return new Promise<DatabaseResponse>((resolve) => {
						db.insert({ ...data, table, createdAt: Date.now() }, (error: Error | string | null, newDoc: any) => {
							if (error) {
								resolve({ doc: null, error: typeof error === 'string' ? error : error.message });
							} else {
								resolve({ doc: { createdAt: newDoc.createdAt, id: newDoc._id }, error: '' });
							}
						});
					});
				},

				update(table: string, data: { [key: string]: any }): Promise<DatabaseResponse> {
					data = { ...data };
					const query = data.id ? { _id: data.id } : {};
					delete data.id;
					return new Promise<DatabaseResponse>((resolve) => {
						db.update(
							{ ...query, table },
							{ $set: data },
							{ multi: true },
							(error: Error | string | null, numReplaced: number) => {
								if (error) {
									resolve({ doc: null, error: typeof error === 'string' ? error : error.message });
								} else {
									resolve({ doc: numReplaced, error: '' });
								}
							}
						);
					});
				},
			};

			Object.assign(database, instance);
			return instance[prop];
		}
	},
});
