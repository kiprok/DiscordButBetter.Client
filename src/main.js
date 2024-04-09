import './assets/main.css'

import { createApp } from 'vue'
import {createRouter,createWebHistory} from "vue-router";
import App from './App.vue'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import ChatView from "@/views/ChatView.vue";
import FriendListView from "@/views/FriendListView.vue";

const routes = [
    {path: '/', component:ChatView},
    {path: '/friends', component: FriendListView}
];

const router = createRouter({
    history:createWebHistory(),
    routes:routes
});


createApp(App)
    .component("font-awesome-icon", FontAwesomeIcon)
    .use(router)
    .mount('#app')
