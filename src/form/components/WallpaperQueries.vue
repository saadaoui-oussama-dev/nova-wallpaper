<template>
	<div class="section" v-if="queries.length">
		<div class="title-container">
			<p class="title">Query parameters:</p>
			<button v-if="false" class="icon-btn" @click="addQuery"><icon-add /> Add</button>
		</div>
		<div class="column" ref="list">
			<div v-for="(param, index) in queries" :key="index" class="query-row">
				<input :value="param.id" disabled placeholder="Key" style="width: 40%" />
				<input v-model="param.value" @change="onChange" placeholder="Value" style="flex: 1" />
				<button
					v-if="false"
					:class="`icon-btn remove ${areQueriesEmpty() ? 'disabled' : ''}`"
					@click="removeQuery(index)"
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

const queries = ref<Query[]>([]);

const list = useTemplateRef('list');

watch(
	() => props.json,
	() => {
		if (!props.json || !props.json.data || !Array.isArray(props.json.data.queries)) return clearQueries();
		if (!props.wallpaper.path.endsWith('.html')) return clearQueries();

		const uniqueIds: string[] = [];
		const currentParams = props.wallpaper.queries;
		const list = (props.json.data.queries as Query[]).map((option) => {
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
		if (!$list.length) return clearQueries();
		queries.value = $list;
		onChange();
	}
);

const addQuery = () => {
	if (areQueriesEmpty() && list.value) {
		const firstInput = list.value.querySelector('input');
		if (firstInput) return firstInput.focus();
	}
	queries.value.push({ id: '', value: '' });
	onChange();
};

const removeQuery = (index: number) => {
	queries.value.splice(index, 1);
	if (queries.value.length) onChange();
	else clearQueries();
};

const clearQueries = () => {
	queries.value = [];
	// setQueries([{ id: '', value: '' }]);
	onChange();
};

const areQueriesEmpty = () => {
	if (queries.value.length > 1) return false;
	if (!queries.value.length) return true;
	return !queries.value[0].id && !queries.value[0].value;
};

const onChange = () => emit('change', Object.fromEntries(queries.value.map((option) => [option.id, option.value])));
</script>

<style scoped>
.query-row {
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
