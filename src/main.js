import './assets/main.css'

import { createApp } from 'vue'
import {createPinia} from "pinia";
import {createRouter,createWebHistory} from "vue-router";
import App from './App.vue'


const routes = [
    {
        path: '/',
        component: () => import('@/views/FriendListView.vue'),
        name: 'friendList'
    },
    {
        path: '/chat/:id',
        component: () => import('@/views/ChatView.vue'),
        name: 'chat'},

];

const router = createRouter({
    history:createWebHistory(),
    routes:routes
});


createApp(App)
    .use(router)
    .use(createPinia())
    .mount('#app')
