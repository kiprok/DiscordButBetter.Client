import './assets/main.css'

import { createApp } from 'vue'
import {createRouter,createWebHistory} from "vue-router";
import App from './App.vue'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

const routes = [
    {
        path: '/',
        component: () => import('@/views/ChatView.vue'),
        name: 'chat'},
    {
        path: '/friends',
        component: () => import('@/views/FriendListView.vue'),
        name: 'friendList'}
];

const router = createRouter({
    history:createWebHistory(),
    routes:routes
});


createApp(App)
    .component("font-awesome-icon", FontAwesomeIcon)
    .use(router)
    .mount('#app')
