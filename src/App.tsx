import { useEffect, useMemo, useRef, useState } from 'react'
import CreateRoutePage from './pages/CreateRoutePage'
import { demoWorkspaces, type SupplyRoute } from './data/routes'
import RouteMap from './components/maps/RouteMap'
import FeaturedRouteMap from './components/maps/FeaturedRouteMap'
import RouteSummary from './components/routes/RouteSummary'
import { getMapboxRoute, type RoutePreview } from './utils/mapbox'
import wagonImage from './assets/WagonImg.png'
import './App.css'

type RouteFilter = 'frequency' | 'recent' | 'profit' | 'loss'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const userRoutesStorageKey = 'oregon-supply-user-routes'
const routeOverridesStorageKey = 'oregon-supply-route-overrides'
const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? ''
const defaultWorkspaceId = demoWorkspaces[0].id

function readUserRoutes(): SupplyRoute[] {
  try {
    const storedRoutes: unknown = JSON.parse(localStorage.getItem(userRoutesStorageKey) ?? '[]')
    if (!Array.isArray(storedRoutes)) return []

    return storedRoutes.filter((route): route is SupplyRoute =>
      typeof route === 'object'
      && route !== null
      && route.source === 'user'
      && typeof route.id === 'string'
      && typeof route.origin === 'string'
      && typeof route.destination === 'string'
      && typeof route.costs === 'object'
      && route.costs !== null,
    ).map((route) => ({
      ...route,
      workspaceId: typeof route.workspaceId === 'string' ? route.workspaceId : defaultWorkspaceId,
    }))
  } catch {
    return []
  }
}

function readRouteOverrides(): SupplyRoute[] {
  try {
    const storedRoutes: unknown = JSON.parse(localStorage.getItem(routeOverridesStorageKey) ?? '[]')
    if (!Array.isArray(storedRoutes)) return []

    return storedRoutes.filter((route): route is SupplyRoute =>
      typeof route === 'object'
      && route !== null
      && route.source === 'demo'
      && typeof route.workspaceId === 'string'
      && typeof route.id === 'string'
      && typeof route.origin === 'string'
      && typeof route.destination === 'string'
      && typeof route.costs === 'object'
      && route.costs !== null,
    )
  } catch {
    return []
  }
}

function getRouteTotals(route: SupplyRoute) {
  const itemizedCost = Object.values(route.costs).reduce((total, cost) => total + cost, 0)
  const totalCost = route.source === 'user' && itemizedCost === 0
    ? route.shipmentCost ?? 0
    : itemizedCost

  return {
    totalCost,
    enteredProfit: route.enteredRevenue - totalCost,
    calculatedProfit: route.calculatedRevenue - totalCost,
    margin: route.calculatedRevenue > 0
      ? ((route.calculatedRevenue - totalCost) / route.calculatedRevenue) * 100
      : 0,
  }
}

function getRouteProductLabel(route: SupplyRoute) {
  const productNames = route.products?.map((product) => product.product).filter(Boolean)
  if (productNames?.length) return productNames.join(', ')
  return route.product || 'Product not specified'
}

