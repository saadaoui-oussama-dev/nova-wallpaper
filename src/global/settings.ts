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
	value: string | number;
	options: { label: string; value: string | number }[];
};

export type SliderOption = {
	type: 'slider';
	label: string;
	name: string;
	value: number;
	min: number;
	max: number;
	step: number;
};

export type OptionType = ToggleOption | RadioGroupOption | SliderOption;

export type Settings = { direction: 'row' | 'right' | 'row-right' | 'column' | 'column-right'; settings: OptionType[] };

export const imageSettings: Settings = {
	direction: 'row',
	settings: [
		{
			label: 'Flip Horizontally',
			type: 'checkbox',
			name: 'flip',
			value: false,
		},
		{
			label: 'Rotation',
			type: 'radio',
			name: 'rotate',
			value: 0,
			options: [
				{ label: '-90°', value: -90 },
				{ label: '0°', value: 0 },
				{ label: '90°', value: 90 },
				{ label: '180°', value: 180 },
			],
		},
		{
			label: 'Saturation',
			type: 'slider',
			name: 'saturate',
			value: 100,
			min: 0,
			max: 300,
			step: 5,
		},
		{
			label: 'Contrast',
			type: 'slider',
			name: 'contrast',
			value: 100,
			min: 70,
			max: 160,
			step: 5,
		},
		{
			label: 'Brightness',
			type: 'slider',
			name: 'brightness',
			value: 100,
			min: 50,
			max: 200,
			step: 5,
		},
		{
			label: 'Shift (Hue) Colors',
			type: 'slider',
			name: 'hue-rotate',
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
			label: 'Volume',
			type: 'slider',
			name: 'volume',
			value: 0,
			min: 0,
			max: 100,
			step: 1,
		},
		...imageSettings.settings.slice(2),
	],
};
