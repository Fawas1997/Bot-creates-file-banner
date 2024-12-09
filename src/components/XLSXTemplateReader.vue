<template>
  <div
    class="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4"
  >
    <div
      class="w-[1280px] h-[560px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
    >
      <div class="absolute top-4 right-4 z-10">
        <!-- Profile Dropdown -->
        <div class="relative">
          <button
            @click="toggleProfileMenu"
            class="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-200 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          >
            <img
              v-if="userProfile?.pictureUrl"
              :src="userProfile.pictureUrl"
              class="w-8 h-8 rounded-full border-2 border-white"
              alt="Profile"
            />
            <span class="text-white font-medium truncate max-w-[150px]">{{
              userProfile?.displayName || "User"
            }}</span>
            <ChevronDownIcon class="w-4 h-4 text-white" />
          </button>

          <!-- Dropdown Menu -->
          <transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="showProfileMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
            >
              <button
                @click="logout"
                class="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors duration-200"
              >
                <LogOutIcon class="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </transition>
        </div>
      </div>
      <!-- Header -->
      <div
        class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4"
      >
        <h2 class="text-2xl font-bold text-center">
          Creates Banner Files And Updates Information Into Directus.
        </h2>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4 relative" ref="chatArea">
        <transition-group name="fade">
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="[
              'flex items-start gap-3',
              message.sender === 'user' ? 'flex-row-reverse' : 'flex-row',
            ]"
          >
            <!-- Profile Picture and Name -->
            <div class="flex flex-col items-center">
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
              >
                <template v-if="message.sender === 'user'">
                  <img
                    v-if="userProfile?.pictureUrl"
                    :src="userProfile.pictureUrl"
                    class="w-12 h-12 rounded-full object-cover"
                    alt="User Profile"
                  />
                </template>
                <img
                  v-else
                  :src="BotProfileGif"
                  alt="Bot Profile"
                  class="w-12 h-12 object-cover"
                />
              </div>
              <p
                class="text-xs font-medium mt-1"
                :class="
                  message.sender === 'user'
                    ? 'text-indigo-600'
                    : 'text-purple-600'
                "
              >
                {{ message.sender === "user" ? "You" : "Bot" }}
              </p>
            </div>

            <!-- Message Content -->
            <div
              :class="[
                'max-w-[70%] rounded-2xl p-4 shadow-md message-text',
                message.sender === 'user'
                  ? 'bg-indigo-100 text-black'
                  : 'bg-purple-100 text-black',
              ]"
              :data-message-index="index"
            >
              <p v-if="message.sender === 'user'">{{ message.text }}</p>
              <div v-else>
                <span v-if="message.isLoading" class="flex items-center">
                  <span class="mr-2">{{ message.text }}</span>
                  <span class="loading-animation"></span>
                </span>
                <span v-else-if="message.isTyping" class="typing-animation">
                  {{ message.displayText }}
                </span>
                <span v-else>{{ message.text }}</span>
              </div>

              <!-- File display for uploaded files -->
              <div
                v-if="message.isUploadedFile"
                class="mt-4 bg-white rounded-lg p-4 shadow-sm"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 flex items-center justify-center bg-emerald-50 rounded-lg"
                  >
                    <FileZipIcon
                      v-if="message.isZipFile"
                      class="w-6 h-6 text-emerald-600"
                    />
                    <FileSpreadsheetIcon
                      v-else
                      class="w-6 h-6 text-emerald-600"
                    />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">
                      {{ message.fileName }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{
                        message.isZipFile ? "ZIP Archive" : "Excel Spreadsheet"
                      }}
                    </p>
                  </div>
                </div>

                <div class="text-xs text-gray-500 mt-2">
                  {{ formatFileSize(message.fileSize) }}
                </div>

                <!-- Download Link -->
                <div class="mt-3">
                  <a
                    v-if="message.fileURL"
                    :href="message.fileURL"
                    :download="message.fileName"
                    class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <DownloadIcon class="w-5 h-5 mr-2" />
                    {{ message.isZipFile ? "ดาวน์โหลด ZIP" : "ดาวน์โหลดไฟล์" }}
                  </a>
                </div>
              </div>

              <!-- Directus Update Button -->
              <div v-if="message.isUpdateButton" class="mt-4">
                <button
                  @click="generateJsonAndUpdateDirectus"
                  :disabled="isUpdatingDirectus || updateSuccess"
                  class="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md transition-colors duration-200"
                  :style="{
                    backgroundColor: updateSuccess
                      ? '#10B981'
                      : isUpdatingDirectus
                      ? '#9CA3AF'
                      : '#6f4eff',
                    opacity: isUpdatingDirectus || updateSuccess ? '0.7' : '1',
                    cursor:
                      isUpdatingDirectus || updateSuccess
                        ? 'not-allowed'
                        : 'pointer',
                  }"
                  :class="[
                    'focus:outline-none focus:ring-2 focus:ring-offset-2',
                    updateSuccess
                      ? 'focus:ring-green-500'
                      : 'focus:ring-[#6f4eff]',
                    {
                      'hover:bg-green-700': updateSuccess,
                      'hover:opacity-90': !isUpdatingDirectus && !updateSuccess,
                    },
                  ]"
                >
                  <img
                    :src="DirectusLogo"
                    alt="Directus Logo"
                    class="w-5 h-5 mr-2"
                  />
                  {{
                    isUpdatingDirectus
                      ? "กำลังอัพเดต..."
                      : updateSuccess
                      ? "อัพเดตข้อมูลเข้า Directus สำเร็จ"
                      : "อัพเดตข้อมูลเข้า Directus"
                  }}
                </button>
              </div>
            </div>
          </div>
        </transition-group>
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center gap-4">
          <button
            @click="toggleFileUpload"
            class="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <UploadIcon class="w-5 h-5" />
            <span class="hidden sm:inline">Upload XLSX</span>
          </button>
          <div class="flex-1 relative">
            <input
              v-model="userInput"
              @keyup.enter="sendMessage"
              type="text"
              placeholder="Type your message..."
              class="w-full p-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            />
            <button
              @click="sendMessage"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <SendIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- File Upload Modal -->
    <transition name="fade">
      <div
        v-if="showFileUpload"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-2xl p-8 w-full max-w-md">
          <h2 class="text-2xl font-bold mb-6 text-indigo-900">
            Upload XLSX File
          </h2>
          <div class="mb-6">
            <label
              for="file-upload"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Choose a file
            </label>
            <div class="relative">
              <input
                id="file-upload"
                type="file"
                accept=".xlsx"
                @change="handleFileUpload"
                class="hidden"
              />
              <label
                for="file-upload"
                class="cursor-pointer bg-indigo-50 text-indigo-700 rounded-lg p-4 flex items-center justify-center border-2 border-dashed border-indigo-300 hover:bg-indigo-100 transition-colors"
              >
                <UploadCloudIcon class="w-6 h-6 mr-2" />
                <span>{{
                  selectedFile ? selectedFile.name : "Click to upload XLSX"
                }}</span>
              </label>
            </div>
          </div>
          <div class="flex justify-end gap-4">
            <button
              @click="toggleFileUpload"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              @click="uploadFile"
              :disabled="!selectedFile"
              :class="[
                'px-4 py-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
                selectedFile
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed',
              ]"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from "vue";
