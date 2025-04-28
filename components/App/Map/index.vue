<style scoped>
#map {
  width: 100%;
  height: 500px;
}

.leaflet-popup-content-wrapper {
  background-color: #222;
  color: #eee;
}

.leaflet-popup-tip {
  background-color: #222;
}
</style>

<template>
  <div id="map"></div>
</template>

<script lang="ts">
interface ITrajectory {
  noradId: string;
  trajectory: {
    lat: number;
    lon: number;
    elevation: number;
  }[];
}
interface IProps {
  stations: {
    id: number,
    name: string,
    lat: number,
    lng: number,
    status: string
  }[] | null,
  satellites: {
    name: string,
    position: {
      lat: number,
      lon: number
    },
    elevation_km: number,
  }[],
  trajectory: ITrajectory[]
  coverageStationCoords?: { lat: number; lng: number }
  coverageRadiusKm?: number
}
</script>

<script setup lang="ts">
import { onMounted } from 'vue';

const props = defineProps<IProps>();
let satelliteMarkers: any[] = [];
let map;
let trajectoryLines: any[] = [];
let coverageCircle: any = null;
const emit = defineEmits<{
  (e: 'station-selected', stationId: number): void
}>();

const trajectoryColors = new Map<string, string>();

const getColorForNoradId = (noradId: string) => {
  if (!trajectoryColors.has(noradId)) {
    const color = '#' + Array.from({ length: 6 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');
    trajectoryColors.set(noradId, color);
  }
  return trajectoryColors.get(noradId);
};

onMounted(async () => {
  const L = await import('leaflet');
  const greenIcon = L.icon({
    iconUrl: 'https://img.icons8.com/fluency/48/radio-tower.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -32]
  });
  const yellowIcon = L.icon({
    iconUrl: 'https://img.icons8.com/color/48/000000/satellite.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
  map = L.map('map', { attributionControl: false }).setView([51.505, -0.09], 4);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CartoDB',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);


  props.stations.forEach(station => {
    const marker = L.marker([station.lat, station.lng], { icon: greenIcon }).addTo(map);
    marker.bindPopup(`<b>${station.name}</b>`);
    marker.on('click', () => {
      emit('station-selected', station.id);
    });
  });
  drawSatellites(yellowIcon);
  console.log(props.coverageRadiusKm)
  drawCoverageCircle(props.coverageStationCoords.lat, props.coverageStationCoords.lng, props.coverageRadiusKm);

  // const trajectory = L.polyline(satellitePath, {
  //   color: '#00FFAA',
  //   weight: 3,
  //   opacity: 0.8,
  //   dashArray: '5, 10'
  // }).addTo(map);

  // map.fitBounds(trajectory.getBounds());

  watch(
    () => props.satellites,
    () => {
      drawSatellites(yellowIcon);
    },
    { deep: true }
  );
});

async function drawSatellites(yellowIcon: any) {
  if (!map) return;

  trajectoryLines.forEach(line => line.remove());
  trajectoryLines = [];
  satelliteMarkers.forEach(marker => marker.remove());
  satelliteMarkers = [];

  if (!props.satellites || props.satellites.length === 0) {
    console.log('Нет спутников для отображения');
    return;
  }

  props.satellites.forEach(sat => {
    if (sat.position) {
      const marker = L.marker([sat.position.lat, sat.position.lon], { icon: yellowIcon }).addTo(map);
      marker.bindPopup(`
        <b>${sat.name}</b><br>
        Высота: ${sat.elevation_km?.toFixed(2) || 'N/A'} км
      `);
      satelliteMarkers.push(marker);
    }
  });

  props.trajectory.forEach(sat => {
    if (sat.trajectory && Array.isArray(sat.trajectory) && sat.trajectory.length > 1) {
      const color = getColorForNoradId(sat.norad_id);
      let currentSegment: [number, number][] = [];

      sat.trajectory.forEach((point, index) => {
        if (index === 0) {
          currentSegment.push([point.lat, point.lon]);
          return;
        }

        const prev = sat.trajectory[index - 1];
        const deltaLon = Math.abs(point.lon - prev.lon);
        const needsBreak = deltaLon > 180;

        if (needsBreak) {
          if (currentSegment.length > 1) {
            const polyline = L.polyline(currentSegment, {
              color: color,
              weight: 3,
              opacity: 0.8,
              dashArray: '5, 10'
            }).addTo(map);
            trajectoryLines.push(polyline);
          }
          currentSegment = [];
        }

        currentSegment.push([point.lat, point.lon]);
      });
      if (currentSegment.length > 1) {
        const polyline = L.polyline(currentSegment, {
          color: color,
          weight: 3,
          opacity: 0.8,
          dashArray: '5, 10'
        }).addTo(map);
        trajectoryLines.push(polyline);
      }
    }
  });
}

function drawCoverageCircle(stationLat: number, stationLng: number, radiusKm: number) {
  if (coverageCircle) {
    coverageCircle.remove();
  }
  console.log("here")
  console.log(stationLat, stationLng, radiusKm)
  coverageCircle = L.circle([stationLat, stationLng], {
    radius: radiusKm * 1000,
    color: 'blue',
    fillColor: '#00FF00',
    fillOpacity: 0.5
  }).addTo(map);
}

</script>
