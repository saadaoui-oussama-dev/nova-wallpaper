<template>
	<div class="section" v-if="queryParameters.length">
		<div class="title-container">
			<p class="title">Query parameters:</p>
			<button v-if="false" class="icon-btn" @click="addQueryParameter"><icon-add small /> Add</button>
		</div>
		<div class="column" ref="list">
			<div v-for="(param, index) in queryParameters" :key="index" class="query-param-row">
				<input v-model="param.key" disabled placeholder="Key" style="width: 40%" />
				<input v-model="param.value" placeholder="Value" style="flex: 1" />
				<button
					v-if="false"
					:class="`icon-btn remove ${isQueryParamsEmpty() ? 'disabled' : ''}`"
					@click="removeQueryParameter(index)"
				>
					<icon-delete />
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { defineProps, useTemplateRef, ref, watch } from 'vue';
import IconAdd from '@/dashboard/icons/IconAdd.vue';
import IconDelete from '@/dashboard/icons/IconDelete.vue';
import { JSONResponse } from '@/global/channel-types';
import { Wallpaper } from '@/store';

const list = useTemplateRef('list');
const queryParameters = ref<{ key: string; value: string }[]>([]);

const props = defineProps<{
	wallpaper: Wallpaper;
	json: JSONResponse | null;
}>();

watch(
	() => props.json,
	() => {
		if (!props.json || !props.json.data || props.wallpaper.type !== 'webpage') return clearQueryParams();
		if (!Array.isArray(props.json.data['query-params']) || !props.json.data['query-params'].length)
			return clearQueryParams();
		queryParameters.value = props.json.data['query-params'].map((param) => ({
			key: `${param.key ? param.key || '' : ''}`,
			value: `${param.value ? param.value || '' : ''}`,
		}));
	}
);

const addQueryParameter = () => {
	if (isQueryParamsEmpty() && list.value) {
		const firstInput = list.value.querySelector('input');
		if (firstInput) return firstInput.focus();
	}
	queryParameters.value.push({ key: '', value: '' });
};

const removeQueryParameter = (index: number) => {
	queryParameters.value.splice(index, 1);
	if (!queryParameters.value.length) clearQueryParams();
};

const clearQueryParams = () => {
	queryParameters.value = [];
	// queryParameters.value = [{ key: '', value: '' }];
};

const isQueryParamsEmpty = () => {
	if (queryParameters.value.length > 1) return false;
	if (!queryParameters.value.length) return true;
	return !queryParameters.value[0].key && !queryParameters.value[0].value;
};
</script>

<style scoped>
.query-param-row {
	display: flex;
	align-items: center;
	gap: 10px;
}

.icon-btn {
	border-radius: 7px;
	background: transparent;
	border: none;
	background-color: var(--neutral-color);
	color: var(--text-color);
	height: 32px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.3s ease;
	-webkit-app-region: no-drag;
}

.icon-btn:not(.remove) {
	padding: 0px 16px 0px 10px;
}

.icon-btn:not(.remove) > svg {
	margin-right: 6px;
}

.icon-btn:not(.disabled):hover {
	background-color: var(--neutral-color-active);
}

.icon-btn.remove.disabled {
	width: 42px;
	pointer-events: none;
}

.icon-btn.remove:not(.disabled) {
	width: 42px;
	background-color: var(--danger-color);
}

.icon-btn.remove:not(.disabled):hover {
	background-color: var(--danger-color-hover);
}
</style>
