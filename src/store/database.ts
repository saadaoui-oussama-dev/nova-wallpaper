import path from 'path';
import { app } from 'electron';
const NeDB = require('nedb');

import { DatabaseResponse } from '@/global/channel-types';

type DatabaseInterface = {
	insert: (data: { [key: string]: any }) => Promise<DatabaseResponse>;
};

let db: any;
let dbInterface: any;

export const openDatabase = (): DatabaseInterface => {
	if (dbInterface) return dbInterface;
	const dbPath = path.join(app.getPath('userData'), 'data.db');
	db = new NeDB({ filename: dbPath, autoload: true });
	dbInterface = {
		insert(data: { [key: string]: any }): Promise<DatabaseResponse> {
			return new Promise<DatabaseResponse>((resolve) => {
				db.insert(data, function (error: Error | string, newDoc: any) {
					if (error) {
						resolve({ doc: null, error: typeof error === 'string' ? error : error.message });
					} else {
						resolve({ doc: newDoc, error: '' });
					}
				});
			});
		},
	};
	return dbInterface;
};
