<script setup>
import { useUserStore } from '@/stores/user.js';
import { useServerStore } from '@/stores/server.js';
import { ref } from 'vue';
import { GetProfilePictureUrl, UploadFileToS3 } from '@/composables/utility.js';

const userStore = useUserStore();
const serverStore = useServerStore();

const profilePicture = ref(serverStore.user.profilePicture);
const statusMessage = ref(serverStore.user.statusMessage);
const biography = ref(serverStore.user.biography);

const _loading = ref(false);

const uploadedImage = ref();

async function SaveChanges() {
  _loading.value = true;
  const newInfo = {};
  if (uploadedImage.value) {
    await UploadProfilePicture();
    newInfo.profilePicture = profilePicture.value;
  }
  if (statusMessage.value !== serverStore.user.statusMessage)
    newInfo.statusMessage = statusMessage.value;
  if (biography.value !== serverStore.user.biography) newInfo.biography = biography.value;

  const response = await serverStore.UpdateUserAsync(newInfo);

  if (response) {
    serverStore.user.profilePicture = profilePicture.value;
    serverStore.user.statusMessage = statusMessage.value;
    serverStore.user.biography = biography.value;
    console.log('Updated user info');
  }

  uploadedImage.value = null;
  _loading.value = false;
}

async function UploadProfilePicture() {
  const filePicker = document.getElementById('pfp-settings-picker');
  const file = filePicker.files[0];
  console.log('File:', file);
  const fileName = file.name;
  const fileType = file.type;
  const fileSize = file.size;

  if (fileType.includes('image') === false) {
    console.log('File is not an image');
    return;
  }

  const response = await serverStore.UploadAvatarAsync(fileName, fileType, fileSize);
  if (response) {
    const presignedUrl = response.uploadUrl;
    const newFileName = response.newFileName;
    console.log('Upload URL:', presignedUrl);
    console.log('reponse:', response);

    const responseUpload = await UploadFileToS3(file, presignedUrl);

    console.log('Upload response:', responseUpload);
    if (responseUpload.ok) {
      profilePicture.value = newFileName;
      console.log('Uploaded profile picture');
    }
  }
}

async function OnPfpChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.includes('image')) {
    console.log('File is not an image');
    return;
  }

  console.log(file);

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    uploadedImage.value = reader.result;
    console.log(uploadedImage.value);
  };
}
</script>

<template>
  <div class="flex gap-1 flex-col overflow-y-auto">
    <span class="text-lg font-bold">User settings</span>
    <div class="flex items-center gap-4">
      <label
        for="pfp-settings-picker"
        class="relative text-lg font-bold overflow-hidden w-20 h-20 rounded-full hover:cursor-pointer group/pfp">
        <img
          :src="uploadedImage ? uploadedImage : GetProfilePictureUrl(profilePicture)"
          alt="Profile Picture"
          class="size-full flex-none" />
        <span
          class="absolute inset-0 bg-black/50 items-center justify-center hidden group-hover/pfp:flex">
          <i class="fa-solid fa-camera text-white text-2xl"></i>
        </span>
      </label>
      <input
        type="file"
        name="pfp"
        id="pfp-settings-picker"
        :disabled="_loading"
        accept="image/*"
        @change="OnPfpChange"
        hidden="hidden" />
      <span>
        {{ serverStore.user.username }}
      </span>
    </div>
    <label for="status" class="text-lg font-bold">Status Message</label>
    <input type="text" v-model="statusMessage" id="status" class="text-black" />
    <label for="bio" class="text-lg font-bold">Biography</label>
    <textarea v-model="biography" id="bio" class="text-black h-20"></textarea>
    <button
      @click="SaveChanges"
      class="w-fit mt-4 p-2 bg-blue-600 hover:bg-blue-800 disabled:bg-gray-600"
      :disabled="_loading">
      Save Changes
    </button>
  </div>
</template>

<style scoped></style>
