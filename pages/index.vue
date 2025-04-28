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
    <div class="flex mt-5">
      <div class="basis-3/4 relative">
        <AppMap
          v-if="!mapLoading"
          :stations="stations"
          :satellites="stationSatellites"
          :trajectory="satelliteTrajectories"
          @station-selected="handleStationClick"
        />
        <div v-else class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xl">
          Загрузка карты...
        </div>
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

      <UCard class="bg-[#090B0E80]">
        <div>
          *Водопад*
        </div>
      </UCard>

      <UCard class="bg-[#090B0E80]">
        <div>
          Протокол: AX.25
        </div>
        <div>
          Время приёма: 2025-04-26 12:21:34 UTC
        </div>
      </UCard>
      <UCard class="bg-[#090B0E80] row-span-2">
        <div>
          *Уровень сигнала*
        </div>
      </UCard>

      <UCard class="bg-[#090B0E80]">
        <template #header>
          <div class="text-center">
            Телеметрические данные
          </div>
        </template>
        <div>
          Temp:
        </div>
        <div>
          Bat:
        </div>
        <div>
          GPS:
        </div>
      </UCard>
    </div>

    <AppSessionHistory />
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
const steps = ref(30);
const maxMinutes = 1440;
const maxSteps = 1000;
const satelliteTrajectories = ref<any[]>([]);
const mapLoading = ref(false);

const wsConnections = ref<Record<number, WebSocket>>({});  // ключ - norad_id
const { data: stations, pending, error } = useApiFetch('/stations/stations');

const selectStation = () => {
  if (unref(selectedStation) !== undefined) {
    station.value = unref(stations).filter(st => st.name === unref(selectedStation))[0];
    status.value = unref(station).status;
    getSatelliteByStation(unref(station).id);
  }
}

const getSatelliteByStation = async (stationId: number) => {
  try {
    mapLoading.value = true; // <-- включаем загрузку
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

const handleStationClick = (stationId: number) => {
  const foundStation = unref(stations).find(st => st.id === stationId);
  if (foundStation) {
    station.value = foundStation;
    selectedStation.value = foundStation.name;
    status.value = foundStation.status;
    getSatelliteByStation(foundStation.id);
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