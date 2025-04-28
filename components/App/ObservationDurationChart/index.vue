<template>
    <div>
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </template>
  
  <script setup lang="ts">
  import { Bar } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
  } from 'chart.js'
  
  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
  
  const props = defineProps<{
    data: { label: string; value: number }[]
  }>()
  
  const chartData = computed(() => ({
    labels: props.data.map(item => item.label),
    datasets: [
      {
        label: 'Продолжительность наблюдений',
        data: props.data.map(item => item.value),
        backgroundColor: 'rgba(75, 192, 192, 0.5)'
      }
    ]
  }))
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false
  }
  </script>