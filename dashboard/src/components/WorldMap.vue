<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
// @ts-expect-error jsvectormap library import
import jsVectorMap from 'jsvectormap'
import 'jsvectormap/dist/maps/world-merc.js'
import 'jsvectormap/dist/jsvectormap.css'

interface CountryStat {
  country: string
  users: number
  percent: number
}

const props = defineProps<{
  stats: CountryStat[]
  isDark?: boolean
}>()

const mapContainer = ref<HTMLElement | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mapInstance: any = null

const markerCoords: Record<string, { lat: number; lng: number }> = {
  'United States': { lat: 37.0902, lng: -95.7129 },
  'Indonesia': { lat: -0.7893, lng: 113.9213 },
  'Germany': { lat: 51.1657, lng: 10.4515 },
  'Japan': { lat: 36.2048, lng: 138.2529 },
  'Brazil': { lat: -14.235, lng: -51.9253 },
  'United Kingdom': { lat: 55.3781, lng: -3.436 },
  'France': { lat: 46.2276, lng: 2.2137 },
  'Australia': { lat: -25.2744, lng: 133.7751 },
  'Canada': { lat: 56.1304, lng: -106.3468 },
  'India': { lat: 20.5937, lng: 78.9629 },
}

const initMap = () => {
  if (!mapContainer.value) return

  if (mapInstance) {
    try {
      mapInstance.destroy()
    } catch {
      // Ignore destroy errors
    }
    mapInstance = null
    mapContainer.value.innerHTML = ''
  }

  const markers = props.stats
    .map((s) => {
      const coords = markerCoords[s.country]
      if (!coords) return null
      return {
        name: `${s.country}: ${s.users} users (${s.percent}%)`,
        coords: [coords.lat, coords.lng],
      }
    })
    .filter((item): item is { name: string; coords: number[] } => item !== null)

  mapInstance = new jsVectorMap({
    selector: mapContainer.value,
    map: 'world_merc',
    zoomButtons: false,
    zoomOnScroll: false,
    regionStyle: {
      initial: {
        fill: props.isDark ? '#22252C' : '#D1D5DB',
        stroke: props.isDark ? '#2E323A' : '#9CA3AF',
        strokeWidth: 0.5,
        fillOpacity: 1,
      },
      hover: {
        fill: '#FF7A30',
        fillOpacity: 0.8,
      },
    },
    markerStyle: {
      initial: {
        fill: '#FF7A30',
        stroke: '#FFFFFF',
        strokeWidth: 2,
        r: 6,
      },
      hover: {
        fill: '#FFA366',
        r: 8,
      },
    },
    markers: markers,
  })
}

onMounted(() => {
  initMap()
})

watch(
  () => [props.stats, props.isDark],
  () => {
    initMap()
  },
  { deep: true },
)

onUnmounted(() => {
  if (mapInstance) {
    try {
      mapInstance.destroy()
    } catch {
      // Ignore destroy errors
    }
  }
})
</script>

<template>
  <div
    class="relative w-full h-72 rounded-2xl overflow-hidden border p-2 transition-colors"
    :class="isDark ? 'bg-[#121316] border-[#252830]' : 'bg-gray-50 border-gray-200'"
  >
    <div ref="mapContainer" class="w-full h-full"></div>
  </div>
</template>

<style>
/* Custom jsvectormap tooltip styling */
.jvm-tooltip {
  background-color: #1F2937 !important;
  color: #FFFFFF !important;
  font-family: inherit !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  padding: 6px 10px !important;
  border: 1px solid #FF7A30 !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3) !important;
}
</style>
