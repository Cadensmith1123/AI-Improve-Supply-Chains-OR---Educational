import { useEffect, useState } from 'react'
import type { SupplyRoute } from '../../data/routes'
import { getMapboxRoute, type RoutePreview } from '../../utils/mapbox'
import RouteSummary from '../routes/RouteSummary'
import RouteMap from './RouteMap'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

interface FeaturedRouteMapProps {
  route: SupplyRoute
  accessToken: string
  onMoreDetails: () => void
}

function FeaturedRouteMap({ route, accessToken, onMoreDetails }: FeaturedRouteMapProps) {
  const [mapState, setMapState] = useState<{
    requestKey: string
    preview: RoutePreview | null
    message: string
    loading: boolean
  }>({ requestKey: '', preview: null, message: '', loading: false })
  const requestKey = `${route.id}|${route.origin}|${route.destination}|${accessToken}`
  const hasCurrentRequest = mapState.requestKey === requestKey
  const preview = hasCurrentRequest ? mapState.preview : null
  const mapMessage = hasCurrentRequest ? mapState.message : ''
  const isLoading = Boolean(accessToken) && (!hasCurrentRequest || mapState.loading)
  const totalCost = Object.values(route.costs).reduce((total, cost) => total + cost, 0)
  const netProfit = route.calculatedRevenue - totalCost

  useEffect(() => {
    let isCurrent = true
    if (!accessToken) return () => { isCurrent = false }

    getMapboxRoute(route.origin, route.destination, accessToken)
      .then((routePreview) => {
        if (isCurrent) setMapState({ requestKey, preview: routePreview, message: '', loading: false })
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setMapState({
            requestKey,
            preview: null,
            message: error instanceof Error ? error.message : 'Mapbox could not load this route.',
            loading: false,
          })
        }
      })

    return () => { isCurrent = false }
  }, [accessToken, requestKey, route.destination, route.id, route.origin])

  return (
    <>
      <section className="featured-run-section" aria-labelledby="featured-run-title">
        <div className="featured-run-copy">
          <p className="eyebrow">MOST FREQUENT RUN <span>/</span> {route.tripsPerMonth} TRIPS PER MONTH</p>
          <h2 id="featured-run-title">{route.farm} to {route.customer}</h2>
          <p className="featured-run-endpoints">{route.origin}<span aria-hidden="true">to</span>{route.destination}</p>
          <dl className="featured-run-metrics">
            <div><dt>ROUND TRIP</dt><dd className="numeric">{route.distanceMiles.toFixed(1)} mi</dd></div>
            <div><dt>TRIP COST</dt><dd className="numeric">{currency.format(totalCost)}</dd></div>
            <div><dt>CALCULATED NET</dt><dd className={`numeric ${netProfit >= 0 ? 'positive' : 'negative'}`}>{currency.format(netProfit)}</dd></div>
          </dl>
          <div className="featured-run-actions">
            <button className="secondary-button" type="button" onClick={onMoreDetails}>More details</button>
          </div>
          {isLoading && <p className="featured-map-status" role="status">Loading driving route from Mapbox...</p>}
          {mapMessage && <p className="featured-map-status is-error" role="status">{mapMessage}</p>}
        </div>
        <figure className="featured-run-map" aria-labelledby="featured-map-caption">
          <figcaption className="featured-map-heading" id="featured-map-caption">
            <span>DRIVING ROUTE MAP</span>
            <span>{preview ? `${preview.distanceMiles.toFixed(1)} MI MAPBOX DISTANCE` : 'MAPBOX'}</span>
          </figcaption>
          <RouteMap accessToken={accessToken} route={preview} className="featured-map-canvas" />
        </figure>
      </section>
      <RouteSummary key={route.id} route={route} placement="featured" />
    </>
  )
}

export default FeaturedRouteMap