import DirectusLogo from "../assets/logo directus.webp";
import BotProfileGif from "../assets/profile bot.gif";
import { useRouter } from "vue-router";
import {
  Send as SendIcon,
  Upload as UploadIcon,
  UploadCloud as UploadCloudIcon,
  FileSpreadsheet as FileSpreadsheetIcon,
  FileArchive as FileZipIcon,
  UserCircle as UserCircleIcon,
  Bot as BotIcon,
  Download as DownloadIcon,
  LogOut as LogOutIcon,
  ChevronDown as ChevronDownIcon,
} from "lucide-vue-next";
import axios from "axios";

const isUpdatingDirectus = ref(false);
const updateSuccess = ref(false);

// Environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

const messages = ref([
  {
    sender: "bot",
    text: "สวัสดีครับ! ยินดีต้อนรับสู่ Chat Bot ขอไฟล์ Banner อัตโนมัติ สามารถอัพโหลดไฟล์ได้เลยครับ",
    isTyping: true,
    displayText: "",
  },
]);
const userInput = ref("");
const chatArea = ref(null);
const showFileUpload = ref(false);
const selectedFile = ref(null);
const downloadData = ref(null);
let resetTimer = null;
const chatState = ref("initial"); // 'initial', 'zip_question', 'directus_question'

//  profile menu
const showProfileMenu = ref(false);
const router = useRouter();

//  toggle profile menu
const toggleProfileMenu = (e) => {
  e.stopPropagation();
  showProfileMenu.value = !showProfileMenu.value;
};

