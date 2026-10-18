import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import type { Feature, FeatureCollection, LineString, Point } from 'geojson'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { RoutePreview } from '../../utils/mapbox'

export interface MapboxRouteMapProps {
  accessToken: string
  route?: RoutePreview | null
  className?: string
}

function MapboxRouteMap({ accessToken, route, className = '' }: MapboxRouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [hasMapError, setHasMapError] = useState(false)

  useEffect(() => {
    if (!accessToken || !containerRef.current) return

    mapboxgl.accessToken = accessToken
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-120.5, 44],
      zoom: 5.4,
      attributionControl: true,
    })
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.on('error', () => setHasMapError(true))
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [accessToken])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !route) return

    const drawRoute = () => {
      const routeFeature: Feature<LineString> = {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: route.coordinates },
      }
      const markerFeatures: Feature<Point>[] = [
        route.originCoordinates,
        route.destinationCoordinates,
      ].map((coordinates) => ({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates },
      }))

      const routeSource = map.getSource('route-line') as mapboxgl.GeoJSONSource | undefined
      if (routeSource) {
        routeSource.setData(routeFeature)
      } else {
        map.addSource('route-line', { type: 'geojson', data: routeFeature })
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route-line',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#624737', 'line-width': 5 },
        })
      }

      const markerSource = map.getSource('route-markers') as mapboxgl.GeoJSONSource | undefined
      const markerData: FeatureCollection<Point> = {
        type: 'FeatureCollection',
        features: markerFeatures,
      }
      if (markerSource) {
        markerSource.setData(markerData)
      } else {
        map.addSource('route-markers', { type: 'geojson', data: markerData })
        map.addLayer({
          id: 'route-markers',
          type: 'circle',
          source: 'route-markers',
          paint: {
            'circle-radius': 7,
            'circle-color': '#546B50',
            'circle-stroke-color': '#FFFAF3',
            'circle-stroke-width': 2,
          },
        })
      }

      const bounds = new mapboxgl.LngLatBounds()
      route.coordinates.forEach((coordinates) => bounds.extend(coordinates))
      map.fitBounds(bounds, { padding: 56, maxZoom: 12, duration: 0 })
    }

    if (map.isStyleLoaded()) drawRoute()
    else map.once('load', drawRoute)
  }, [route])

  if (!accessToken) {
    return (
      <section className={`route-map map-unconfigured ${className}`} aria-labelledby="mapbox-setup-title">
        <span className="map-label">MAPBOX ROUTE MAP</span>
        <h2 id="mapbox-setup-title">Map preview needs a Mapbox token</h2>
        <p>Set VITE_MAPBOX_ACCESS_TOKEN in .env.local to enable address lookup and driving directions.</p>
      </section>
    )
  }

  return (
      <div className={`route-map ${className}`}>
        <div className="map-canvas" ref={containerRef} role="region" aria-label="Interactive Mapbox route map" />
      {hasMapError && <p className="map-error" role="status">Mapbox could not load the map. Check the token and network connection.</p>}
    </div>
  )
}

export default MapboxRouteMap