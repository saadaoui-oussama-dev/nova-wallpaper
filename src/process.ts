import { spawn } from 'child_process';
import { events, joinPublic } from '@/global/utils';

type processType = 'main' | 'child' | 'both';

export const processType: processType = 'main' as string as processType;

// Establishes communication between the Renderer process and the Library-Tray process
export const processesConnection = () => {
	if (processType === 'both') {
		// No additional event handling is required since all modules are already loaded and listening
		return;
	}

	if (processType === 'main') {
		// Define the path to the Library-Tray executable
		const exe = 'Nova Wallpaper Library\\Nova Wallpaper Library.exe';
		const packageFolder = `app.asar\\build\\${exe}`;
		let path = joinPublic(`@/public/build/${exe}`);
		if (path.endsWith(packageFolder)) path = path.substring(0, path.length - packageFolder.length) + exe;

		// Launch the Library-Tray as a child process and restart it if it exits
		const child = spawn(path, []);
		child.on('exit', () => setTimeout(() => processesConnection(), 5000));

		// Forward messages from the Library-Tray process to the Renderer process
		child.stdout.on('data', (data) => events.$emit('renderer-sync-action', data.toString().trim()));
	}

	if (processType === 'child') {
		// Listen for events from the current process and forward them to the main process (Renderer) via stdout
		// These messages will be received in the 'child.stdout.on('data', ...)' listener in the Renderer process
		events.$on('renderer-sync-action', (action: string) => process.stdout.write(action));
	}
};
