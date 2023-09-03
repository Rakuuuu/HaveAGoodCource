import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import store from '@/store/index.js';
import 'element-plus/dist/index.css';


createApp(App)
	.use(router)
	.use(store)
	.mount('#app');
