import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/styles.css'; // 全局样式

const app = createApp(App);
app.use(router);
app.config.globalProperties.productionTip = false; // Vue 3 的写法
app.mount('#app');
