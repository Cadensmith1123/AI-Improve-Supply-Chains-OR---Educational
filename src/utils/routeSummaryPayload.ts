import type { SupplyRoute } from '../data/routes'

export function createRouteSummaryPayload(route: SupplyRoute) {
  return {
    id: route.id,
    source: route.source ?? 'demo',
    farm: route.farm,
    customer: route.customer,
    origin: route.origin,
    destination: route.destination,
    products: route.products?.map((product) => ({ ...product })) ?? [],
    productCategory: route.productCategory ?? null,
    product: route.product ?? null,
    productDescription: route.productDescription ?? null,
    productUnit: route.productUnit ?? null,
    productQuantity: route.productQuantity ?? null,
    productUnitCost: route.productUnitCost ?? null,
    productPackaging: route.productPackaging ?? null,
    productHandling: route.productHandling ?? null,
    productTotalCost: route.productQuantity !== undefined && route.productUnitCost !== undefined
      ? route.productQuantity * route.productUnitCost
      : null,
    tripsPerMonth: route.tripsPerMonth,
    distanceMiles: route.distanceMiles,
    driveMinutes: route.driveMinutes,
    loadMinutes: route.loadMinutes,
    unloadMinutes: route.unloadMinutes,
    fuelPrice: route.fuelPrice,
    mpg: route.mpg,
    vehicle: route.vehicle,
    driver: route.driver,
    items: route.items,
    weight: route.weight,
    volume: route.volume,
    shipmentCost: route.shipmentCost ?? null,
    enteredRevenue: route.enteredRevenue,
    calculatedRevenue: route.calculatedRevenue,
    costs: route.costs,
  }
}