function App() {
  const [selectedRoute, setSelectedRoute] = useState<SupplyRoute | null>(null)
  const [userRoutes, setUserRoutes] = useState<SupplyRoute[]>(readUserRoutes)
  const [routeOverrides, setRouteOverrides] = useState<SupplyRoute[]>(readRouteOverrides)
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(defaultWorkspaceId)
  const [activeView, setActiveView] = useState<'directory' | 'create' | 'edit' | 'detail'>('directory')
  const [editReturnView, setEditReturnView] = useState<'directory' | 'detail'>('directory')
  const [editReturnRoute, setEditReturnRoute] = useState<SupplyRoute | null>(null)
  const [routeFilter, setRouteFilter] = useState<RouteFilter>('frequency')
  const [showNotice, setShowNotice] = useState(true)
  const noticeRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    noticeRef.current?.focus()
  }, [])

  const dismissNotice = () => {
    setShowNotice(false)
    requestAnimationFrame(() => mainRef.current?.focus())
  }

  useEffect(() => {
    try {
      localStorage.setItem(userRoutesStorageKey, JSON.stringify(userRoutes))
    } catch {
      // Keep the current session usable when browser storage is unavailable.
    }
  }, [userRoutes])

  useEffect(() => {
    try {
      localStorage.setItem(routeOverridesStorageKey, JSON.stringify(routeOverrides))
    } catch {
      // Keep the current session usable when browser storage is unavailable.
    }
  }, [routeOverrides])

  const activeWorkspace = demoWorkspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? demoWorkspaces[0]
  const activeWorkspaceRoutes = useMemo(
    () => [
      ...userRoutes.filter((route) => route.workspaceId === activeWorkspace.id),
      ...activeWorkspace.routes.map((route) =>
        routeOverrides.find((override) => override.workspaceId === activeWorkspace.id && override.id === route.id) ?? route,
      ),
    ],
    [activeWorkspace, routeOverrides, userRoutes],
  )

  const selectWorkspace = (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId)
    setSelectedRoute(null)
    setActiveView('directory')
    setRouteFilter('frequency')
  }

  const openRoute = (route: SupplyRoute) => {
    setSelectedRoute(route)
    setActiveView('detail')
  }

  const editRoute = (route: SupplyRoute) => {
    const returningToDetail = activeView === 'detail'
    setEditReturnView(returningToDetail ? 'detail' : 'directory')
    setEditReturnRoute(returningToDetail ? route : null)
    setSelectedRoute(route)
    setActiveView('edit')
  }

  const backFromEdit = () => {
    if (editReturnView === 'detail' && editReturnRoute) {
      setSelectedRoute(editReturnRoute)
      setActiveView('detail')
      return
    }

    openDirectory()
  }

  const openDirectory = () => {
    setSelectedRoute(null)
    setActiveView('directory')
  }

  const saveRoute = (route: SupplyRoute) => {
    const workspaceRoute = {
      ...route,
      id: activeView === 'edit' && selectedRoute ? selectedRoute.id : route.id,
      source: activeView === 'edit' && selectedRoute ? selectedRoute.source : 'user',
      createdAt: activeView === 'edit' && selectedRoute ? selectedRoute.createdAt : route.createdAt,
      workspaceId: activeWorkspace.id,
    }

    if (activeView === 'edit' && selectedRoute?.source === 'demo') {
      setRouteOverrides((currentRoutes) => {
        const otherRoutes = currentRoutes.filter((currentRoute) =>
          currentRoute.workspaceId !== activeWorkspace.id || currentRoute.id !== workspaceRoute.id,
        )
        return [...otherRoutes, workspaceRoute]
      })
    } else if (activeView === 'edit') {
      setUserRoutes((currentRoutes) => currentRoutes.map((currentRoute) =>
        currentRoute.id === workspaceRoute.id && currentRoute.workspaceId === activeWorkspace.id
          ? workspaceRoute
          : currentRoute,
      ))
    } else {
      setUserRoutes((currentRoutes) => [workspaceRoute, ...currentRoutes])
    }

    setSelectedRoute(workspaceRoute)
    setActiveView('detail')
  }

  const filteredRoutes = useMemo(() => {
    const matchingRoutes = activeWorkspaceRoutes.filter((route) => {
      const profit = getRouteTotals(route).calculatedProfit
      if (routeFilter === 'profit') return profit > 0
      if (routeFilter === 'loss') return profit < 0
      return true
    })

    return matchingRoutes.sort((first, second) => {
      if (routeFilter === 'recent') {
        return Date.parse(second.createdAt ?? '') - Date.parse(first.createdAt ?? '')
      }
      if (routeFilter === 'profit') {
        return getRouteTotals(second).calculatedProfit - getRouteTotals(first).calculatedProfit
      }
      if (routeFilter === 'loss') {
        return getRouteTotals(first).calculatedProfit - getRouteTotals(second).calculatedProfit
      }
      return second.tripsPerMonth - first.tripsPerMonth
    })
  }, [activeWorkspaceRoutes, routeFilter])

  const monthlyTrips = activeWorkspaceRoutes.reduce((total, route) => total + route.tripsPerMonth, 0)
  const mostFrequentRoute = activeWorkspaceRoutes.reduce((mostFrequent, route) =>
    route.tripsPerMonth > mostFrequent.tripsPerMonth ? route : mostFrequent,
  )
  const averageDistance = Math.round(
    activeWorkspaceRoutes.reduce((total, route) => total + route.distanceMiles, 0) / activeWorkspaceRoutes.length,
  )

  return (
    <div className="app-shell">
      <a className="skip-link" href="#routes">Skip to main content</a>
      <aside className="sidebar">
        <a className="brand-lockup" href="#routes" onClick={openDirectory}>
          <span className="brand-copy">
            <strong>Oregon Supply Company</strong>
            <small>ROUTE INTELLIGENCE</small>
          </span>
          <img className="brand-mark" src={wagonImage} alt="" aria-hidden="true" />
        </a>

        <h2 className="sidebar-label">WORKSPACES</h2>
        <nav className="workspace-list" aria-label="Select workspace">
          {demoWorkspaces.map((workspace) => (
            <button
              className={`workspace-switcher${workspace.id === activeWorkspace.id ? ' is-active' : ''}`}
              key={workspace.id}
              type="button"
              aria-pressed={workspace.id === activeWorkspace.id}
              onClick={() => selectWorkspace(workspace.id)}
            >
              <strong>{workspace.name}</strong>
              <small>{workspace.routes.length + userRoutes.filter((route) => route.workspaceId === workspace.id).length} routes</small>
            </button>
          ))}
        </nav>

        <nav aria-label="Main navigation">
          <button className={`nav-item${activeView === 'create' ? ' is-active' : ''}`} type="button" aria-current={activeView === 'create' ? 'page' : undefined} onClick={() => setActiveView('create')}>
            <span className="nav-plus" aria-hidden="true">+</span>
            Create route
          </button>
        </nav>

        <section className="sidebar-common-routes" aria-labelledby="sidebar-common-routes-title">
          <h2 className="sidebar-route-heading" id="sidebar-common-routes-title">{activeWorkspace.name} - Common Routes <span>{filteredRoutes.length}</span></h2>
          <label className="sidebar-sort-control">
            <span className="visually-hidden">Filter common routes</span>
            <select value={routeFilter} onChange={(event) => setRouteFilter(event.target.value as RouteFilter)}>
              <option value="frequency">Most Frequent</option>
              <option value="recent">Most Recent</option>
              <option value="profit">Net Profit</option>
              <option value="loss">Net Loss</option>
            </select>
          </label>
          <nav className="sidebar-route-list" aria-label="Common routes">
            {filteredRoutes.length > 0 ? (
              <ol className="sidebar-route-items">
                {filteredRoutes.map((route) => (
                  <li key={route.id}>
                    <button
                      className={`workspace-route${selectedRoute?.id === route.id ? ' is-selected' : ''}`}
                      type="button"
                      aria-current={selectedRoute?.id === route.id ? 'page' : undefined}
                      onClick={() => openRoute(route)}
                    >
                      <strong>{route.farm} to {route.customer}</strong>
                      <small>{getRouteProductLabel(route)} · {route.tripsPerMonth} trips / mo</small>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="sidebar-empty-state" role="status">No routes in this filter for {activeWorkspace.name}.</p>
            )}
          </nav>
        </section>

        <footer className="sidebar-note">
          <span className="status-dot" aria-hidden="true" />
          <span>
            <strong>{activeWorkspace.name}</strong>
            <small>{activeWorkspace.region} · fictional planning data</small>
          </span>
        </footer>
      </aside>

      <main className="main-content" id="routes" ref={mainRef} tabIndex={-1}>
        <header className="topbar">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol><li>Route planning</li><li aria-current="page">{activeWorkspace.name}</li></ol>
          </nav>
          <span className="demo-label"><span className="status-dot" aria-hidden="true" /> DEMO DATA</span>
        </header>

        {activeView === 'create' || activeView === 'edit' ? (
          <CreateRoutePage
            key={activeView === 'edit' ? selectedRoute?.id ?? 'edit-route' : 'new-route'}
            accessToken={mapboxAccessToken}
            initialRoute={activeView === 'edit' ? selectedRoute ?? undefined : undefined}
            onBack={backFromEdit}
            onCancel={openDirectory}
            onSave={saveRoute}
          />
        ) : activeView === 'detail' && selectedRoute ? (
          <RouteDetail
            route={selectedRoute}
            accessToken={mapboxAccessToken}
            onBack={openDirectory}
            onEdit={() => editRoute(selectedRoute)}
          />
        ) : (
          <section className="route-directory" aria-labelledby="page-title">
            <header className="page-heading">
              <div>
                <p className="eyebrow">{activeWorkspace.region.toUpperCase()} · ROUTE DIRECTORY</p>
                <h1 id="page-title">{activeWorkspace.name} routes</h1>
                <p className="page-description">
                  A working view of the farm-to-customer runs that keep your operation moving.
                </p>
              </div>
              <button className="primary-button directory-create-button" type="button" onClick={() => setActiveView('create')}>
                <span aria-hidden="true">+</span> New Route
              </button>
            </header>

            <section className="overview-strip" aria-label="Route summary">
              <SummaryMetric label="ROUTES IN WORKSPACE" value={String(activeWorkspaceRoutes.length).padStart(2, '0')} />
              <SummaryMetric label="TRIPS THIS MONTH" value={String(monthlyTrips)} />
              <SummaryMetric label="AVG. ROUND TRIP" value={`${averageDistance} mi`} />
              <div className="overview-caption">FICTIONAL OREGON OPERATIONS</div>
            </section>

            <FeaturedRouteMap
              key={activeWorkspace.id}
              route={mostFrequentRoute}
              accessToken={mapboxAccessToken}
              onMoreDetails={() => openRoute(mostFrequentRoute)}
            />

            <section className="common-routes-section" aria-labelledby="common-routes-title">
              <header className="routes-heading">
                <div>
                  <h2 id="common-routes-title">Common routes</h2>
                  <span aria-live="polite">{filteredRoutes.length} routes · {activeWorkspace.name}</span>
                </div>
                <span className="table-key"><span className="key-dot" aria-hidden="true" /> ESTIMATED NET</span>
              </header>

              {filteredRoutes.length > 0 ? (
                <ol className="route-list" aria-label={`${activeWorkspace.name} common routes`}>
                  {filteredRoutes.map((route, index) => (
                    <li key={route.id}>
                      <RouteCard
                        route={route}
                        rank={index + 1}
                        onSelect={() => openRoute(route)}
                        onEdit={() => editRoute(route)}
                      />
                    </li>
                  ))}
                </ol>
              ) : (
                <section className="empty-state" role="status">
                  <strong>No routes in this filter for {activeWorkspace.name}.</strong>
                </section>
              )}
            </section>

            <p className="data-note">All farms, routes, rates, and financial figures shown are fictional demo estimates.</p>
          </section>
        )}
        <footer className="site-footer">Caden Smith for Educational Purposes Only</footer>
      </main>

      {showNotice && (
        <div
          className="notice-backdrop"
          ref={noticeRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="notice-title"
          aria-describedby="notice-instruction"
          tabIndex={-1}
          onClick={dismissNotice}
          onKeyDown={(event) => {
            if (event.key === 'Tab') {
              event.preventDefault()
              noticeRef.current?.focus()
              return
            }
            if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              dismissNotice()
            }
          }}
        >
          <div className="notice-panel">
            <span className="notice-rule" aria-hidden="true" />
            <h2 id="notice-title">
              This project uses synthetic data and is solely used for educational purposes.
            </h2>
            <span className="notice-instruction" id="notice-instruction">Click anywhere to continue</span>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <dl className="summary-metric">
      <dt>{label}</dt>
      <dd className="numeric">{value}</dd>
    </dl>
  )
}

function RouteCard({ route, rank, onSelect, onEdit }: { route: SupplyRoute; rank: number; onSelect: () => void; onEdit: () => void }) {
  const totals = getRouteTotals(route)

  return (
    <article className="route-card">
      <span className="route-rank numeric" aria-hidden="true">{String(rank).padStart(2, '0')}</span>
      <span className="route-main">
        <span className="route-label">{route.farm} <span aria-hidden="true">TO</span> {route.customer}</span>
        <span className="route-endpoints">
          <span>{route.origin}</span>
          <span className="route-line" aria-hidden="true"><i /></span>
          <span>{route.destination}</span>
        </span>
        <span className="route-tags">
          <span>{getRouteProductLabel(route)}</span>
          <span>{route.tripsPerMonth} trips / mo</span>
          <span>{route.distanceMiles.toFixed(1)} mi round trip</span>
          <span>{route.vehicle}</span>
        </span>
      </span>
      <span className="route-result">
        <span className="result-label">CALCULATED NET</span>
        <strong className={totals.calculatedProfit >= 0 ? 'positive numeric' : 'negative numeric'}>
          {currency.format(totals.calculatedProfit)}
        </strong>
        <small>{currency.format(totals.totalCost)} estimated cost</small>
      </span>
      <div className="route-card-actions">
        <button className="route-open" type="button" onClick={onSelect} aria-label={`View details: ${route.farm} to ${route.customer}`}>
          View Details
        </button>
        <button className="route-edit" type="button" onClick={onEdit} aria-label={`Edit route: ${route.farm} to ${route.customer}`}>
          Edit Route
        </button>
      </div>
    </article>
  )
}

function RouteDetail({ route, accessToken, onBack, onEdit }: { route: SupplyRoute; accessToken: string; onBack: () => void; onEdit: () => void }) {
  const totals = getRouteTotals(route)
  const hasItemizedCosts = Object.values(route.costs).some((cost) => cost > 0)
  const hasRevenue = route.source !== 'user' || route.enteredRevenue > 0
  const savedRoutePreview: RoutePreview | null = route.routeGeometry?.length
    && route.originCoordinates
    && route.destinationCoordinates
    ? {
      coordinates: route.routeGeometry,
      originCoordinates: route.originCoordinates,
      destinationCoordinates: route.destinationCoordinates,
      distanceMiles: route.distanceMiles,
      driveMinutes: route.driveMinutes,
    }
    : null
  const hasSavedMapRoute = savedRoutePreview !== null
  const requestKey = `${route.id}|${route.origin}|${route.destination}|${accessToken}`
  const [mapState, setMapState] = useState<{ requestKey: string; preview: RoutePreview | null; message: string }>({
    requestKey: '',
    preview: null,
    message: '',
  })
  const hasCurrentMapState = mapState.requestKey === requestKey
  const isMapLoading = Boolean(accessToken) && !hasSavedMapRoute && !hasCurrentMapState
  const mapMessage = hasCurrentMapState ? mapState.message : ''
  const costRows = route.source === 'user' && !hasItemizedCosts
    ? [['Entered shipment cost', route.shipmentCost ?? totals.totalCost] as const]
    : [
    ['Driver · drive', route.costs.driverDrive],
    ['Driver · loading', route.costs.driverLoad],
    ['Driver · unloading', route.costs.driverUnload],
    ['Fuel', route.costs.fuel],
    ['Depreciation', route.costs.depreciation],
    ['Insurance', route.costs.insurance],
    ['Maintenance', route.costs.maintenance],
    ['Goods / COGS', route.costs.goods],
    ['Additional operating costs', route.costs.other],
  ] as const
  const routePreview = savedRoutePreview ?? (hasCurrentMapState ? mapState.preview : null)

  useEffect(() => {
    if (!accessToken || hasSavedMapRoute) return

    let isCurrent = true
    getMapboxRoute(route.origin, route.destination, accessToken)
      .then((preview) => {
        if (isCurrent) setMapState({ requestKey, preview, message: '' })
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setMapState({
            requestKey,
            preview: null,
            message: error instanceof Error ? error.message : 'Mapbox could not load this route.',
          })
        }
      })

    return () => { isCurrent = false }
  }, [accessToken, hasSavedMapRoute, requestKey, route.destination, route.id, route.origin])

  return (
    <section className="route-detail" aria-labelledby="detail-title">
      <div className="route-profile-actions">
        <button className="back-button" type="button" onClick={onBack}>Back to Main Page</button>
        <button className="secondary-button" type="button" onClick={onEdit}>Edit Route</button>
      </div>
      <header className="detail-heading">
        <div>
          <p className="eyebrow">ROUTE PROFILE <span>/</span> {route.id}</p>
          <h1 id="detail-title">{route.farm} to {route.customer}</h1>
          <p className="page-description">
            {route.source === 'user' ? 'User-created route · saved in this browser' : `Recurring round trip · ${route.tripsPerMonth} demo trips per month`}
          </p>
        </div>
        <span className="route-id numeric">{route.id}</span>
      </header>

      <section className="endpoint-panel" aria-label="Route endpoints">
        <dl className="endpoint">
          <dt className="endpoint-label">ORIGIN</dt>
          <dd><strong>{route.farm}</strong><small>{route.originDetail}</small></dd>
        </dl>
        <div className="endpoint-track" aria-hidden="true"><i /><i /></div>
        <dl className="endpoint">
          <dt className="endpoint-label">DESTINATION</dt>
          <dd><strong>{route.customer}</strong><small>{route.destinationDetail}</small></dd>
        </dl>
      </section>

      {(route.source === 'user' || route.products?.length) && (
        <dl className="route-detail-facts">
          {route.products && route.products.length > 0 ? (
            <div className="route-products-fact">
              <dt>PRODUCTS IN LOAD</dt>
              <dd>
                <ul className="route-product-list">
                  {route.products.map((product) => (
                    <li key={product.id}>
                      <strong>{product.product}</strong>
                      <span>{product.quantity.toLocaleString()} {product.unit} · {currency.format(product.unitCost)} / {product.unit} · {currency.format(product.totalCost)} total</span>
                      <small>{[product.category, product.description, product.packaging, product.handling].filter(Boolean).join(' · ')}</small>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ) : (
            <>
              {route.productCategory && <div><dt>PRODUCT CATEGORY</dt><dd>{route.productCategory}</dd></div>}
              <div><dt>PRODUCT</dt><dd>{route.product || 'Not specified'}</dd></div>
              {route.productDescription && <div><dt>VARIETY / GRADE</dt><dd>{route.productDescription}</dd></div>}
              {route.productQuantity !== undefined && route.productUnit && (
                <div><dt>PRODUCT QUANTITY</dt><dd className="numeric">{route.productQuantity.toLocaleString()} {route.productUnit}</dd></div>
              )}
              {route.productUnitCost !== undefined && (
                <div><dt>COST PER {route.productUnit?.toUpperCase() || 'UNIT'}</dt><dd className="numeric">{currency.format(route.productUnitCost)}</dd></div>
              )}
              {route.productPackaging && <div><dt>PACKAGING</dt><dd>{route.productPackaging}</dd></div>}
              {route.productHandling && <div><dt>HANDLING PROFILE</dt><dd>{route.productHandling}</dd></div>}
            </>
          )}
          {(route.source === 'user' || route.shipmentCost !== undefined) && (
            <div><dt>ENTERED SHIPMENT COST</dt><dd className="numeric">{currency.format(route.shipmentCost ?? 0)}</dd></div>
          )}
        </dl>
      )}

      <section className="detail-overview" aria-label="Route overview">
        <section className="overview-route-line" aria-labelledby="round-trip-title">
          <h2 className="section-kicker" id="round-trip-title">ROUND-TRIP ROUTE</h2>
          <div className="route-diagram">
            <span className="diagram-stop"><i aria-hidden="true" />{route.origin}</span>
            <span className="diagram-road"><i /></span>
            <span className="diagram-stop"><i aria-hidden="true" />{route.destination}</span>
          </div>
          <span className="diagram-caption">Round-trip route overview</span>
        </section>
        <dl className="vehicle-driver">
          <div><dt className="section-kicker">VEHICLE</dt><dd><strong>{route.vehicle}</strong><small>{route.vehicleNote}</small></dd></div>
          <div><dt className="section-kicker">DRIVER</dt><dd><strong>{route.driver}</strong><small>Drive rate {currency.format(route.driveRate)}/hr · Load rate {currency.format(route.loadRate)}/hr</small></dd></div>
        </dl>
      </section>

      <section className="detail-map-section" aria-label="Interactive route map">
        <header className="map-panel-heading">
          <div><span className="section-kicker">LIVE MAP</span><h2>Route map</h2></div>
          <span className="map-provider-label">MAPBOX</span>
        </header>
        {isMapLoading && <p className="map-request-status" role="status">Loading driving directions for this route...</p>}
        {mapMessage && <p className="map-request-status is-error" role="status">{mapMessage}</p>}
        <RouteMap accessToken={accessToken} route={routePreview} />
      </section>

      <RouteSummary key={route.id} route={route} placement="detail" />
      <section className="detail-section" aria-labelledby="financial-title">
        <header className="section-heading-row">
          <div><p className="eyebrow">OPERATING ESTIMATE</p><h2 id="financial-title">Financial metrics</h2></div>
          <span className="estimate-badge">DEMO ESTIMATE</span>
        </header>

        <div className="time-metrics">
          <Metric label="Drive time" value={`${route.driveMinutes.toFixed(1)} min`} />
          <Metric label="Load time" value={`${route.loadMinutes} min`} />
          <Metric label="Unload time" value={`${route.unloadMinutes} min`} />
          <Metric label="Round-trip distance" value={route.distanceMiles > 0 ? `${route.distanceMiles.toFixed(1)} mi` : 'Not previewed'} />
          <Metric label="Gas price" value={`${currency.format(route.fuelPrice)}/gal`} />
        </div>

        <div className="detail-columns">
          <section className="detail-block" aria-labelledby="cost-breakdown-title">
            <h3 id="cost-breakdown-title">Cost breakdown</h3>
            <dl className="cost-breakdown">
              {costRows.map(([label, amount]) => (
                <div className="cost-row" key={label}><dt>{label}</dt><dd className="numeric">{currency.format(amount)}</dd></div>
              ))}
              <div className="cost-total"><dt>Total trip cost</dt><dd className="numeric">{currency.format(totals.totalCost)}</dd></div>
            </dl>
          </section>

          <section className="detail-block load-block" aria-labelledby="load-stats-title">
            <h3 id="load-stats-title">Load stats</h3>
            <div className="load-stats">
              <Metric label="Items" value={String(route.items)} />
              <Metric label="Total weight" value={`${route.weight.toLocaleString()} lb`} />
              <Metric label="Total volume" value={`${route.volume.toFixed(1)} cu ft`} />
            </div>
            <h3 className="profitability-title">Profitability</h3>
            {hasRevenue ? (
              <div className="profit-comparison">
                <ProfitSummary label="Entered revenue" revenue={route.enteredRevenue} totalCost={totals.totalCost} profit={totals.enteredProfit} />
                <ProfitSummary label="Calculated revenue" revenue={route.calculatedRevenue} totalCost={totals.totalCost} profit={totals.calculatedProfit} />
              </div>
            ) : (
              <p className="profit-no-revenue">Add trip revenue in More details to calculate route profit.</p>
            )}
            <section className="break-even-box" aria-labelledby="break-even-title">
              <h3 className="section-kicker" id="break-even-title">{hasRevenue ? 'TRIP NET · CALCULATED REVENUE' : 'SHIPMENT COST ESTIMATE'}</h3>
              <strong className={!hasRevenue ? 'numeric' : totals.calculatedProfit >= 0 ? 'positive numeric' : 'negative numeric'}>
                {currency.format(hasRevenue ? totals.calculatedProfit : totals.totalCost)}
              </strong>
              <small>{hasRevenue ? `${totals.margin.toFixed(1)}% calculated margin · ${currency.format(totals.totalCost)} trip break-even` : 'Add itemized operating costs in the route details for a cost breakdown.'}</small>
            </section>
          </section>
        </div>
      </section>
      <p className="data-note">
        {route.source === 'user'
          ? 'Itemized operating costs are estimates. When entered, they are shown separately from the shipment-cost estimate.'
          : 'This is fictional planning data for demonstration only, not an audited cost or revenue forecast.'}
      </p>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <dl className="metric-cell"><dt>{label}</dt><dd className="numeric">{value}</dd></dl>
}

function ProfitSummary({ label, revenue, totalCost, profit }: { label: string; revenue: number; totalCost: number; profit: number }) {
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0

  return (
    <dl className="profit-summary">
      <div><dt>{label}</dt><dd className="numeric">{currency.format(revenue)}</dd></div>
      <div><dt>Trip cost</dt><dd className="numeric">{currency.format(totalCost)}</dd></div>
      <div><dt>Net · Margin</dt><dd className="numeric">{currency.format(profit)} · {margin.toFixed(1)}%</dd></div>
    </dl>
  )
}

export default App