import { useState, type FormEvent } from 'react'
import RouteMap from '../components/maps/RouteMap'
import type { ShipmentProduct, SupplyRoute } from '../data/routes'
import { oregonProductCategories } from '../data/oregonProductCatalog'
import { getMapboxRoute, type RoutePreview } from '../utils/mapbox'

interface RouteFormValues {
  origin: string
  destination: string
  shipmentCost: string
  distanceMiles: string
  driveMinutes: string
  loadMinutes: string
  unloadMinutes: string
  fuelPrice: string
  mpg: string
  driveRate: string
  loadRate: string
  vehicle: string
  driver: string
  items: string
  weight: string
  volume: string
  enteredRevenue: string
  depreciation: string
  insurance: string
  maintenance: string
  other: string
}

interface ProductLineValues {
  categoryId: string
  product: string
  description: string
  unit: string
  quantity: string
  unitCost: string
  packaging: string
  handling: string
}

function createBlankProductLine(): ProductLineValues {
  return {
    categoryId: '',
    product: '',
    description: '',
    unit: '',
    quantity: '',
    unitCost: '',
    packaging: '',
    handling: '',
  }
}

const initialValues: RouteFormValues = {
  origin: '',
  destination: '',
  shipmentCost: '',
  distanceMiles: '',
  driveMinutes: '',
  loadMinutes: '',
  unloadMinutes: '',
  fuelPrice: '',
  mpg: '',
  driveRate: '',
  loadRate: '',
  vehicle: '',
  driver: '',
  items: '',
  weight: '',
  volume: '',
  enteredRevenue: '',
  depreciation: '',
  insurance: '',
  maintenance: '',
  other: '',
}

function getRouteFormValues(route?: SupplyRoute): RouteFormValues {
  if (!route) return initialValues

  const existingItemizedCost = Object.values(route.costs).reduce((total, cost) => total + cost, 0)

  return {
    origin: route.origin,
    destination: route.destination,
    shipmentCost: (route.shipmentCost ?? existingItemizedCost).toString(),
    distanceMiles: route.distanceMiles > 0 ? route.distanceMiles.toString() : '',
    driveMinutes: route.driveMinutes > 0 ? route.driveMinutes.toString() : '',
    loadMinutes: route.loadMinutes > 0 ? route.loadMinutes.toString() : '',
    unloadMinutes: route.unloadMinutes > 0 ? route.unloadMinutes.toString() : '',
    fuelPrice: route.fuelPrice > 0 ? route.fuelPrice.toString() : '',
    mpg: route.mpg > 0 ? route.mpg.toString() : '',
    driveRate: route.driveRate > 0 ? route.driveRate.toString() : '',
    loadRate: route.loadRate > 0 ? route.loadRate.toString() : '',
    vehicle: route.vehicle === 'Not specified' ? '' : route.vehicle,
    driver: route.driver === 'Not specified' ? '' : route.driver,
    items: route.items > 0 ? route.items.toString() : '',
    weight: route.weight > 0 ? route.weight.toString() : '',
    volume: route.volume > 0 ? route.volume.toString() : '',
    enteredRevenue: route.enteredRevenue > 0 ? route.enteredRevenue.toString() : '',
    depreciation: route.costs.depreciation.toString(),
    insurance: route.costs.insurance.toString(),
    maintenance: route.costs.maintenance.toString(),
    other: route.costs.other.toString(),
  }
}

