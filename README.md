# ArreglaYA Analytics FE

## Mapa de calor con Leaflet

Componente creado: `src/components/LeafletHeatMap.jsx`

Uso básico:

```jsx
import LeafletHeatMap from './components/LeafletHeatMap'

const puntos = [
  { lat: -34.6037, lng: -58.3816, intensity: 0.8 }, // CABA
  { lat: -31.4167, lng: -64.1833, intensity: 0.6 }, // Córdoba
  { lat: -32.9442, lng: -60.6505, intensity: 0.5 }, // Rosario
]

export default function Demo() {
  return (
    <LeafletHeatMap points={puntos} height="500px" />
  )
}
```

Props principales:

- `points`: arreglo de `{ lat, lng, intensity? }`.
- `center`: coordenadas `[lat, lng]`, por defecto centro de Argentina.
- `zoom`: por defecto `4`.
- `height`: alto del contenedor, por defecto `400px`.
- `heatOptions`: opciones para el heatlayer (`radius`, `blur`, `maxZoom`, `minOpacity`).

Notas:

- El CSS de Leaflet se importa en `src/main.jsx`.
- Tiles por defecto: OpenStreetMap, configurable vía `tileUrl` y `tileAttribution`.