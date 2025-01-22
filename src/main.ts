import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './dashboard/App.vue';
import './dashboard/index.css';

createApp(App).use(createPinia()).mount('#app');
