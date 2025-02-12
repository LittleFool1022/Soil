import { createRouter, createWebHistory } from 'vue-router';
import Home from './Home.vue';
import Detail from './Detail.vue';
import Submit from './Submit.vue';
import Success from './Success.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/detail/:id', component: Detail },
  { path: '/submit', component: Submit },
  { path: '/success', component: Success }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
