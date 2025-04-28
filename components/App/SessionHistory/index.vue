<template>
  <UCard class="bg-[#090B0E80] mt-5">
    <template #header>
      <div class="text-center font-bold text-xl">
        ИСТОРИЯ СЕАНСОВ
      </div>
    </template>
    <div class="grid grid-cols-4 gap-4 mt-5 h-full">
      <div class="row-span-4 text-xl">
        <URadioGroup legend="Статус" :items="statuses" />
      </div>
      <div>
        <div>Спутник</div>
        <UInputMenu />
      </div>
      <div>
        <div>Наблюдатель</div>
        <UInputMenu />
      </div>
      <div>
        <div>Станция</div>
        <UInputMenu v-model="selectedStation" :items="props.stations.map(s => s.name)" />
      </div>
      <div>
        <div>Начало периода</div>
        <UInputMenu />
      </div>
      <div>
        <div>Конец периода</div>
        <UInputMenu />
      </div>
      <div>
        <div>Идентификатор передатчика</div>
        <UInputMenu />
      </div>
      <div>
        <div>Модуляция</div>
        <UInputMenu />
      </div>
      <div class="col-span-2 flex justify-center">
        <UButton color="neutral" variant="outline" @click="fetchSessions" :disabled="!selectedStation">Применить</UButton>
      </div>
    </div>
    <template #footer>
      <UTable ref="table" :columns="columns" :data="sessionData"/>
    </template>
  </UCard>
</template>

<script lang="ts">
type Session = {
  id: string
  sat: string
  observer: string
  time: string
  freq: string
  station: string
}
interface Station {
  id: number
  name: string
}
interface IProps {
  stations: Station[]
}
</script>

<script setup lang="ts">
import type { RadioGroupItem } from '@nuxt/ui'

const props = defineProps<IProps>();

const selectedStatus = ref<string | null>(null)
const selectedStation = ref<string | null>(null)
const sessionData = ref<Session[]>([])
const statuses = ref<RadioGroupItem[]>(['Идёт связь', 'Сигнала нет', 'Ошибка'])
const columns: TableColumn<User>[] = [
  {
    accessorKey: 'id',
    header: 'Номер'
  },
  {
    accessorKey: 'satellite_name',
    header: 'Спутник'
  },
  {
    accessorKey: 'start',
    header: 'Время начало'
  },
  {
    accessorKey: 'end',
    header: 'Время конец'
  },
  {
    accessorKey: 'observation_frequency',
    header: 'Частота'
  },
  {
    accessorKey: 'station_name',
    header: 'Станция'
  }
];

const fetchSessions = async () => {
  try {
    const stationObj = props.stations.find(st => st.name === selectedStation.value)
    if (!stationObj) return
    console.log(stationObj.id)
    const result = await $apiFetch(`/stations/station/history/${stationObj.id}`, {
      query: {
        station_id: stationObj.id,
        status: selectedStatus.value
      }
    })
    sessionData.value = result || []
  } catch (error) {
    console.error('Ошибка при загрузке истории сеансов:', error)
  }
}
</script>