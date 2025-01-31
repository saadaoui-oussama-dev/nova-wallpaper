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
import { defineProps, defineEmits, computed, onMounted, ref, watch } from 'vue';
import SettingsOption from '@/dashboard/components/SettingOption.vue';

import { Settings, OptionType, ToggleOption, imageSettings, videoSettings } from '@/global/settings';
import { JSONResponse } from '@/global/channel-types';
import { Wallpaper } from '@/store';

const props = defineProps<{
	wallpaper: Wallpaper;
	json: JSONResponse | null;
}>();

const settings = ref<Settings | null>(null);

const taskbarSetting = ref<ToggleOption>({
	label: 'Show behind taskbar',
	type: 'checkbox',
	name: 'taskbar',
	value: false,
});

const setMediaSettings = () => {
	if (props.wallpaper.type === 'image') setSettings(imageSettings);
	else if (props.wallpaper.type === 'video') setSettings(videoSettings);
};
onMounted(setMediaSettings);
watch(() => props.wallpaper, setMediaSettings);

watch(
	() => props.json,
	() => {
		if (!props.json || !props.json.data || props.wallpaper.type !== 'webpage') return setSettings(null);
		if (!Array.isArray(props.json.data['settings']) || !props.json.data['settings'].length) return setSettings(null);
		const properties = props.json.data.settings.map((opt: OptionType) => {
			if (typeof opt.type !== 'string' || typeof opt.name !== 'string' || typeof opt.label !== 'string') return;
			if (opt.type.toLocaleLowerCase().trim() === 'checkbox') {
				opt.type = 'checkbox';
				opt.value = Boolean(opt.value);
			} else if (opt.type.toLocaleLowerCase().trim() === 'slider') {
				opt.type = 'slider';
				if (opt.type !== 'slider') return;
				opt.min = Number(opt.min) || 0;
				opt.max = Number(opt.max) || 100;
				opt.step = Number(opt.step) || 1;
				opt.max = opt.max < opt.min + opt.step ? opt.min + opt.step : opt.max;
				opt.value = Number(opt.value) || 0;
				if (opt.value > opt.max) opt.value = opt.max;
				if (opt.value < opt.min) opt.value = opt.min;
			} else if (opt.type.toLocaleLowerCase().trim() === 'radio') {
				opt.type = 'radio';
				if (opt.type !== 'radio') return;
				let valueExist = false;
				if (!Array.isArray(opt.options) || !opt.options.length) return;
				const options = opt.options.map((option) => {
					if (typeof option.label !== 'string') return;
					if (typeof option.value !== 'string' && typeof option.value !== 'number') return;
					if (option.value === opt.value) valueExist = true;
					return { value: option.value, label: option.label };
				});
				opt.options = options.filter(Boolean) as { value: string; label: string }[];
				if (!valueExist) opt.value = opt.options[0].value;
			} else return;
			return opt;
		});
		setSettings({ direction: props.json.data.direction, settings: properties.filter(Boolean) });
	}
);

const directionText = computed(() => {
	if (!settings.value) return 'row';
	if (`${settings.value.direction}`.toLowerCase() === 'column') return 'column';
	if (`${settings.value.direction}`.toLowerCase() === 'column-right') return 'column-right';
	else if (['row-right', 'right'].includes(`${settings.value.direction}`.toLowerCase())) return 'row-right';
	else return 'row';
});

const getSettings = () => {
	if (!settings.value) return { taskbar: taskbarSetting.value.value, settings: {} };
	return {
		taskbar: taskbarSetting.value.value,
		settings: Object.fromEntries(settings.value.settings.map((opt) => [opt.name, opt.value])),
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
