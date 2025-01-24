export type ToggleOption = {
	type: 'checkbox';
	label: string;
	name: string;
	value: boolean;
};

export type RadioGroupOption = {
	type: 'radio';
	label: string;
	name: string;
	value: number;
	options: { label: string; value: string | number }[];
};

export type SliderOption = {
	type: 'slider';
	label: string;
	name: string;
	value: number;
	min: number;
	max: number;
	step?: number;
};

export type OptionType = ToggleOption | RadioGroupOption | SliderOption;
