import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/Home.vue';
import Detail from './components/Detail.vue';
import Submit from './components/Submit.vue';
import Success from './components/Success.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/detail', component: Detail },
  { path: '/submit', component: Submit },
  { path: '/success', component: Success }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
