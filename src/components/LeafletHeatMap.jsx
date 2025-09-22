import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

// Centro aproximado de Argentina (Córdoba) y zoom inicial ideal para todo el país
const ARG_CENTER = [-31.4167, -64.1833]
const DEFAULT_ZOOM = 4

function HeatLayer({ points, radius = 25, blur = 15, maxZoom = 17, minOpacity = 0.05 }) {
  const map = useMap()

  const { heatPoints, maxIntensity } = useMemo(() => {
    // Espera puntos en formato: [{ lat, lng, intensity? }]
    // Leaflet.heat espera: [[lat, lng, intensity?], ...]
    const arr = (points ?? []).map((p) => [p.lat, p.lng, p.intensity ?? 0.5])
    const intensities = arr.map(([, , w]) => (typeof w === 'number' ? w : 0.5))
    const max = intensities.length ? Math.max(...intensities) : 1
    return { heatPoints: arr, maxIntensity: max > 0 ? max : 1 }
  }, [points])

  useEffect(() => {
    if (!map) return
    // Crear capa de calor asegurando normalización con 'max'
    const layer = L.heatLayer(heatPoints, {
      radius,
      blur,
      maxZoom,
      minOpacity,
      max: maxIntensity
    })
    layer.addTo(map)
    return () => {
      layer.remove()
    }
  }, [map, heatPoints, maxIntensity, radius, blur, maxZoom, minOpacity])

  return null
}

export default function LeafletHeatMap({
  points = [],
  center = ARG_CENTER,
  zoom = DEFAULT_ZOOM,
  height = '400px',
  tileAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  heatOptions = {},
}) {
  const containerRef = useRef(null)
  const bounds = useMemo(() => {
    if (!points || points.length === 0) return null
    const latlngs = points.map(p => [p.lat, p.lng])
    return L.latLngBounds(latlngs)
  }, [points])

  return (
    <div style={{ width: '100%', height, position: 'relative', zIndex: 0 }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        whenCreated={(map) => {
          if (bounds) {
            try {
              map.fitBounds(bounds, { padding: [20, 20] })
            } catch (e) {
              console.warn('Leaflet fitBounds error:', e)
            }
          }
          // Invalidate size al montar y tras pequeños retrasos (para modales)
          try {
            map.invalidateSize()
            setTimeout(() => map.invalidateSize(), 100)
            setTimeout(() => map.invalidateSize(), 300)
          } catch (e) {
            console.warn('Leaflet invalidateSize error:', e)
          }

          // Observar cambios de tamaño del contenedor (ResizeObserver)
          try {
            const ro = new ResizeObserver(() => {
              try { 
                map.invalidateSize() 
              } catch (e) {
                console.warn('Leaflet invalidateSize (observer) error:', e)
              }
            })
            const node = containerRef.current
            if (node) ro.observe(node)
          } catch (e) {
            console.warn('ResizeObserver not available:', e)
          }
        }}
      >
        <TileLayer attribution={tileAttribution} url={tileUrl} />
        <HeatLayer points={points} {...heatOptions} />
      </MapContainer>
    </div>
  )
}


