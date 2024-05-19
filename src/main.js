import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import FriendListView from '@/views/FriendListView.vue';
import ChatView from '@/views/ChatView.vue';

const routes = [
  {
    path: '/',
    component: FriendListView,
    name: 'friendList',
  },
  {
    path: '/chat/:id',
    component: ChatView,
    name: 'chat',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

createApp(App).use(router).use(createPinia()).mount('#app');
