import { spawn } from 'child_process';
import { events, joinPublic } from '@/global/utils';

export let processType: 'main' | 'child' | 'both' = 'main';

export const processesConnection = () => {
	if (processType === 'both') {
		return;
	} else if (processType === 'main') {
		const exe = 'Nova Wallpaper Dashboard\\Nova Wallpaper Dashboard.exe';
		const buildExe = `app.asar\\build\\${exe}`;
		let exeChild = joinPublic(`@/public/build/${exe}`);
		if (exeChild.endsWith(buildExe)) exeChild = exeChild.substring(0, exeChild.length - buildExe.length) + exe;
		const child = spawn(exeChild, []);
		child.on('exit', () => setTimeout(() => processesConnection(), 5000));
		child.stdout.on('data', (data) => events.$emit('renderer-sync-action', data.toString().trim()));
	} else if (processType === 'child') {
		events.$on('renderer-sync-action', (action: string) => process.stdout.write(action));
	}
};
