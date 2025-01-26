<template>
	<div :class="`setting ${direction} has-${modelValue.type}`">
		<p class="label">{{ modelValue.label }}</p>

		<!-- Checkbox -->
		<div v-if="modelValue.type === 'checkbox'" class="checkbox-container">
			<div
				class="checkbox-button"
				:class="{ active: modelValue.value }"
				@click="change(!modelValue.value)"
				tabindex="0"
				@keyup.enter="change(!modelValue.value)"
			>
				<div class="checkbox-thumb"></div>
			</div>
		</div>

		<!-- Radio -->
		<div v-if="modelValue.type === 'radio' && modelValue.options" class="radio-container">
			<div class="group-radios">
				<label class="radio-container" v-for="opt in modelValue.options" :key="opt.value">
					<input
						type="radio"
						:name="modelValue.name"
						:value="opt.value"
						:checked="opt.value === modelValue.value"
						@input="change(opt.value)"
					/>
					<span class="radio-label">{{ opt.label }}</span>
				</label>
			</div>
		</div>

		<!-- Slider -->
		<div v-if="modelValue.type === 'slider'" class="slider-container">
			<input
				type="range"
				:name="modelValue.name"
				:min="modelValue.min"
				:max="modelValue.max"
				:step="modelValue.step || 1"
				:value="modelValue.value"
				@input="change"
				:style="{ '--filled-percentage': getTrackBackgroundSize() }"
			/>
			<span class="slider-value">{{ modelValue.value }}</span>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';
import { OptionType } from '@/global/settings';

const props = defineProps<{
	direction: 'row' | 'row-right' | 'column' | 'column-right';
	modelValue: OptionType;
}>();

const getTrackBackgroundSize = () => {
	if (props.modelValue.type !== 'slider') return;
	const percentage =
		((props.modelValue.value - props.modelValue.min) / (props.modelValue.max - props.modelValue.min)) * 100;
	return `${percentage}%`;
};

const emit = defineEmits(['update:modelValue']);

const change = (value: any) => {
	value = typeof value?.target?.value !== 'undefined' ? value.target.value : value;
	if (props.modelValue.type === 'slider') value = Number(value);
	emit('update:modelValue', { ...props.modelValue, value });
};
</script>

<style scoped>
.setting {
	display: flex;
	align-items: center;
	gap: 15px;
}

.setting.row-right {
	flex-direction: row-reverse;
}

.setting.column {
	flex-direction: column;
	align-items: flex-start;
	gap: 7px;
}

.setting.column-right {
	flex-direction: column;
	align-items: flex-end;
	gap: 7px;
}

.setting > .label {
	margin: 0;
	font-size: 16px;
}

.setting.row .label,
.setting.row-right .label {
	min-width: 40%;
}

/* Checkbox */
.checkbox-container {
	position: relative;
}

.checkbox-container .checkbox-button {
	width: 50px;
	height: 25px;
	background-color: var(--neutral-color);
	border-radius: 25px;
	position: relative;
	cursor: pointer;
	transition: background-color 0.3s ease;
}

.checkbox-container .checkbox-button.active {
	background-color: var(--primary-color);
}

.checkbox-container .checkbox-thumb {
	width: 20px;
	height: 20px;
	background-color: var(--text-color);
	border-radius: 50%;
	position: absolute;
	top: 50%;
	left: 5px;
	transform: translate(0, -50%);
	transition: transform 0.3s ease;
}

.checkbox-container .checkbox-button.active .checkbox-thumb {
	transform: translate(25px, -50%);
}

/* Radio */
.radio-container {
	display: flex;
	align-items: center;
	gap: 5px;
	position: relative;
	cursor: pointer;
}

.radio-container .group-radios {
	display: flex;
	gap: 15px;
}

.radio-container input[type='radio'] {
	display: none;
}

.radio-container .radio-label {
	display: inline-block;
	padding: 5px 10px;
	border: 1px solid var(--neutral-color);
	border-radius: 4px;
	transition: all 0.3s ease;
	background-color: var(--window-bg);
	color: var(--text-color);
}

.radio-container input[type='radio']:checked + .radio-label {
	background-color: var(--primary-color);
	color: var(--text-color);
	border-color: var(--primary-color-active);
}

.radio-container .radio-label:hover {
	background-color: var(--neutral-color-active);
	border-color: var(--neutral-color-active);
}

/* Slider */
.slider-container {
	display: flex;
	align-items: center;
	gap: 10px;
	width: 40%;
	min-width: 200px;
}

.slider-container input[type='range'] {
	-webkit-appearance: none;
	width: 100%;
	height: 5px;
	background: linear-gradient(
		to right,
		var(--primary-color) 0%,
		var(--primary-color) var(--filled-percentage, 0%),
		var(--neutral-color) var(--filled-percentage, 0%),
		var(--neutral-color) 100%
	);
	border-radius: 5px;
	transition: background-color 0.3s ease;
}

.slider-container input[type='range']::-webkit-slider-thumb {
	-webkit-appearance: none;
	width: 15px;
	height: 15px;
	border-radius: 50%;
	background: var(--primary-color);
	cursor: pointer;
	transition: background-color 0.3s ease;
}

.slider-container input[type='range']::-moz-range-thumb {
	width: 15px;
	height: 15px;
	border-radius: 50%;
	background: var(--primary-color);
	cursor: pointer;
	transition: background-color 0.3s ease;
}

.slider-container .slider-value {
	font-size: 14px;
	color: var(--text-color);
}
</style>
