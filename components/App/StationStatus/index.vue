<template>
  <div class="bg-black font-bold text-center text-white p-4 flex-1 h-full flex items-center justify-center rounded-md">
    <div>
      <div class="text-xl mb-4">
        СТАТУС СТАНЦИИ
      </div>
      <div :class="statusClass" class="rounded-lg p-4">
        <div class="text-2xl">
          {{ statusLabel }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
interface IProps {
  status: 'unknown' | 'Online' | 'Offline'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { defineProps } from 'vue'
import clsx from 'clsx'

const props = defineProps<IProps>()

const statusLabel = computed(() => {
  switch (props.status) {
    case 'Online':
      return 'ПОДКЛЮЧЕНО'
    case 'Offline':
      return 'ОТКЛЮЧЕН'
    default:
      return 'НЕИЗВЕСТНО'
  }
})

const statusClass = computed(() =>
  clsx('border-4', {
    'border-green-500': props.status === 'Online',
    'border-red-500': props.status === 'Offline',
    'border-yellow-500': props.status === 'unknown'
  })
)
</script>
