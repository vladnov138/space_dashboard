<template>
  <div class="flex items-center justify-between text-6xl font-bold mt-5 bg-[#7C7C7C] rounded-md p-5">
    <div class="pl-20">
      {{ props.mainText }}
    </div>
    <div class="pr-10">
      <img src="public/logo-theme-white.png" class="w-40 h-20 object-contain" />
    </div>
  </div>
</template>

<script lang="ts">
interface IProps {
  mainText: string
}
</script>

<script setup lang="ts">
const props = defineProps<IProps>();
</script>