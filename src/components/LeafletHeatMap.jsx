import { useEffect, useMemo, useRef, useState } from 'react'
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
    let layer
    let cancelled = false
    const mount = () => {
      try {
        const pane = map.getPane('overlayPane')
        const container = map._container
        if (!pane || !container) return
        layer = L.heatLayer(heatPoints, {
          radius,
          blur,
          maxZoom,
          minOpacity,
          max: maxIntensity
        })
        if (!cancelled) layer.addTo(map)
      } catch {
        if (!cancelled) requestAnimationFrame(mount)
      }
    }
    // Esperar a que el mapa esté listo y al siguiente frame
    try {
      map.whenReady(() => requestAnimationFrame(mount))
    } catch {
      requestAnimationFrame(mount)
    }
    return () => {
      cancelled = true
      try { layer && layer.remove() } catch {
        // Silently ignore removal errors
      }
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
  mapKey
}) {
  const containerRef = useRef(null)
  const resizeObserverRef = useRef(null)
  const [deferredMount, setDeferredMount] = useState(false)
  const bounds = useMemo(() => {
    if (!points || points.length === 0) return null
    const latlngs = points.map(p => [p.lat, p.lng])
    return L.latLngBounds(latlngs)
  }, [points])

  // Montar el mapa en el siguiente tick para evitar conflictos durante reordenamientos/navegación
  useEffect(() => {
    setDeferredMount(false) // Reset primero
    const t = setTimeout(() => setDeferredMount(true), 100) // Delay más largo para redimensionamiento
    return () => {
      clearTimeout(t)
      // Limpiar ResizeObserver si existe
      if (resizeObserverRef.current) {
        try {
          resizeObserverRef.current.disconnect()
          resizeObserverRef.current = null
        } catch (e) {
          console.warn('Error cleaning up ResizeObserver:', e)
        }
      }
    }
  }, [mapKey])

  if (!deferredMount) {
    return <div style={{ width: '100%', height }} />
  }

  return (
    <div 
      key={mapKey} 
      ref={containerRef} 
      style={{ width: '100%', height, position: 'relative', zIndex: 0 }}
      onMouseDown={(e) => {
        // Bloquear click izquierdo para evitar selección
        if (e.button === 0) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onContextMenu={(e) => {
        // Bloquear menú contextual
        e.preventDefault();
      }}
    >
      <MapContainer
        key={mapKey}
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
            resizeObserverRef.current = new ResizeObserver(() => {
              try { 
                // Invalidar tamaño con delays para asegurar que el DOM se actualice
                setTimeout(() => map.invalidateSize(), 10)
                setTimeout(() => map.invalidateSize(), 100)
                setTimeout(() => map.invalidateSize(), 300)
              } catch (e) { console.warn('Leaflet invalidateSize (observer) error:', e) }
            })
            const node = containerRef.current
            if (node && resizeObserverRef.current) resizeObserverRef.current.observe(node)
          } catch (e) { console.warn('ResizeObserver not available:', e) }
        }}
      >
        <TileLayer attribution={tileAttribution} url={tileUrl} />
        <HeatLayer points={points} {...heatOptions} />
      </MapContainer>
    </div>
  )
}


