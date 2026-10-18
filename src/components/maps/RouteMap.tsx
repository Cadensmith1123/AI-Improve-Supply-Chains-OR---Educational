import { lazy, Suspense } from 'react'
import type { MapboxRouteMapProps } from './MapboxRouteMap'

const MapboxRouteMap = lazy(() => import('./MapboxRouteMap'))

function RouteMap(props: MapboxRouteMapProps) {
  return (
    <Suspense fallback={<p className="route-map map-loading" role="status">Loading map...</p>}>
      <MapboxRouteMap {...props} />
    </Suspense>
  )
}

export default RouteMap