<template>
	<div :class="`setting ${direction}`">
		<p>{{ option.label }}</p>

		<div v-if="option.type === 'checkbox'" class="checkbox-button-container">
			<div
				class="checkbox-button"
				:class="{ active: option.value }"
				@click="option.value = !option.value"
				tabindex="0"
				@keyup.enter="option.value = !option.value"
			>
				<div class="checkbox-thumb"></div>
			</div>
		</div>

		<div v-if="option.type === 'radio' && option.options" class="radio-container">
			<div class="group-radios">
				<label class="radio-container" v-for="opt in option.options" :key="option.value">
					<input type="radio" :name="option.name" :value="opt.value" v-model="option.value" />
					<span class="radio-label">{{ opt.label }}</span>
				</label>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';
import { ExtendedOptionType } from '@/global/settings-types';

const props = defineProps<{
	direction: 'row' | 'row-right' | 'column' | 'column-right';
	option: ExtendedOptionType;
}>();
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

.setting > p {
	margin: 0;
	font-size: 16px;
}

.checkbox-button-container {
	position: relative;
}

.checkbox-button-container .checkbox-button {
	width: 50px;
	height: 25px;
	background-color: var(--neutral-color);
	border-radius: 25px;
	position: relative;
	cursor: pointer;
	transition: background-color 0.3s ease;
}

.checkbox-button-container .checkbox-button.active {
	background-color: var(--primary-color);
}

.checkbox-button-container .checkbox-thumb {
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

.checkbox-button-container .checkbox-button.active .checkbox-thumb {
	transform: translate(25px, -50%);
}

.group-radios {
	display: flex;
	gap: 15px;
}

.radio-container {
	display: flex;
	align-items: center;
	gap: 5px;
	position: relative;
	cursor: pointer;
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
</style>
