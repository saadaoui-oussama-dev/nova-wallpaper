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

export type Settings = { direction: 'row'; settings: OptionType[] };

export const imageSettings: Settings = {
	direction: 'row',
	settings: [
		{
			label: 'Flip Image Horizontally',
			type: 'checkbox',
			name: 'flip',
			value: false,
		},
		{
			label: 'Rotate Image',
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
			value: 10,
			min: 0,
			max: 50,
			step: 1,
		},
		{
			label: 'Contrast',
			type: 'slider',
			name: 'contrast',
			value: 100,
			min: 70,
			max: 150,
			step: 5,
		},
		{
			label: 'Brightness',
			type: 'slider',
			name: 'brightness',
			value: 100,
			min: 70,
			max: 150,
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
		...imageSettings.settings.map((opt) => ({ ...opt, label: opt.label.replace('Image', 'Video') })),
		{
			label: 'Volume',
			type: 'slider',
			name: 'volume',
			value: 5,
			min: 0,
			max: 100,
			step: 1,
		},
	],
};