// logout
const logout = () => {
  localStorage.removeItem("line_auth_code");
  localStorage.removeItem("line_profile");
  showProfileMenu.value = false;
  router.push({ name: "Landing" });
};

//  click outside
const closeProfileMenu = (e) => {
  const profileMenu = document.querySelector(".profile-menu");
  const profileButton = document.querySelector(".profile-button");

  if (
    showProfileMenu.value &&
    profileMenu &&
    !profileMenu.contains(e.target) &&
    !profileButton.contains(e.target)
  ) {
    showProfileMenu.value = false;
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    setTimeout(() => {
      if (chatArea.value) {
        chatArea.value.scrollTop = chatArea.value.scrollHeight;
      }
    }, 200);
  });
};

const typeMessage = async (message, index) => {
  const text = message.text;
  let currentIndex = 0;

  return new Promise((resolve) => {
    const typingInterval = setInterval(() => {
      if (currentIndex <= text.length) {
        messages.value[index].displayText = text.slice(0, currentIndex);
        currentIndex++;
        scrollToBottom();
      } else {
        clearInterval(typingInterval);
        messages.value[index].isTyping = false;
        scrollToBottom();
        resolve();
      }
    }, 50);
  });
};

const resetChat = () => {
  messages.value = [
    {
      sender: "bot",
      text: "สวัสดีครับ! ยินดีต้อนรับสู่ Chat Bot ขอไฟล์ Banner อัตโนมัติ สามารถอัพโหลดไฟล์ได้เลยครับ",
      isTyping: true,
      displayText: "",
    },
  ];
  downloadData.value = null;
  selectedFile.value = null;
  chatState.value = "initial";
  updateSuccess.value = false; // Reset update success state
  typeMessage(messages.value[0], 0);
};

const generateJsonFromExcel = async () => {
  try {
    const formData = new FormData();
    formData.append("file", selectedFile.value);

    const loadingIndex = messages.value.length;
    messages.value.push({
      sender: "bot",
      text: "กำลังสร้างไฟล์ JSON กรุณารอสักครู่",
      isLoading: true,
    });
    scrollToBottom();

    const response = await axiosInstance.post("/generate-json", formData, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "application/json" });
    const fileURL = URL.createObjectURL(blob);

    const completionIndex = messages.value.length;
    messages.value.push({
      sender: "bot",
      text: "สร้างไฟล์ JSON เสร็จสิ้น คุณสามารถดาวน์โหลดได้จากลิงก์ด้านล่าง",
      isTyping: true,
      displayText: "",
    });
    await typeMessage(messages.value[completionIndex], completionIndex);

    setTimeout(() => {
      messages.value.push({
        sender: "bot",
        isUploadedFile: true,
        fileName: "data.json",
        fileSize: blob.size,
        fileURL: fileURL,
        isZipFile: false,
      });
      scrollToBottom();
    }, 1000);
  } catch (error) {
    console.error("Error generating JSON:", error);
    const errorIndex = messages.value.length;
    messages.value.push({
      sender: "bot",
      text: "ขออภัยครับ เกิดข้อผิดพลาดในการสร้างไฟล์ JSON กรุณาลองใหม่อีกครั้ง",
      isTyping: true,
      displayText: "",
    });
    typeMessage(messages.value[errorIndex], errorIndex);
  }
};

