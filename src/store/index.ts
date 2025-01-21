import { createStore } from 'vuex';

export interface State {
	settings: {
		font: 'standard' | 'handwritten';
	};
}

export default createStore<State>({
	state: {
		settings: {
			font: 'standard',
		},
	},
	mutations: {
		settings(state, settings: State['settings']) {
			state.settings = { ...state.settings, ...settings };
		},
	},
	actions: {},
	modules: {},
});