function getProductLineValues(route?: SupplyRoute): ProductLineValues[] {
  if (!route) return [createBlankProductLine()]

  const savedProducts: ShipmentProduct[] = route.products?.length
    ? route.products
    : route.product
      ? [{
        id: `${route.id}-legacy-product`,
        category: route.productCategory ?? '',
        product: route.product,
        description: route.productDescription ?? '',
        unit: route.productUnit ?? '',
        quantity: route.productQuantity ?? 0,
        unitCost: route.productUnitCost ?? 0,
        totalCost: route.productQuantity !== undefined && route.productUnitCost !== undefined
          ? route.productQuantity * route.productUnitCost
          : route.costs.goods,
        packaging: route.productPackaging ?? '',
        handling: route.productHandling ?? '',
      }]
      : []

  if (!savedProducts.length) return [createBlankProductLine()]

  return savedProducts.map((product) => {
    const category = oregonProductCategories.find((option) =>
      option.id === product.category
      || option.name === product.category
      || option.products.some((optionProduct) => optionProduct.name === product.product),
    )

    return {
      categoryId: category?.id ?? '',
      product: product.product,
      description: product.description,
      unit: product.unit || 'lb',
      quantity: product.quantity > 0 ? String(product.quantity) : product.totalCost > 0 ? '1' : '',
      unitCost: product.unitCost > 0 ? String(product.unitCost) : product.totalCost > 0 ? String(product.totalCost) : '',
      packaging: product.packaging,
      handling: product.handling,
    }
  })
}

