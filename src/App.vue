<script setup lang="ts">
import { NConfigProvider, NMessageProvider } from "naive-ui";
import DebugTextConsole from "@/components/DebugTextConsole.vue";
</script>

<template>
  <n-config-provider>
    <n-message-provider>
      <router-view />
      <DebugTextConsole />
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped></style>
