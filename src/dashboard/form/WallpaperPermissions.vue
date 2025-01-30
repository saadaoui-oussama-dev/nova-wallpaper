<template>
	<div class="section" v-if="permissions.length">
		<p class="title">Permissions: <span class="suffix">(Grant access to (only) open/execute files)</span></p>
		<div class="column" ref="list">
			<div v-for="(option, index) in permissions" :key="index" class="permission-row">
				<p style="width: 40%">{{ option.label }}</p>
				<input v-model="option.value" :placeholder="getPlaceholder(option)" style="flex: 1" :class="option.type" />
				<button v-if="option.type !== 'url'" class="browse" @click="bindFilePath(option)">
					<span style="opacity: 0.75">Browse...</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { defineProps, ref, watch } from 'vue';
import { JSONResponse } from '@/global/channel-types';
import { Wallpaper } from '@/store';
import { NovaWallpaper } from '../preload';

type PermissionOption = { type: 'executable' | 'url' | 'folder'; name: string; label: string; value: string };

const permissions = ref<PermissionOption[]>([]);

const props = defineProps<{
	wallpaper: Wallpaper;
	json: JSONResponse | null;
}>();

watch(
	() => props.json,
	() => {
		if (!props.json || !props.json.data || props.wallpaper.type !== 'webpage') return (permissions.value = []);
		if (!Array.isArray(props.json.data['permissions']) || !props.json.data['permissions'].length)
			return (permissions.value = []);
		const names: string[] = [];
		const list = props.json.data['permissions'].map((option) => {
			if (!option || typeof option.name !== 'string' || !option.name) return null;
			if (option.type !== 'executable' && option.type !== 'url' && option.type !== 'folder') return null;
			if (names.includes(option.name)) return null;
			names.push(option.name);
			return { type: option.type, name: option.name, label: `${option.label ? option.label : option.name}`, value: '' };
		});
		permissions.value = list.filter((opt) => opt !== null);
	}
);

const getPlaceholder = (option: PermissionOption) => {
	return option.type === 'executable'
		? 'Enter a file path (.exe)'
		: option.type === 'url'
		? 'Enter a website URL'
		: 'Enter a folder path';
};

const bindFilePath = async (option: PermissionOption) => {
	if (option.type === 'url') return;
	const { path, error } = await NovaWallpaper.files.invoke(option.type, undefined, true);
	if (error || !path) {
		return console.log({ error });
	} else {
		option.value = path;
	}
};
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
	color: var(--text-color);
	background-color: var(--neutral-color);
	border: none;
	border-radius: 3px;
	cursor: pointer;
	font-weight: 100;
	height: calc(100% - 8px);
	margin: 4px 4px 4px 0;
	padding: 4px 10px;
	transition: background-color 0.15s ease-in-out;
	border: 1px solid var(--window-border);
	font-size: 11px;
	right: 0;
}

.browse:hover {
	background-color: var(--neutral-color-active);
}
</style>
