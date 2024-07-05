import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
const routes = [
  {
    path: '/',
    component: import('@/views/LandingPageView.vue'),
    name: 'landingPage',
  },
  {
    path: '/login',
    component: import('@/views/LoginView.vue'),
    name: 'login',
  },
  {
    path: '/register',
    component: import('@/views/RegisterView.vue'),
    name: 'register',
  },
  {
    path: '/app',
    component: import('@/views/App/ChatAppView.vue'),
    children: [
      {
        path: '',
        redirect: { name: 'friendList' },
      },
      {
        path: 'chat/:id',
        component: import('@/views/App/SubViews/ChatView.vue'),
        name: 'chat',
      },
      {
        path: 'friendList',
        component: import('@/views/App/SubViews/FriendListView.vue'),
        name: 'friendList',
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

createApp(App).use(router).use(createPinia()).mount('#app');
