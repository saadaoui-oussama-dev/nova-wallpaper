<template>
	<div class="section" v-if="permissions.length">
		<p class="title">Permissions:</p>
		<div class="column query-params" ref="list">
			<div v-for="(param, index) in permissions" :key="index" class="permission-row">
				<p style="width: 40%">{{ param.label }}</p>
				<input v-model="param.value" placeholder="Value" style="flex: 1" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { defineProps, ref, watch } from 'vue';
import { JSONResponse } from '@/global/channel-types';
import { Wallpaper } from '@/store';

const permissions = ref<{ type: 'executable' | 'url' | 'folder'; name: string; label: string; value: string }[]>([]);

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
</script>

<style scoped>
.permission-row {
	display: flex;
	align-items: center;
	gap: 10px;
}
</style>
