<template>
  <div class="m-5">
    <UIHeader :mainText="header" />
    <div class="flex items-center w-3/4 space-x-15 text-xl mt-5">
      <div class="font-bold">
        ВЫБОР НАЗЕМНОЙ СТАНЦИИ
      </div>
      <UInputMenu v-model="selectedStation" class="w-64" :items="stations?.map(station => station.name) || []" />
      <UButton color="neutral" variant="outline" @click="selectStation" :disabled="selectedStation === ''">
        ВЫБРАТЬ
      </UButton>
      <div class="flex items-center w-1/4 space-x-2 text-md">
        <div class="font-bold">Минуты</div>
        <UInput v-model="minutes" />
        <div class="font-bold">Шаги</div>
        <UInput v-model="steps" />
      </div>
    </div>
    <div class="flex space-x-5">
      <div class="font-bold text-md">Высота</div>
      <UInput v-model="alt" />
    </div>
    <div class="flex mt-5">
      <div class="basis-3/4 relative">
        <AppMap v-if="!pending" :stations="stations" :satellites="stationSatellites" :trajectory="satelliteTrajectories"
          :coverageRadiusKm="stationCoverage"
          :coverageStationCoords="station ? { lat: station.lat, lng: station.lng } : null"
          @station-selected="handleStationClick" />
      </div>
      <div class="basis-1/4 flex flex-col ml-5 gap-4">
        <div class="flex-1">
          <AppStationStatus :status="status" />
        </div>
        <div class="flex-1">
          <AppDataInfo :satellites="stationSatellites" :loading="mapLoading" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mt-5 h-full">
      <UCard class="bg-[#090B0E80]">
        <div>
          Какие-то настройки водопада
        </div>
      </UCard>

      <UCard class="bg-[#090B0E80] h-full">
        <div class="flex">
          <div class="text-lg font-bold text-center flex items-center justify-center px-2"
            style="writing-mode: vertical-rl; transform: rotate(180deg);">
            ВРЕМЯ
          </div>
          <div class="relative w-full h-full flex justify-center items-center overflow-hidden">
            <img src="public/watefall.jpg" />
          </div>
        </div>
        <div class="text-lg font-bold text-center">
          ЧАСТОТА
        </div>
      </UCard>

      <UCard class="bg-[#090B0E80] text-lg font-bold text-center">
        <div>
          Протокол: AX.25
        </div>
        <div>
          Время приёма: 2025-04-26 12:21:34 UTC
        </div>
      </UCard>
      <UCard class="bg-[#090B0E80] row-span-2">
        <template #header>
          <div class="font-bold text-xl text-center">
            График уровня сигнала (RSSI, SNR)
          </div>
        </template>
        <div>
          <img src="public/chart-demo.jpg" />
        </div>
      </UCard>

      <UCard class="bg-[#090B0E80] text-lg font-bold">
        <template #header>
          <div class="text-center">
            Телеметрические данные
          </div>
        </template>
        <div>
          Temp: 22.5 °C
        </div>
        <div>
          Bat: 78%
        </div>
        <div>
          GPS: 52.5200° N, 13.4050° E
        </div>
      </UCard>
    </div>

    <AppSessionHistory v-if="!pending" :stations="stations" />
    <div v-else>Идет загрузка...</div>
  </div>
</template>

<script lang="ts">
</script>

<script setup lang="ts">
const header = ref("СОНИКС МОНИТОР");
const selectedStation = ref('');
const station = ref();
const stationSatellites = ref([]);
const status = ref("unknown");
const minutes = ref(15);
const alt = ref(10);
const steps = ref(30);
const maxMinutes = 1440;
const maxSteps = 1000;
const satelliteTrajectories = ref<any[]>([]);
const mapLoading = ref(false);
const stationCoverage = ref<number | null>(null);

const wsConnections = ref<Record<number, WebSocket>>({});  // ключ - norad_id
const { data: stations, pending, error } = useApiFetch('/stations/stations/');

const selectStation = async () => {
  if (unref(selectedStation) !== undefined) {
    stationCoverage.value = null;
    station.value = unref(stations).filter(st => st.name === unref(selectedStation))[0];
    status.value = unref(station).status;
    getSatelliteByStation(unref(station).id);
    const coverage = await $apiFetch(`/stations/station/${unref(station).id}&${unref(alt)}/`);
    stationCoverage.value = coverage.coverage_radius;
  }
}

const getSatelliteByStation = async (stationId: number) => {
  try {
    mapLoading.value = true;
    Object.values(wsConnections.value).forEach(socket => socket.close());
    wsConnections.value = {};
    stationSatellites.value = [];
    satelliteTrajectories.value = [];

    const satellites = await $apiFetch(`/tracking/station/next_passes/${stationId}/`);
    stationSatellites.value = satellites.map(sat => ({
      ...sat,
      position: null
    }));
    satellites.forEach((sat) => {
      const noradId = sat.norad_id;
      const ws = new WebSocket(`ws://localhost:8000/ws/position/${noradId}`);
      wsConnections.value[noradId] = ws;

      ws.onopen = () => {
        console.log(`WebSocket открыт для спутника NORAD ID: ${noradId}`);
      };

      ws.onmessage = (event) => {
        const positionData = JSON.parse(event.data);
        const index = stationSatellites.value.findIndex(s => s.norad_id === noradId);
        if (index !== -1) {
          stationSatellites.value[index].position = positionData;
        }
      };

      ws.onerror = (error) => {
        console.error(`WebSocket ошибка для NORAD ID ${noradId}:`, error);
      };

      ws.onclose = () => {
        console.log(`WebSocket закрыт для NORAD ID: ${noradId}`);
      };
    });

    await loadSatelliteTrajectories();
  } catch (ex: any) {
    console.error('Ошибка при подключении к WebSocket:', ex);
  } finally {
    mapLoading.value = false;
  }
};

const handleStationClick = async (stationId: number) => {
  const foundStation = unref(stations).find(st => st.id === stationId);
  if (foundStation) {
    station.value = foundStation;
    selectedStation.value = foundStation.name;
    status.value = foundStation.status;
    getSatelliteByStation(foundStation.id);
    const coverage = await $apiFetch(`/stations/station/${unref(station).id}&${unref(alt)}/`);
    stationCoverage.value = coverage.coverage_radius;
  }
};

const loadSatelliteTrajectories = async () => {
  if (!station.value) return;
  try {
    const satellitesWithTrajectories = await Promise.all(
      unref(stationSatellites).map(async (sat) => {
        const trajectory = await $apiFetch(`/tracking/trajectory/${sat.norad_id}/`, {
          query: {
            minutes: Math.min(unref(minutes), maxMinutes),
            steps: Math.min(unref(steps), maxSteps)
          }
        });
        return {
          ...sat,
          trajectory: trajectory
        };
      })
    );
    stationSatellites.value = satellitesWithTrajectories;
    satelliteTrajectories.value = satellitesWithTrajectories.map(sat => ({
      norad_id: sat.norad_id,
      trajectory: sat.trajectory
    }));
    console.log("here")
  } catch (ex: any) {
    console.error('Ошибка при загрузке траекторий:', ex);
  }
};

onBeforeUnmount(() => {
  Object.values(wsConnections.value).forEach(socket => socket.close());
  wsConnections.value = {};
});
</script>