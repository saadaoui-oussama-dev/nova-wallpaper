<template>
	<div class="section" v-if="permissions.length">
		<p class="title">Permissions: <span class="suffix">(Grant access { only } to open/execute files)</span></p>
		<div class="column" ref="list">
			<div v-for="(option, index) in permissions" :key="index" class="permission-row">
				<p style="width: 40%">{{ option.label }}</p>
				<input
					v-model="option.value"
					@change="onChange(false, false)"
					:placeholder="getPlaceholder(option)"
					style="flex: 1"
					:class="option.type"
				/>
				<button v-if="option.type !== 'url'" class="browse" @click="bindFilePath(option)">
					<span style="opacity: 0.75">Browse...</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { NovaWallpaper } from '@/electron-vue/preload';
import { getID, getLabel } from '@/global/settings';
import { Wallpaper } from '@/types/wallpaper';
import { Response, JSONChannel } from '@/types/channels';
import { Permission } from '@/types/json';

// eslint-disable-next-line
const props = defineProps<{
	wallpaper: Wallpaper;
	json: Response<JSONChannel> | null;
}>();

// eslint-disable-next-line
const emit = defineEmits(['change']);

const permissions = ref<Permission[]>([]);

watch(
	() => props.json,
	() => {
		if (!props.json || !props.json.data || !Array.isArray(props.json.data.permissions)) return setPermissions([]);
		if (!props.wallpaper.path.endsWith('.html')) return setPermissions([]);

		const uniqueIds: string[] = [];
		const currentPermissions = props.wallpaper.permissions;
		const list = (props.json.data.permissions as Permission[]).map((option) => {
			if (!option || typeof getID(option) !== 'string' || typeof getLabel(option) !== 'string') return null;
			option = { ...option };
			option.id = getID(option) as string;
			if (uniqueIds.includes(option.id)) return null;
			option.label = getLabel(option) as string;
			if (option.type !== 'executable' && option.type !== 'url' && option.type !== 'folder') return null;
			uniqueIds.push(option.id);
			const value = typeof currentPermissions[option.id] === 'string' ? currentPermissions[option.id] : '';
			return { id: option.id, type: option.type, label: option.label, value: value as string };
		});
		setPermissions(list.filter((opt) => opt !== null));
	}
);

const getPlaceholder = (option: Permission) => {
	return option.type === 'executable'
		? 'Enter a file path (.exe)'
		: option.type === 'url'
		? 'Enter a website URL'
		: 'Enter a folder path';
};

const bindFilePath = async (option: Permission) => {
	if (option.type === 'url') return;
	const { path, error } = await NovaWallpaper.files.invoke(option.type, undefined, true);
	if (error || !path) {
		return console.log({ error });
	} else {
		option.value = path;
	}
};

const setPermissions = (data: Permission[]) => {
	permissions.value = [...data];
	onChange(false, true);
};

const onChange = (trim: boolean, set: boolean) => {
	const trimAll = (option: Permission) => {
		let value = option.value;
		if (trim) {
			value = value.trim();
			if (value.startsWith('"')) value = value.slice(1).trim();
			if (value.endsWith('"')) value = value.slice(0, -1).trim();
			if (set) option.value = value;
		}
		return value;
	};
	const data = Object.fromEntries(permissions.value.map((option) => [option.id, trimAll(option)]));
	if (!trim) emit('change', data);
	return data;
};

// eslint-disable-next-line
defineExpose({ onChange });
</script>

<style scoped>
.permission-row {
	display: flex;
	align-items: center;
	gap: 10px;
	position: relative;
}

input.folder,
input.executable {
	padding-right: 72px !important;
}

.browse {
	position: absolute;
}

.browse {
	background-color: var(--neutral-color);
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-weight: 100;
	height: calc(100% - 8px);
	margin: 4px 4px 4px 0;
	padding: 4px 10px;
	transition: background-color 0.15s ease-in-out;
	border: 1px solid var(--border-color);
	font-size: 11px;
	right: 0;
}

.browse:hover {
	background-color: var(--neutral-hover);
}
</style>