function getRoutePreview(route?: SupplyRoute): RoutePreview | null {
  if (!route?.routeGeometry?.length || !route.originCoordinates || !route.destinationCoordinates) return null

  return {
    coordinates: route.routeGeometry,
    originCoordinates: route.originCoordinates,
    destinationCoordinates: route.destinationCoordinates,
    distanceMiles: route.distanceMiles,
    driveMinutes: route.driveMinutes,
  }
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function numberValue(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

function createRouteId() {
  return `USER-${Date.now()}`
}

function currentTimestamp() {
  return new Date().toISOString()
}

interface CreateRoutePageProps {
  accessToken: string
  initialRoute?: SupplyRoute
  onBack: () => void
  onCancel: () => void
  onSave: (route: SupplyRoute) => void
}

function CreateRoutePage({ accessToken, initialRoute, onBack, onCancel, onSave }: CreateRoutePageProps) {
  const [values, setValues] = useState<RouteFormValues>(() => getRouteFormValues(initialRoute))
  const [products, setProducts] = useState<ProductLineValues[]>(() => getProductLineValues(initialRoute))
  const [routePreview, setRoutePreview] = useState<RoutePreview | null>(() => getRoutePreview(initialRoute))
  const [showDetails, setShowDetails] = useState(Boolean(initialRoute))
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [message, setMessage] = useState('')
  const [productCostEdited, setProductCostEdited] = useState(false)
  const productTotalCost = products.reduce((total, product) =>
    total + numberValue(product.quantity) * numberValue(product.unitCost),
    0,
  )

  const update = (field: keyof RouteFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const updateProductLine = (index: number, changes: Partial<ProductLineValues>, affectsCost = false) => {
    setProducts((current) => current.map((product, productIndex) =>
      productIndex === index ? { ...product, ...changes } : product,
    ))
    if (affectsCost) setProductCostEdited(true)
  }

  const updateProductCategory = (index: number, categoryId: string) => {
    const category = oregonProductCategories.find((option) => option.id === categoryId)
    updateProductLine(index, {
      categoryId,
      product: '',
      description: '',
      unit: '',
      unitCost: '',
      packaging: '',
      handling: category?.defaultHandling ?? '',
    }, true)
  }

  const updateProduct = (index: number, productName: string) => {
    const selectedCategory = oregonProductCategories.find((category) => category.id === products[index]?.categoryId)
    const product = selectedCategory?.products.find((option) => option.name === productName)
    updateProductLine(index, {
      product: productName,
      unit: product?.defaultUnit ?? '',
      unitCost: product ? String(product.suggestedUnitCost) : '',
      packaging: '',
    }, true)
  }

  const addProductLine = () => {
    setProducts((current) => [...current, createBlankProductLine()])
    setProductCostEdited(true)
  }

  const removeProductLine = (index: number) => {
    setProducts((current) => current.filter((_, productIndex) => productIndex !== index))
    setProductCostEdited(true)
  }

  const updateLocation = (field: 'origin' | 'destination', value: string) => {
    setValues((current) => ({ ...current, [field]: value, distanceMiles: '', driveMinutes: '' }))
    setRoutePreview(null)
    setMessage('')
  }

  const previewRoute = async () => {
    if (!values.origin.trim() || !values.destination.trim()) {
      setMessage('Enter both route locations before previewing the map.')
      return
    }

    setIsPreviewing(true)
    setMessage('')
    try {
      const preview = await getMapboxRoute(values.origin, values.destination, accessToken)
      setRoutePreview(preview)
      setValues((current) => ({
        ...current,
        distanceMiles: preview.distanceMiles.toFixed(1),
        driveMinutes: preview.driveMinutes.toFixed(0),
      }))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not preview this route.')
    } finally {
      setIsPreviewing(false)
    }
  }

  const saveRoute = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const distanceMiles = routePreview?.distanceMiles ?? numberValue(values.distanceMiles)
    const driveMinutes = routePreview?.driveMinutes ?? numberValue(values.driveMinutes)
    const loadMinutes = numberValue(values.loadMinutes)
    const unloadMinutes = numberValue(values.unloadMinutes)
    const fuelPrice = numberValue(values.fuelPrice)
    const mpg = numberValue(values.mpg)
    const driveRate = numberValue(values.driveRate)
    const loadRate = numberValue(values.loadRate)
    const enteredRevenue = numberValue(values.enteredRevenue)
    const routeId = initialRoute?.id ?? createRouteId()
    const shipmentProducts: ShipmentProduct[] = products
      .filter((product) => product.categoryId || product.product || product.description || product.quantity || product.unitCost)
      .map((product, index) => {
        const category = oregonProductCategories.find((option) => option.id === product.categoryId)
        const quantity = numberValue(product.quantity)
        const unitCost = numberValue(product.unitCost)

        return {
          id: initialRoute?.products?.[index]?.id ?? `${routeId}-product-${index + 1}`,
          category: category?.name ?? 'Other / custom',
          product: product.product.trim() || 'Unspecified product',
          description: product.description.trim(),
          quantity,
          unit: product.unit || 'item',
          unitCost,
          totalCost: quantity * unitCost,
          packaging: product.packaging,
          handling: product.handling,
        }
      })
    const productTotalCost = shipmentProducts.reduce((total, product) => total + product.totalCost, 0)
    const firstProduct = shipmentProducts[0]
    const costs = {
      driverDrive: (driveMinutes / 60) * driveRate,
      driverLoad: (loadMinutes / 60) * loadRate,
      driverUnload: (unloadMinutes / 60) * loadRate,
      fuel: distanceMiles > 0 && mpg > 0 ? (distanceMiles / mpg) * fuelPrice : 0,
      depreciation: numberValue(values.depreciation),
      insurance: numberValue(values.insurance),
      maintenance: numberValue(values.maintenance),
      goods: initialRoute && !productCostEdited ? initialRoute.costs.goods : productTotalCost,
      other: numberValue(values.other),
    }
    const firstPlace = values.origin.split(',')[0].trim()
    const lastPlace = values.destination.split(',')[0].trim()
    const originUnchanged = initialRoute?.origin === values.origin
    const destinationUnchanged = initialRoute?.destination === values.destination

    onSave({
      id: routeId,
      createdAt: initialRoute?.createdAt ?? currentTimestamp(),
      source: initialRoute?.source ?? 'user',
      farm: originUnchanged ? initialRoute.farm : firstPlace || values.origin,
      customer: destinationUnchanged ? initialRoute.customer : lastPlace || values.destination,
      origin: values.origin.trim(),
      destination: values.destination.trim(),
      originDetail: values.origin.trim(),
      destinationDetail: values.destination.trim(),
      tripsPerMonth: 0,
      distanceMiles,
      driveMinutes,
      loadMinutes,
      unloadMinutes,
      fuelPrice,
      mpg,
      driveRate,
      loadRate,
      vehicle: values.vehicle.trim() || 'Not specified',
      vehicleNote: mpg > 0 ? `${mpg} MPG` : 'Vehicle details not provided',
      driver: values.driver.trim() || 'Not specified',
      items: numberValue(values.items),
      weight: numberValue(values.weight),
      volume: numberValue(values.volume),
      enteredRevenue,
      calculatedRevenue: enteredRevenue,
      shipmentCost: numberValue(values.shipmentCost),
      products: shipmentProducts,
      productCategory: firstProduct?.category ?? '',
      product: firstProduct?.product ?? '',
      productDescription: firstProduct?.description ?? '',
      productUnit: firstProduct?.unit ?? '',
      productQuantity: firstProduct?.quantity,
      productUnitCost: firstProduct?.unitCost,
      productPackaging: firstProduct?.packaging ?? '',
      productHandling: firstProduct?.handling ?? '',
      routeGeometry: routePreview?.coordinates ?? initialRoute?.routeGeometry,
      originCoordinates: routePreview?.originCoordinates ?? initialRoute?.originCoordinates,
      destinationCoordinates: routePreview?.destinationCoordinates ?? initialRoute?.destinationCoordinates,
      costs,
    })
  }

  return (
    <section className="route-create-page" aria-labelledby="create-route-title">
      <div className="route-create-back-actions">
        <button className="back-button" type="button" onClick={onCancel}>Back to Main Page</button>
        {initialRoute && <button className="back-button back-button-secondary" type="button" onClick={onBack}>Back</button>}
      </div>
      <header className="create-heading">
        <div>
          <p className="eyebrow">ROUTE PLANNING <span>/</span> NEW ROUTE</p>
          <h1 id="create-route-title">{initialRoute ? 'Edit route' : 'Plan a route'}</h1>
          <p className="page-description">Start with the shipment essentials. Add operating detail when you need it.</p>
        </div>
        <span className="fictional-stamp">SAVED IN THIS BROWSER</span>
      </header>

      <div className="route-create-layout">
        <form className="route-create-form" onSubmit={saveRoute}>
          <section className="form-section" aria-labelledby="basic-route-title">
            <header className="form-section-heading">
              <span className="form-step numeric">01</span>
              <div><h2 id="basic-route-title">Route basics</h2><p>Starting point, destination, and shipment cost.</p></div>
            </header>

            <label className="form-field">
              <span>Starting point</span>
              <input
                autoComplete="street-address"
                required
                value={values.origin}
                onChange={(event) => updateLocation('origin', event.target.value)}
                placeholder="Address, farm, or town"
              />
            </label>
            <label className="form-field">
              <span>Destination</span>
              <input
                required
                value={values.destination}
                onChange={(event) => updateLocation('destination', event.target.value)}
                placeholder="Address, customer, or town"
              />
            </label>
            <label className="form-field">
              <span>Shipment cost estimate ($)</span>
              <input
                required
                min="0"
                step="0.01"
                type="number"
                value={values.shipmentCost}
                onChange={(event) => update('shipmentCost', event.target.value)}
                placeholder="0.00"
              />
            </label>

            <button className="map-preview-button" type="button" onClick={previewRoute} disabled={isPreviewing}>
              {isPreviewing ? 'Finding route...' : 'Preview driving route'}
            </button>
            {routePreview && (
              <p className="route-preview-result" role="status">
                {routePreview.distanceMiles.toFixed(1)} mi · approximately {Math.round(routePreview.driveMinutes)} min driving
              </p>
            )}
            {message && <p className="form-message" role="alert">{message}</p>}
          </section>

          <section className="form-section details-section" aria-labelledby="advanced-details-title">
            <button
              className="details-toggle"
              type="button"
              aria-expanded={showDetails}
              onClick={() => setShowDetails((current) => !current)}
            >
              <span><span className="form-step numeric" aria-hidden="true">02</span><span><strong id="advanced-details-title">More details</strong><small>Time, vehicle, load, and itemized costs</small></span></span>
              <span className="toggle-mark" aria-hidden="true">{showDetails ? '−' : '+'}</span>
            </button>

            {showDetails && (
              <div className="advanced-form-fields">
                <section className="product-lines-section" aria-labelledby="product-lines-title">
                  <header className="product-lines-heading">
                    <div>
                      <h3 id="product-lines-title">Products on this route</h3>
                      <p>Build a mixed load with separate quantities, costs, and handling.</p>
                    </div>
                    <strong className="product-total numeric">{currency.format(productTotalCost)}</strong>
                  </header>
                  <p className="form-helper">Suggested unit costs and handling profiles are synthetic planning defaults. Verify and edit them for each shipment.</p>

                  {products.map((productLine, index) => {
                    const category = oregonProductCategories.find((option) => option.id === productLine.categoryId)
                    const selectedProduct = category?.products.find((option) => option.name === productLine.product)
                    const lineTotal = numberValue(productLine.quantity) * numberValue(productLine.unitCost)

                    return (
                      <fieldset className="advanced-group product-line" key={index}>
                        <legend>Product {index + 1}</legend>
                        {products.length > 1 && (
                          <button className="product-remove-button" type="button" onClick={() => removeProductLine(index)}>
                            Remove product
                          </button>
                        )}
                        <div className="form-field-row two-fields">
                          <label className="form-field">
                            <span>Category</span>
                            <select value={productLine.categoryId} onChange={(event) => updateProductCategory(index, event.target.value)}>
                              <option value="">Select a category</option>
                              {oregonProductCategories.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                            </select>
                          </label>
                          <label className="form-field">
                            <span>Product</span>
                            <select value={productLine.product} disabled={!category} onChange={(event) => updateProduct(index, event.target.value)}>
                              <option value="">{category ? 'Select a product' : 'Select a category first'}</option>
                              {category?.products.map((option) => <option key={option.id} value={option.name}>{option.name}</option>)}
                            </select>
                          </label>
                        </div>
                        <div className="form-field-row">
                          <TextField
                            label="Variety, grade, or lot notes"
                            value={productLine.description}
                            onChange={(value) => updateProductLine(index, { description: value })}
                            placeholder="Cultivar, grade, lot, or exact product"
                          />
                        </div>
                        <div className="form-field-row three-fields">
                          <NumberField label="Quantity" value={productLine.quantity} onChange={(value) => updateProductLine(index, { quantity: value }, true)} />
                          <NumberField label={`Cost per ${productLine.unit || 'unit'} ($)`} value={productLine.unitCost} onChange={(value) => updateProductLine(index, { unitCost: value }, true)} />
                          <label className="form-field">
                            <span>Unit</span>
                            <select value={productLine.unit} disabled={!selectedProduct} onChange={(event) => updateProductLine(index, { unit: event.target.value }, true)}>
                              {selectedProduct?.units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                            </select>
                          </label>
                        </div>
                        <div className="form-field-row two-fields">
                          <label className="form-field">
                            <span>Packaging</span>
                            <select value={productLine.packaging} disabled={!category} onChange={(event) => updateProductLine(index, { packaging: event.target.value })}>
                              <option value="">Select packaging</option>
                              {category?.packagingOptions.map((packaging) => <option key={packaging} value={packaging}>{packaging}</option>)}
                            </select>
                          </label>
                          <label className="form-field">
                            <span>Handling profile</span>
                            <select value={productLine.handling} disabled={!category} onChange={(event) => updateProductLine(index, { handling: event.target.value })}>
                              <option value="">Select handling</option>
                              {category?.handlingOptions.map((handling) => <option key={handling} value={handling}>{handling}</option>)}
                            </select>
                          </label>
                        </div>
                        <p className="product-line-total">Product line total: <strong className="numeric">{currency.format(lineTotal)}</strong></p>
                      </fieldset>
                    )
                  })}

                  <button className="secondary-button add-product-button" type="button" onClick={addProductLine}>
                    + Add another product
                  </button>
                </section>

                <fieldset className="advanced-group">
                  <legend>Time and rates</legend>
                  <div className="form-field-row three-fields">
                    <NumberField label="Drive minutes" value={values.driveMinutes} onChange={(value) => update('driveMinutes', value)} />
                    <NumberField label="Load minutes" value={values.loadMinutes} onChange={(value) => update('loadMinutes', value)} />
                    <NumberField label="Unload minutes" value={values.unloadMinutes} onChange={(value) => update('unloadMinutes', value)} />
                  </div>
                  <div className="form-field-row two-fields">
                    <NumberField label="Drive rate ($/hr)" value={values.driveRate} onChange={(value) => update('driveRate', value)} />
                    <NumberField label="Load rate ($/hr)" value={values.loadRate} onChange={(value) => update('loadRate', value)} />
                  </div>
                </fieldset>

                <fieldset className="advanced-group">
                  <legend>Vehicle and fuel</legend>
                  <div className="form-field-row two-fields">
                    <TextField label="Vehicle" value={values.vehicle} onChange={(value) => update('vehicle', value)} placeholder="Van, truck, or trailer" />
                    <TextField label="Driver" value={values.driver} onChange={(value) => update('driver', value)} placeholder="Name (optional)" />
                  </div>
                  <div className="form-field-row three-fields">
                    <NumberField label="Distance (mi)" value={values.distanceMiles} onChange={(value) => update('distanceMiles', value)} />
                    <NumberField label="Fuel economy (MPG)" value={values.mpg} onChange={(value) => update('mpg', value)} />
                    <NumberField label="Fuel price ($/gal)" value={values.fuelPrice} onChange={(value) => update('fuelPrice', value)} />
                  </div>
                </fieldset>

                <fieldset className="advanced-group">
                  <legend>Load and revenue</legend>
                  <div className="form-field-row four-fields">
                    <NumberField label="Items" value={values.items} onChange={(value) => update('items', value)} />
                    <NumberField label="Weight (lb)" value={values.weight} onChange={(value) => update('weight', value)} />
                    <NumberField label="Volume (cu ft)" value={values.volume} onChange={(value) => update('volume', value)} />
                    <NumberField label="Trip revenue ($)" value={values.enteredRevenue} onChange={(value) => update('enteredRevenue', value)} />
                  </div>
                </fieldset>

                <fieldset className="advanced-group">
                  <legend>Additional operating costs</legend>
                  <div className="form-field-row three-fields">
                    <NumberField label="Depreciation ($)" value={values.depreciation} onChange={(value) => update('depreciation', value)} />
                    <NumberField label="Insurance ($)" value={values.insurance} onChange={(value) => update('insurance', value)} />
                    <NumberField label="Maintenance ($)" value={values.maintenance} onChange={(value) => update('maintenance', value)} />
                    <NumberField label="Other costs ($)" value={values.other} onChange={(value) => update('other', value)} />
                  </div>
                  <p className="form-helper">Product cost is calculated from quantity × cost per unit. Other itemized estimates are shown separately from the shipment cost entered above.</p>
                </fieldset>
              </div>
            )}
          </section>

          <div className="form-actions">
            <button className="secondary-button" type="button" onClick={onCancel}>Cancel</button>
            <button className="primary-button" type="submit">{initialRoute ? 'Save changes' : 'Save route'}</button>
          </div>
        </form>

        <aside className="route-map-panel" aria-labelledby="route-preview-title">
          <header className="map-panel-heading">
            <div><span className="section-kicker">LIVE MAP</span><h2 id="route-preview-title">Route preview</h2></div>
            <span className="map-provider-label">MAPBOX</span>
          </header>
          <RouteMap accessToken={accessToken} route={routePreview} />
          <p className="map-panel-note">Enter both locations, then preview the route to calculate driving distance and time.</p>
        </aside>
      </div>
    </section>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input min="0" step="any" type="number" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}

export default CreateRoutePage