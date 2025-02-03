import path from 'path';
import { app } from 'electron';
const NeDB = require('nedb');

import { DatabaseResponse } from '@/dashboard/channels';

let database: {
	read: (table: string, query?: { [key: string]: any }) => Promise<DatabaseResponse>;
	insert: (table: string, data: { [key: string]: any }) => Promise<DatabaseResponse>;
	update: (table: string, data: { [key: string]: any }) => Promise<DatabaseResponse>;
};

export const openDatabase = () => {
	if (database) return database;
	const dbPath = path.join(app.getPath('userData'), 'data.db');
	const db = new NeDB({ filename: dbPath, autoload: true });
	database = {
		read(table: string, query: { [key: string]: any } = {}): Promise<DatabaseResponse> {
			query = Object.fromEntries(Object.entries(query).map(([k, v]) => [`data.${k}`, v]));
			return new Promise<DatabaseResponse>((resolve) => {
				db.find({ ...query, table })
					.sort({ createdAt: -1 })
					.exec((error: Error | string | null, rows: { data: { [key: string]: any }; _id: string }[]) => {
						if (error) {
							resolve({ doc: null, error: typeof error === 'string' ? error : error.message });
						} else {
							resolve({ doc: rows.map(({ data, _id }) => ({ ...data, id: _id })), error: '' });
						}
					});
			});
		},

		insert(table: string, data: { [key: string]: any }): Promise<DatabaseResponse> {
			return new Promise<DatabaseResponse>((resolve) => {
				db.insert({ table, data, createdAt: Date.now() }, (error: Error | string | null, newDoc: any) => {
					if (error) {
						resolve({ doc: null, error: typeof error === 'string' ? error : error.message });
					} else {
						resolve({ doc: { ...data, createdAt: newDoc.createdAt, id: newDoc._id }, error: '' });
					}
				});
			});
		},

		update(table: string, data: { [key: string]: any }): Promise<DatabaseResponse> {
			const query = data.id ? { _id: data.id } : {};
			delete data.id;
			data = Object.fromEntries(Object.entries(data).map(([k, v]) => [`data.${k}`, v]));
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

	return database;
};
