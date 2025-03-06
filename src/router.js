import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/Home.vue';
import Detail from './components/Detail.vue';
import Submit from './components/Submit.vue';
import Success from './components/Success.vue';
import Login from './components/Login.vue';
import Register from './components/Register.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/detail/:id', component: Detail },
  { path: '/submit', component: Submit },
  { path: '/success', component: Success },
  { path: '/login', component: Login},
  { path: '/register', component: Register}
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
