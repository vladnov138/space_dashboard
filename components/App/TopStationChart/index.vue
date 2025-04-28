<template>
    <Bar :chart-data="chartData" :chart-options="chartOptions" />
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import type { ChartData, ChartOptions } from 'chart.js'
  import { Bar } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
  
  ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement)
  
  const chartData = ref<ChartData<'bar', number[], string>>({
    labels: ['Station 1', 'Station 2', 'Station 3', 'Station 4', 'Station 5'],
    datasets: [
      {
        label: 'Observations',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        data: [20, 15, 25, 10, 30]
      }
    ]
  })
  
  const chartOptions = ref<ChartOptions<'bar'>>({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Top Stations by Observations'
      }
    }
  })
  </script>