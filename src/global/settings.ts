export type SliderOption = {
	id: string;
	type: 'slider' | 'range';
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
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

export type OptionType = SliderOption | ToggleOption | RadioGroupOption;

export type Settings = {
	direction: 'row' | 'right' | 'row-right' | 'rowRight' | 'column' | 'column-right' | 'columnRight';
	settings: OptionType[];
};

export const getID = ({ id, key, name }: { id?: string; key?: string; name?: string }) => {
	id = typeof id === 'string' ? id : typeof key === 'string' ? key : typeof name === 'string' ? name : '';
	return id || undefined;
};

export const getLabel = ({ label, text }: { label?: string; text?: string }) =>
	typeof label === 'string' ? label : typeof text === 'string' ? text : undefined;

export const imageSettings: Settings = {
	direction: 'row',
	settings: [
		{
			id: 'flip',
			label: 'Flip Horizontally',
			type: 'checkbox',
			value: false,
		},
		{
			id: 'rotate',
			label: 'Rotation',
			type: 'radio',
			value: 0,
			options: [
				{ label: '-90°', value: -90 },
				{ label: '0°', value: 0 },
				{ label: '90°', value: 90 },
				{ label: '180°', value: 180 },
			],
		},
		{
			id: 'saturate',
			label: 'Saturation',
			type: 'slider',
			value: 100,
			min: 0,
			max: 300,
			step: 5,
		},
		{
			id: 'contrast',
			label: 'Contrast',
			type: 'slider',
			value: 100,
			min: 70,
			max: 160,
			step: 5,
		},
		{
			id: 'brightness',
			label: 'Brightness',
			type: 'slider',
			value: 100,
			min: 50,
			max: 200,
			step: 5,
		},
		{
			id: 'hue-rotate',
			label: 'Shift (Hue) Colors',
			type: 'slider',
			value: 0,
			min: 0,
			max: 360,
			step: 1,
		},
	],
};

export const videoSettings: Settings = {
	direction: 'row',
	settings: [
		...imageSettings.settings.slice(0, 2),
		{
			id: 'volume',
			label: 'Volume',
			type: 'slider',
			value: 0,
			min: 0,
			max: 100,
			step: 1,
		},
		...imageSettings.settings.slice(2),
	],
};
