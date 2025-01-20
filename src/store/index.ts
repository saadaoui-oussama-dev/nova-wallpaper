import { createStore } from 'vuex';

export interface State {
	settings: {
		font: string;
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
	actions: {
		setSettings({ commit }, settings: State['settings']) {
			commit('settings', settings);
			if (settings.font) {
				document.body.classList.remove('font-standard');
				document.body.classList.remove('font-handwritten');
				document.body.classList.add(`font-${settings.font}`);
			}
		},
	},
	modules: {},
});
