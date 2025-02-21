import { existsSync, readFileSync, writeFileSync } from 'fs';

export const readJson = (filename: string, isArray: boolean = false): { exist: boolean; valid: boolean; data: any } => {
	if (typeof filename !== 'string' || !filename.endsWith('.json')) return { exist: false, valid: false, data: null };
	try {
		if (!existsSync(filename)) return { exist: false, valid: false, data: null };
		const data = JSON.parse(readFileSync(filename, 'utf-8'));
		if (!data || typeof data !== 'object') return { exist: true, valid: false, data: data };
		if (Array.isArray(data) && !isArray) return { exist: true, valid: false, data: data };
		return { exist: true, valid: true, data };
	} catch {
		return { exist: false, valid: false, data: null };
	}
};

export const writeJSON = (filename: string, data: any): { exist: boolean; valid: boolean; data: any } => {
	if (typeof filename !== 'string' || !filename.endsWith('.json')) return { exist: false, valid: false, data: null };
	if (!data || typeof data !== 'object') return { exist: false, valid: false, data: null };
	try {
		writeFileSync(filename, JSON.stringify(data, null, 2) + '\n');
		return { exist: true, valid: true, data: null };
	} catch {
		return { exist: false, valid: true, data: null };
	}
};
