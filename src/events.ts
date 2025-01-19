type Event = (...args: any[]) => any;

const events: { [key: string]: Event[] } = {};

const eventsBus = {
	$reserve: (event: string, callback: Event) => {
		if (typeof event !== 'string' || typeof callback !== 'function') return;
		events[event] = [callback];
	},

	$on: (event: string, callback: Event) => {
		if (typeof event !== 'string' || typeof callback !== 'function') return;
		events[event] ? events[event].push(callback) : (events[event] = [callback]);
	},

	$off: (event: string, callback: Event) => {
		if (typeof event !== 'string' || typeof callback !== 'function') return;
		if (events[event]) events[event] = events[event].filter((cb) => cb !== callback);
		if (!events[event].length) delete events[event];
	},

	$offAll: (event: string) => {
		if (typeof event === 'string') delete events[event];
	},

	$emit: (event: string, ...args: any[]) => {
		return typeof event === 'string' && events[event] ? events[event].map((cb) => cb(...args)) : [];
	},

	$get: (event: string): Event[] => {
		return typeof event === 'string' && events[event] ? [...events[event]] : [];
	},

	$getNames: (): string[] => {
		return Object.keys(events);
	},

	$getAll: (): { [key: string]: Event[] } => {
		return Object.fromEntries(Object.entries(events).map(([key, value]) => [key, [...value]]));
	},
};

if (typeof window !== 'undefined') Object.assign(window, { eventsBus });

export default eventsBus;
