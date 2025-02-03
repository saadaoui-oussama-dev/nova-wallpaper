import path from 'path';
import { app } from 'electron';
const NeDB = require('nedb');

import { DatabaseResponse } from '@/global/channel-types';

type DatabaseInterface = {
	insert: (table: string, data: { [key: string]: any }) => Promise<DatabaseResponse>;
	read: (table: string, query?: { [key: string]: any }) => Promise<DatabaseResponse>;
};

let db: any;
let dbInterface: DatabaseInterface;

export const openDatabase = (): DatabaseInterface => {
	if (dbInterface) return dbInterface;
	const dbPath = path.join(app.getPath('userData'), 'data.db');
	db = new NeDB({ filename: dbPath, autoload: true });
	dbInterface = {
		insert(table: string, data: { [key: string]: any }): Promise<DatabaseResponse> {
			return new Promise<DatabaseResponse>((resolve) => {
				db.insert({ table, data, createdAt: Date.now() }, function (error: Error | string, newDoc: any) {
					if (error) {
						resolve({ doc: null, error: typeof error === 'string' ? error : error.message });
					} else {
						resolve({ doc: { ...data, createdAt: newDoc.createdAt, id: newDoc._id }, error: '' });
					}
				});
			});
		},

		read(table: string, query: { [key: string]: any } = {}): Promise<DatabaseResponse> {
			return new Promise<DatabaseResponse>((resolve) => {
				db.find({ ...query, table })
					.sort({ createdAt: -1 })
					.exec((error: Error | string, rows: { data: { [key: string]: any }; _id: string }[]) => {
						if (error) {
							resolve({ doc: null, error: typeof error === 'string' ? error : error.message });
						} else {
							resolve({ doc: rows.map(({ data, _id }) => ({ ...data, id: _id })), error: '' });
						}
					});
			});
		},
	};

	return dbInterface;
};
