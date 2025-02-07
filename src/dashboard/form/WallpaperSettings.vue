<template>
	<div class="section">
		<p class="title">Settings:</p>
		<div class="column">
			<settings-option :direction="directionText" v-model="taskbarSetting" />
			<template v-if="settings">
				<settings-option
					v-for="(setting, index) in settings.settings"
					:key="index"
					:direction="directionText"
					v-model="settings.settings[index]"
					@change="emit('change', getSettings())"
				/>
			</template>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, computed, ref, watch } from 'vue';
import SettingsOption from '@/dashboard/form/SettingOption.vue';

import { Settings, OptionType, ToggleOption, imageSettings, videoSettings, getID, getLabel } from '@/global/settings';
import { JSONResponse } from '@/dashboard/channels';
import { Wallpaper } from '@/dashboard/store';

const props = defineProps<{
	wallpaper: Wallpaper;
	json: JSONResponse | null;
}>();

const settings = ref<Settings | null>(null);

const taskbarSetting = ref<ToggleOption>({
	id: 'taskbar',
	type: 'checkbox',
	label: 'Show behind taskbar',
	value: false,
});

watch(
	() => props.json,
	() => {
		if (!props.json || !props.json.data || !Array.isArray(props.json.data.settings)) return setSettings(null);

		if (props.wallpaper.type === 'image') return setSettings(imageSettings);
		else if (props.wallpaper.type === 'video') return setSettings(videoSettings);

		const uniqueIds: string[] = [];
		const list = (props.json.data.settings as OptionType[]).map((option) => {
			if (!option || typeof getID(option) !== 'string' || typeof getLabel(option) !== 'string') return null;
			option.id = getID(option) as string;
			option.label = getLabel(option) as string;
			if (['checkbox', 'toggle'].includes(option.type.toLocaleLowerCase().trim())) {
				option.type = 'checkbox';
				option.value = Boolean(option.value);
			} else if (['slider', 'range'].includes(option.type.toLocaleLowerCase().trim())) {
				option.type = 'slider';
				if (option.type !== 'slider') return null;
				option.min = Number(option.min) || 0;
				option.max = Number(option.max) || 100;
				option.step = Number(option.step) || 1;
				option.max = option.max < option.min + option.step ? option.min + option.step : option.max;
				option.value = Number(option.value) || 0;
				if (option.value > option.max) option.value = option.max;
				if (option.value < option.min) option.value = option.min;
			} else if (['radio', 'radio-group', 'radiogroup'].includes(option.type.toLocaleLowerCase().trim())) {
				option.type = 'radio';
				if (option.type !== 'radio') return null;
				let valueExist = false;
				if (!Array.isArray(option.options) || !option.options.length) return null;
				const options = option.options.map((opt) => {
					if (typeof getLabel(opt) !== 'string') return;
					if (typeof opt.value !== 'string' && typeof opt.value !== 'number') return;
					if (opt.value === option.value) valueExist = true;
					return { label: getLabel(opt), value: opt.value };
				});
				option.options = options.filter(Boolean) as { value: string; label: string }[];
				if (!valueExist) option.value = option.options[0].value;
			} else return null;
			if (uniqueIds.includes(option.id)) return null;
			uniqueIds.push(option.id);
			return option;
		});
		const $list = list.filter((opt) => opt !== null);
		if (!$list.length) return setSettings(null);
		setSettings({ direction: props.json.data.direction, settings: $list });
	}
);

const directionText = computed(() => {
	if (!settings.value) return 'row';
	if (`${settings.value.direction}`.toLowerCase().trim() === 'column') return 'column';
	if (['column-right', 'columnright'].includes(`${settings.value.direction}`.toLowerCase().trim()))
		return 'column-right';
	else if (['right', 'row-right', 'rowright'].includes(`${settings.value.direction}`.toLowerCase().trim()))
		return 'row-right';
	else return 'row';
});

const getSettings = () => {
	if (!settings.value) return { taskbar: taskbarSetting.value.value, settings: {} };
	return {
		taskbar: taskbarSetting.value.value,
		settings: Object.fromEntries(settings.value.settings.map((opt) => [opt.id, opt.value])),
	};
};

const emit = defineEmits(['change']);

const setSettings = (data: Settings | null) => {
	settings.value = data ? { direction: data.direction, settings: [...data.settings] } : null;
	emit('change', getSettings());
};

watch(
	() => taskbarSetting.value.value,
	() => emit('change', getSettings())
);
</script>
