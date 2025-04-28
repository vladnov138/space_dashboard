<template>
  <UCard class="bg-[#090B0E80] h-full">
    <div v-if="props.loading" class="text-center text-gray-400">
      Загрузка спутниковых данных...
    </div>
    <div v-else-if="satellites?.length">
      <div v-for="(sat, index) in satellites" :key="sat.norad_id"
        class="mb-4 p-2 border-b border-gray-600 last:border-b-0">
        <div><span class="font-bold">NORAD ID:</span> {{ sat.norad_id }}</div>
        <div><span class="font-bold">Имя спутника:</span> {{ sat.satellite_name }}</div>
        <div><span class="font-bold">TLE:</span> {{ sat.tle?.tle1 }} / {{ sat.tle?.tle2 }}</div>
        <div><span class="font-bold">Начало сеанса:</span> {{ formatTime(sat.start) }}</div>
        <div><span class="font-bold">Конец сеанса:</span> {{ formatTime(sat.end) }}</div>
      </div>
    </div>
    <div v-else class="text-gray-400">
      Спутники не выбраны или не загружены.
    </div>
  </UCard>
</template>


<script lang="ts">
interface Satellite {
  satellite_name: string
  norad_id: number
  start: string
  end: string
  tle?: {
    tle0: string
    tle1: string
    tle2: string
  }
}

interface IProps {
  satellites: Satellite[],
  loading?: boolean
}
</script>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<IProps>()

function formatTime(timeStr: string) {
  return new Date(timeStr).toLocaleString()
}
</script>