const handleUserResponse = (message) => {
  if (resetTimer) {
    clearTimeout(resetTimer);
  }

  if (message.toLowerCase() === "ดาวโหลดไฟล์") {
    if (resetTimer) {
      clearTimeout(resetTimer);
    }

    const downloadMessageIndex = messages.value.length;
    messages.value.push({
      sender: "bot",
      text: "ท่านสามารถดาวน์โหลดไฟล์ ZIP ที่มีไฟล์ Excel ทั้งหมดได้ที่นี่",
      isTyping: true,
      displayText: "",
    });

    nextTick(() => {
      typeMessage(messages.value[downloadMessageIndex], downloadMessageIndex);
      scrollToBottom();
    });

    setTimeout(() => {
      messages.value.push({
        sender: "bot",
        isUploadedFile: true,
        fileName: "Generated_Files_Banner.zip",
        fileSize: downloadData.value.blob.size,
        fileURL: downloadData.value.fileURL,
        isZipFile: true,
      });
      scrollToBottom();

      setTimeout(() => {
        chatState.value = "directus_question";
        const directusQuestionIndex = messages.value.length;
        messages.value.push({
          sender: "bot",
          text: "ต้องการอัพเดตข้อมูลเข้าสู่ Directus หรือไม่ครับ? (กรุณาพิมพ์ 'ใช่' หรือ 'ไม่')",
          isTyping: true,
          displayText: "",
        });
        typeMessage(
          messages.value[directusQuestionIndex],
          directusQuestionIndex
        );
      }, 2000);
    }, 1500);
    return;
  }

  if (message.toLowerCase() === "อัพเดต เข้า directus") {
    if (resetTimer) {
      clearTimeout(resetTimer);
    }

    messages.value.push({
      sender: "bot",
      isUpdateButton: true,
    });
    return;
  }

  if (chatState.value === "zip_question") {
    if (message.toLowerCase() === "ใช่") {
      const downloadMessageIndex = messages.value.length;
      messages.value.push({
        sender: "bot",
        text: "ท่านสามารถดาวน์โหลดไฟล์ ZIP ที่มีไฟล์ Excel ทั้งหมดได้ที่นี่",
        isTyping: true,
        displayText: "",
      });

      nextTick(() => {
        typeMessage(messages.value[downloadMessageIndex], downloadMessageIndex);
        scrollToBottom();
      });

      setTimeout(() => {
        messages.value.push({
          sender: "bot",
          isUploadedFile: true,
          fileName: "Generated_Files_Banner.zip",
          fileSize: downloadData.value.blob.size,
          fileURL: downloadData.value.fileURL,
          isZipFile: true,
        });
        scrollToBottom();

        setTimeout(() => {
          chatState.value = "directus_question";
          const directusQuestionIndex = messages.value.length;
          messages.value.push({
            sender: "bot",
            text: "ต้องการอัพเดตข้อมูลเข้าสู่ Directus หรือไม่ครับ? (กรุณาพิมพ์ 'ใช่' หรือ 'ไม่')",
            isTyping: true,
            displayText: "",
          });
          typeMessage(
            messages.value[directusQuestionIndex],
            directusQuestionIndex
          );
        }, 2000);
      }, 1500);
    } else if (message.toLowerCase() === "ไม่") {
      const noDownloadIndex = messages.value.length;
      messages.value.push({
        sender: "bot",
        text: "สามารถขอดาวโหลดไฟล์ภายหลัง (กรุณาพิมพ์ 'ดาวโหลดไฟล์') ภายใน 20 วินาที",
        isTyping: true,
        displayText: "",
      });
      typeMessage(messages.value[noDownloadIndex], noDownloadIndex);

      // Add Directus question after a short delay
      setTimeout(() => {
        chatState.value = "directus_question";
        const directusQuestionIndex = messages.value.length;
        messages.value.push({
          sender: "bot",
          text: "ต้องการอัพเดตข้อมูลเข้าสู่ Directus หรือไม่ครับ? (กรุณาพิมพ์ 'ใช่' หรือ 'ไม่')",
          isTyping: true,
          displayText: "",
        });
        typeMessage(
          messages.value[directusQuestionIndex],
          directusQuestionIndex
        );
      }, 1500);

      resetTimer = setTimeout(() => {
        const thankYouIndex = messages.value.length;
        messages.value.push({
          sender: "bot",
          text: "ขอบคุณที่ใช้บริการครับ",
          isTyping: true,
          displayText: "",
        });
        typeMessage(messages.value[thankYouIndex], thankYouIndex);

        setTimeout(resetChat, 2000);
      }, 20000);
    }
  } else if (chatState.value === "directus_question") {
    if (message.toLowerCase() === "ใช่") {
      messages.value.push({
        sender: "bot",
        isUpdateButton: true,
      });
    } else if (message.toLowerCase() === "ไม่") {
      const noUpdateIndex = messages.value.length;
      messages.value.push({
        sender: "bot",
        text: "หากต้องการอัพเดตข้อมูลเข้าสู่ Directus ภายหลัง สามารถแจ้งผมได้ครับ (กรุณาพิมพ์ 'อัพเดต เข้า Directus') ภายใน 20 วินาที ",
        isTyping: true,
        displayText: "",
      });
      typeMessage(messages.value[noUpdateIndex], noUpdateIndex);

      resetTimer = setTimeout(() => {
        const thankYouIndex = messages.value.length;
        messages.value.push({
          sender: "bot",
          text: "ขอบคุณที่ใช้บริการครับ",
          isTyping: true,
          displayText: "",
        });
        typeMessage(messages.value[thankYouIndex], thankYouIndex);

        setTimeout(resetChat, 2000);
      }, 20000);
    }
  }
};

