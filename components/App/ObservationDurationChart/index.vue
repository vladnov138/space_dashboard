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
    labels: ['0-5 min', '5-10 min', '10-15 min', '15-20 min', '20+ min'],
    datasets: [
      {
        label: 'Observation Count',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        data: [12, 19, 3, 5, 2]
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
        text: 'Observation Duration (minutes)'
      }
    }
  })
  </script>