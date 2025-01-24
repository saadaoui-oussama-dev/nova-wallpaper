type CheckboxToggle = {
	type: 'checkbox';
	label: string;
	name: string;
	value: boolean;
};

type RadioGroup = {
	type: 'radio';
	label: string;
	name: string;
	value: number;
	options: { label: string; value: string | number }[];
};

export type OptionType = CheckboxToggle | RadioGroup;

export type ExtendedOptionType = ({ options?: undefined } & CheckboxToggle) | RadioGroup;