const sendMessage = () => {
  if (userInput.value.trim() === "") return;

  const userMessage = userInput.value.trim();
  messages.value.push({ sender: "user", text: userMessage });
  userInput.value = "";

  scrollToBottom();

  if (!selectedFile.value && chatState.value === "initial") {
    const botMessageIndex = messages.value.length;
    messages.value.push({
      sender: "bot",
      text: "กรุณาอัพโหลดไฟล์ก่อนครับ โดยกดปุ่ม Upload XLSX ด้านล่างซ้าย",
      isTyping: true,
      displayText: "",
    });

    scrollToBottom();

    nextTick(() => {
      typeMessage(messages.value[botMessageIndex], botMessageIndex);
      scrollToBottom();
    });
    return;
  }

  if (chatState.value !== "initial") {
    handleUserResponse(userMessage);
  } else {
    const botMessageIndex = messages.value.length;
    messages.value.push({
      sender: "bot",
      text: "ขอบคุณสำหรับข้อความของคุณ ผมกำลังประมวลผลข้อมูลอยู่ครับ กรุณารอสักครู่...",
      isTyping: true,
      displayText: "",
    });

    scrollToBottom();

    nextTick(() => {
      typeMessage(messages.value[botMessageIndex], botMessageIndex);
      scrollToBottom();
    });

    setTimeout(() => {
      const responseIndex = messages.value.length;
      messages.value.push({
        sender: "bot",
        text: "การประมวลผลเสร็จสิ้นแล้ว!",
        isTyping: true,
        displayText: "",
      });

      scrollToBottom();

      nextTick(() => {
        typeMessage(messages.value[responseIndex], responseIndex);
        scrollToBottom();
      });
    }, 3000);
  }
};

const toggleFileUpload = () => {
  showFileUpload.value = !showFileUpload.value;
  selectedFile.value = null;
};

const handleFileUpload = (event) => {
  selectedFile.value = event.target.files[0];
  // Reset Directus update state when new file is selected
  updateSuccess.value = false;
};

