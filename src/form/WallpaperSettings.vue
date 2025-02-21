<template>
	<div class="section">
		<p class="title">Settings:</p>
		<div class="column">
			<settings-option :direction="directionText" v-model="taskbarSetting" />
			<template v-if="settings && settings.settings">
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
import { computed, ref, watch } from 'vue';
import { getID, getLabel } from '@/global/settings';
import { Wallpaper, SimpleMap } from '@/types/wallpaper';
import { Response, JSONChannel } from '@/types/channels';
import { SettingsJSON, SettingOption, ToggleOption } from '@/types/json';
import SettingsOption from '@/form/SettingOption.vue';

// eslint-disable-next-line
const props = defineProps<{
	wallpaper: Wallpaper;
	json: Response<JSONChannel> | null;
}>();

// eslint-disable-next-line
const emit = defineEmits(['change']);

const settings = ref<SettingsJSON | null>(null);

const taskbarSetting = ref<ToggleOption>({
	id: 'taskbar',
	type: 'checkbox',
	label: 'Fullscreen (Extend Below Taskbar)',
	value: props.wallpaper && typeof props.wallpaper.taskbar === 'boolean' ? props.wallpaper.taskbar : false,
});

watch(
	() => props.json,
	() => {
		if (!props.json || !props.json.data || !Array.isArray(props.json.data.settings)) return setSettings(null);

		const uniqueIds: string[] = [];
		const currentSettings = props.wallpaper.settings;
		const list = (props.json.data.settings as SettingOption[]).map((option) => {
			if (!option || typeof getID(option) !== 'string' || typeof getLabel(option) !== 'string') return null;
			option = { ...option };
			option.id = getID(option) as string;
			if (uniqueIds.includes(option.id)) return null;
			option.label = getLabel(option) as string;
			option.value = option.id in currentSettings ? currentSettings[option.id] : option.value;

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
					return { label: getLabel(opt) as string, value: opt.value };
				});
				option.options = options.filter((opt) => opt !== undefined);
				if (!option.options.length) return null;
				if (!valueExist) option.value = option.options[0].value;
			} else return null;
			uniqueIds.push(option.id);
			return option;
		});

		const $list = list.filter((opt) => opt !== null);
		if (!$list.length) return setSettings(null);
		setSettings({ direction: props.json.data.direction || 'row', settings: $list });
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

const getSettings = (): { taskbar: boolean; settings: SimpleMap } => {
	if (!settings.value) return { taskbar: taskbarSetting.value.value, settings: {} };
	return {
		taskbar: taskbarSetting.value.value,
		settings: Object.fromEntries((settings.value.settings || []).map((option) => [option.id, option.value])),
	};
};

const setSettings = (data: SettingsJSON | null) => {
	settings.value = data ? { direction: data.direction, settings: [...(data.settings || [])] } : null;
	emit('change', getSettings());
};

watch(
	() => taskbarSetting.value.value,
	() => emit('change', getSettings())
);
</script>
