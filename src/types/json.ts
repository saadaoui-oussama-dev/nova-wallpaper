export type TextOption = {
	id: string;
	type: 'text' | 'textbox' | 'text-box' | 'input';
	label: string;
	value: number;
	placeholder?: string;
};

export type SliderOption = {
	id: string;
	type: 'slider' | 'range';
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	tick?: number | number[];
};

export type ToggleOption = {
	id: string;
	type: 'toggle' | 'checkbox';
	label: string;
	value: boolean;
};

export type RadioGroupOption = {
	id: string;
	type: 'radio' | 'radio-group' | 'radioGroup';
	label: string;
	value: string | number;
	options: { label: string; value: string | number }[];
};

export type DropdownOption = {
	id: string;
	type: 'dropdown' | 'select';
	label: string;
	value: number;
	clearable?: boolean;
	options: { label: string; value: string }[];
};

export type ColorOption = {
	id: string;
	type: 'color';
	label: string;
	value: string;
};

export type ColorDropdownOption = {
	id: string;
	type: 'dropdown-color' | 'select-color' | 'color-dropdown' | 'color-select' | 'colorDropdown' | 'colorSelect';
	label: string;
	value: string;
	options: (string | { label: string; value: string })[];
};

export type SettingOption = SliderOption | ToggleOption | RadioGroupOption;

export type Permission = { id: string; type: 'executable' | 'url' | 'folder'; label: string; value: string };

export type Query = { id: string; value: string };

export type SettingsJSON = {
	settings?: SettingOption[];
	permissions?: Permission[];
	['query-params']?: Query[];
};
