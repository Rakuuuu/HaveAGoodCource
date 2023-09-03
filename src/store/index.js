import { createPinia } from 'pinia';
import piniaPluginPersist from 'pinia-plugin-persist';//pinia持久化储存

const store = createPinia();
store.use(piniaPluginPersist);//pinia安装持久化插件

export default store;