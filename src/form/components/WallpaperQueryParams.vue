<template>
	<div class="section" v-if="queryParams.length">
		<div class="title-container">
			<p class="title">Query parameters:</p>
			<button v-if="false" class="icon-btn" @click="addQueryParameter"><icon-add /> Add</button>
		</div>
		<div class="column" ref="list">
			<div v-for="(param, index) in queryParams" :key="index" class="query-param-row">
				<input :value="param.id" disabled placeholder="Key" style="width: 40%" />
				<input v-model="param.value" @change="onChange" placeholder="Value" style="flex: 1" />
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
import { useTemplateRef, ref, watch } from 'vue';
import { getID } from '@/global/settings';
import { Wallpaper } from '@/types/wallpaper';
import { Response, JSONChannel } from '@/types/channels';
import { Query } from '@/types/json';
import IconAdd from '@/form/icons/IconAdd.vue';
import IconDelete from '@/form/icons/IconDelete.vue';

// eslint-disable-next-line
const props = defineProps<{
	wallpaper: Wallpaper;
	json: Response<JSONChannel> | null;
}>();

// eslint-disable-next-line
const emit = defineEmits(['change']);

const queryParams = ref<Query[]>([]);

const list = useTemplateRef('list');

watch(
	() => props.json,
	() => {
		if (!props.json || !props.json.data || !Array.isArray(props.json.data['query-params'])) return clearQueryParams();
		if (!props.wallpaper.path.endsWith('.html')) return clearQueryParams();

		const uniqueIds: string[] = [];
		const currentParams = props.wallpaper.queryParams;
		const list = (props.json.data['query-params'] as Query[]).map((option) => {
			if (!option || typeof getID(option) !== 'string') return null;
			option = { ...option };
			option.id = getID(option) as string;
			if (uniqueIds.includes(option.id)) return null;
			const value =
				typeof currentParams[option.id] === 'string'
					? (currentParams[option.id] as string)
					: typeof option.value === 'string'
					? option.value
					: '';
			uniqueIds.push(option.id);
			return { id: option.id, value: value };
		});
		const $list = list.filter((opt) => opt !== null);
		if (!$list.length) return clearQueryParams();
		queryParams.value = $list;
		onChange();
	}
);

const addQueryParameter = () => {
	if (isQueryParamsEmpty() && list.value) {
		const firstInput = list.value.querySelector('input');
		if (firstInput) return firstInput.focus();
	}
	queryParams.value.push({ id: '', value: '' });
	onChange();
};

const removeQueryParameter = (index: number) => {
	queryParams.value.splice(index, 1);
	if (queryParams.value.length) onChange();
	else clearQueryParams();
};

const clearQueryParams = () => {
	queryParams.value = [];
	// setQueryParams([{ id: '', value: '' }]);
	onChange();
};

const isQueryParamsEmpty = () => {
	if (queryParams.value.length > 1) return false;
	if (!queryParams.value.length) return true;
	return !queryParams.value[0].id && !queryParams.value[0].value;
};

const onChange = () => emit('change', Object.fromEntries(queryParams.value.map((option) => [option.id, option.value])));
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
	background-color: var(--neutral-hover);
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
