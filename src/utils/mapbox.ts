export interface RoutePreview {
  coordinates: [number, number][]
  originCoordinates: [number, number]
  destinationCoordinates: [number, number]
  distanceMiles: number
  driveMinutes: number
}

interface GeocodeResponse {
  features?: Array<{
    geometry?: {
      coordinates?: [number, number]
    }
  }>
}

interface DirectionsResponse {
  routes?: Array<{
    distance: number
    duration: number
    geometry: {
      coordinates: [number, number][]
    }
  }>
}

async function geocodeAddress(address: string, token: string): Promise<[number, number]> {
  const params = new URLSearchParams({
    q: address,
    access_token: token,
    limit: '1',
    country: 'us',
  })
  const response = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params}`)

  if (!response.ok) throw new Error('Mapbox could not find that location. Check the address and try again.')

  const data = await response.json() as GeocodeResponse
  const coordinates = data.features?.[0]?.geometry?.coordinates
  if (!coordinates) throw new Error('Mapbox could not find that location. Check the address and try again.')

  return coordinates
}

export async function getMapboxRoute(
  origin: string,
  destination: string,
  token: string,
): Promise<RoutePreview> {
  if (!token) throw new Error('Add VITE_MAPBOX_ACCESS_TOKEN to your .env.local file to preview routes.')

  const [originCoordinates, destinationCoordinates] = await Promise.all([
    geocodeAddress(origin, token),
    geocodeAddress(destination, token),
  ])
  const coordinates = `${originCoordinates.join(',')};${destinationCoordinates.join(',')}`
  const params = new URLSearchParams({
    access_token: token,
    geometries: 'geojson',
    overview: 'full',
  })
  const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?${params}`)

  if (!response.ok) throw new Error('Mapbox could not calculate a driving route. Check the locations and try again.')

  const data = await response.json() as DirectionsResponse
  const route = data.routes?.[0]
  if (!route?.geometry?.coordinates?.length) {
    throw new Error('No driving route was found between those locations.')
  }

  return {
    coordinates: route.geometry.coordinates,
    originCoordinates,
    destinationCoordinates,
    distanceMiles: route.distance / 1609.344,
    driveMinutes: route.duration / 60,
  }
}