const uploadFile = async () => {
  if (selectedFile.value) {
    updateSuccess.value = false;

    const formData = new FormData();
    formData.append("file", selectedFile.value);

    messages.value.push({
      sender: "user",
      text: `อัปโหลดไฟล์: ${selectedFile.value.name}`,
      isUploadedFile: true,
      fileName: selectedFile.value.name,
      fileSize: selectedFile.value.size,
      isZipFile: false,
    });

    const loadingMessageIndex = messages.value.length;
    messages.value.push({
      sender: "bot",
      text: "กำลังประมวลผลไฟล์ กรุณารอสักครู่",
      isLoading: true,
    });
    scrollToBottom();

    showFileUpload.value = false;

    try {
      const response = await axiosInstance.post("/upload", formData, {
        responseType: "blob",
      });

      if (response.data) {
        const blob = response.data;
        const fileURL = URL.createObjectURL(blob);

        downloadData.value = {
          blob: blob,
          fileURL: fileURL,
        };

        const successMessageIndex = messages.value.length;
        messages.value.push({
          sender: "bot",
          text: "ประมวลผลไฟล์เสร็จสิ้น",
          isTyping: true,
          displayText: "",
        });

        nextTick(() => {
          typeMessage(messages.value[successMessageIndex], successMessageIndex);
          scrollToBottom();
        });

        setTimeout(() => {
          chatState.value = "zip_question";
          const questionIndex = messages.value.length;
          messages.value.push({
            sender: "bot",
            text: "ต้องการดาวน์โหลดไฟล์ ZIP ที่มีไฟล์ Excel ทั้งหมดหรือไม่ครับ? (กรุณาพิมพ์ 'ใช่' หรือ 'ไม่')",
            isTyping: true,
            displayText: "",
          });

          nextTick(() => {
            typeMessage(messages.value[questionIndex], questionIndex);
            scrollToBottom();
          });
        }, 1500);
      }
    } catch (error) {
      console.error("Error processing file:", error);

      // Display error messages sequentially
      const errorMessageIndex1 = messages.value.length;
      messages.value.push({
        sender: "bot",
        text: "ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาตรวจสอบ ไฟล์ XLSX อยู่ในรูปแบบถูกต้องหรือไม่",
        isTyping: true,
        displayText: "",
      });

      nextTick(() => {
        typeMessage(messages.value[errorMessageIndex1], errorMessageIndex1);
        scrollToBottom();
      });

      setTimeout(() => {
        const errorMessageIndex2 = messages.value.length;
        messages.value.push({
          sender: "bot",
          text: "สามารถดูได้จาก Document: [คลิกที่นี่](https://drive.google.com/file/d/1C4AHz3GUBkYBAA3i_N5uJeGO0DTIMfy4/view?usp=sharing)",
          isTyping: true,
          displayText: "",
        });

        nextTick(() => {
          typeMessage(messages.value[errorMessageIndex2], errorMessageIndex2);
          scrollToBottom();
        });

        setTimeout(() => {
          const errorMessageIndex3 = messages.value.length;
          messages.value.push({
            sender: "bot",
            text: "กรุณาลองใหม่อีกครั้ง",
            isTyping: true,
            displayText: "",
          });

          nextTick(() => {
            typeMessage(messages.value[errorMessageIndex3], errorMessageIndex3);
            scrollToBottom();
          });
        }, 1500);
      }, 1500);
    }
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// userProfile
const userProfile = ref(null);

// function
const loadUserProfile = () => {
  const profileData = localStorage.getItem("line_profile");
  if (profileData) {
    userProfile.value = JSON.parse(profileData);
  }
};

const generateJsonAndUpdateDirectus = async () => {
  if (isUpdatingDirectus.value || updateSuccess.value) return;

  try {
    isUpdatingDirectus.value = true;

    const formData = new FormData();
    formData.append("file", selectedFile.value);

    // First, generate JSON
    const jsonResponse = await axiosInstance.post("/generate-json", formData);

    // Then, send to update-directus endpoint
    const directusResponse = await axiosInstance.post("/update-directus");

    const { jobId, taskId } = directusResponse.data;

    // Add success message to chat with formatted text
    const successIndex = messages.value.length;
    messages.value.push({
      sender: "bot",
      text: `สร้าง job order และ task เสร็จแล้ว\n\nJob ID: ${jobId}\nTask ID: ${taskId}`,
      isTyping: true,
      displayText: "",
    });

    // Apply the style to the message element
    const messageElement = document.querySelector(
      `[data-message-index="${successIndex}"]`
    );
    if (messageElement) {
      Object.assign(messageElement.style, { whiteSpace: "pre-line" });
    }

    typeMessage(messages.value[successIndex], successIndex);
    scrollToBottom();

    // Set update success state
    updateSuccess.value = true;
  } catch (error) {
    console.error("Error updating Directus:", error);
    const errorIndex = messages.value.length;
    messages.value.push({
      sender: "bot",
      text: "ขออภัยครับ เกิดข้อผิดพลาดในการอัพเดตข้อมูลเข้า Directus",
      isTyping: true,
      displayText: "",
    });
    typeMessage(messages.value[errorIndex], errorIndex);
  } finally {
    isUpdatingDirectus.value = false;
  }
};

onMounted(() => {
  scrollToBottom();
  typeMessage(messages.value[0], 0);
  loadUserProfile();
  console.log("User Profile:", userProfile.value);
  // event listener  click outside
  document.addEventListener("click", closeProfileMenu);
});

//  cleanup onUnmounted
onUnmounted(() => {
  document.removeEventListener("click", closeProfileMenu);
});
</script>

<style>
/* Base styles for fade transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Typing animation */
.typing-animation::after {
  content: "...";
  animation: typing 1.5s infinite;
}

@keyframes typing {
  0% {
    content: "";
  }
  25% {
    content: ".";
  }
  50% {
    content: "..";
  }
  75% {
    content: "...";
  }
  100% {
    content: "";
  }
}

/* New loading animation */
.loading-animation {
  display: inline-block;
  position: relative;
  width: 60px;
  height: 20px;
}

.loading-animation::after {
  content: " ";
  display: block;
  border-radius: 50%;
  width: 0;
  height: 0;
  margin: 6px;
  box-sizing: border-box;
  border: 8px solid #6f4eff;
  border-color: #6f4eff transparent #6f4eff transparent;
  animation: loading-animation 1.2s infinite;
}

@keyframes loading-animation {
  0% {
    transform: rotate(0);
    animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  }
  50% {
    transform: rotate(900deg);
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  100% {
    transform: rotate(1800deg);
  }
}

/* Scrollbar customization */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Hide outer scrollbar */
html,
body {
  overflow: hidden;
  height: 100%;
  margin: 0;
  padding: 0;
}

.min-h-screen {
  height: 100vh;
  overflow: hidden;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Add this to your existing style section */
.message-text {
  white-space: pre-line;
}
</style>
