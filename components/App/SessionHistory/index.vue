<template>
  <UCard class="bg-[#090B0E80] mt-5">
    <template #header>
      <div class="text-center">
        ИСТОРИЯ СЕАНСОВ
      </div>
    </template>
    <div class="grid grid-cols-4 gap-4 mt-5 h-full">
      <div class="row-span-4">
        <URadioGroup legend="Статус" default-value="System" :items="statuses" />
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
        <UInputMenu />
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
        <UButton color="neutral" variant="outline">Применить</UButton>
      </div>
    </div>
    <template #footer>
      <UTable ref="table" :columns="columns" />
    </template>
  </UCard>
</template>

<script lang="ts">
type Payment = {
  id: string
  sat: string
  observer: string
  time: string
  freq: string
  station: string
}
</script>

<script setup lang="ts">
import type { RadioGroupItem } from '@nuxt/ui'

const statuses = ref<RadioGroupItem[]>(['Идёт связь', 'Сигнала нет', 'Ошибка'])
const columns: TableColumn<User>[] = [
  {
    accessorKey: 'id',
    header: 'Номер'
  },
  {
    accessorKey: 'sat',
    header: 'Спутник'
  },
  {
    accessorKey: 'observer',
    header: 'Наблюдатель'
  },
  {
    accessorKey: 'time',
    header: 'Время'
  },
  {
    accessorKey: 'freq',
    header: 'Частота'
  },
  {
    accessorKey: 'station',
    header: 'Станция'
  }
]
</script>