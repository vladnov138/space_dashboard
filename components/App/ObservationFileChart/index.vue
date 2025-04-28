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
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'File Count',
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        data: [30, 50, 40, 60, 70, 50]
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
        text: 'Observation File Count'
      }
    }
  })
  </script>