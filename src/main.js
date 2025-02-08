import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Avue from '@smallwei/avue';
import { AvueForm } from '@smallwei/avue';
import '@smallwei/avue/lib/index.css';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'; // 引入 element-plus 的样式
import zhCn from 'element-plus/es/locale/lang/zh-cn'; // 引入中文语言包

const app = createApp(App);
app.use(router);
app.use(Avue);
app.use(ElementPlus, {
  locale: zhCn, // 设置语言为中文
});
app.mount('#app');