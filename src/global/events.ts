type Event = (...args: any[]) => any;

const eventsTracker: { [key: string]: Event[] } = {};

export const events = {
	$reserve: (event: string, callback: Event) => {
		if (typeof event !== 'string' || typeof callback !== 'function') return;
		eventsTracker[event] = [callback];
	},

	$on: (event: string, callback: Event) => {
		if (typeof event !== 'string' || typeof callback !== 'function') return;
		eventsTracker[event] ? eventsTracker[event].push(callback) : (eventsTracker[event] = [callback]);
	},

	$off: (event: string, callback: Event) => {
		if (typeof event !== 'string' || typeof callback !== 'function') return;
		if (eventsTracker[event]) eventsTracker[event] = eventsTracker[event].filter((cb) => cb !== callback);
		if (!eventsTracker[event].length) delete eventsTracker[event];
	},

	$offAll: (event: string) => {
		if (typeof event === 'string') delete eventsTracker[event];
	},

	$emit: (event: string, ...args: any[]) => {
		return typeof event === 'string' && eventsTracker[event] ? eventsTracker[event].map((cb) => cb(...args)) : [];
	},

	$get: (event: string): Event[] => {
		return typeof event === 'string' && eventsTracker[event] ? [...eventsTracker[event]] : [];
	},

	$getNames: (): string[] => {
		return Object.keys(eventsTracker);
	},

	$getAll: (): { [key: string]: Event[] } => {
		return Object.fromEntries(Object.entries(eventsTracker).map(([key, value]) => [key, [...value]]));
	},
};

if (typeof window !== 'undefined') Object.assign(window, { events });
