<template>
  <div class="h-full">
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

const chartData = {
  labels: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
  datasets: [
    {
      label: 'Количество пролётов',
      data: [5, 8, 6, 9, 4, 7, 3],
      backgroundColor: 'rgba(75, 192, 192, 0.5)'
    }
  ]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // <-- делает горизонтальную гистограмму
  scales: {
    x: {
      title: {
        display: true,
        text: 'Количество пролётов'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Дни недели'
      }
    }
  }
}
</script>
