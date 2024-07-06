<script setup>
import ChatSideMenu from '@/components/sideMenus/ChatSideMenu.vue';

//
// const connection = new signalR.HubConnectionBuilder()
//   .withUrl("/hub?token=94357bd0-f57b-483d-b425-f1311ea2ed6f")
//   .withHubProtocol(new MessagePackHubProtocol())
//   .configureLogging(signalR.LogLevel.Information)
//   .withAutomaticReconnect()
//   .build();
//
// async function start() {
//   try {
//     await connection.start();
//     console.log("SignalR Connected.");
//   } catch (err) {
//     console.log(err);
//     setTimeout(() => start(), 5000);
//   }
// }
//
// connection.on("ReceiveNotification", (message, message2) => {
//   console.log(`message type: ${typeof message} content: ${message}`);
//   console.log(message2)
//
//
// });
//
// start();
</script>

<template>
  <div class="flex h-dvh w-screen flex-row overflow-hidden bg-amber-500">
    <ChatSideMenu />
    <router-view />
  </div>
</template>
