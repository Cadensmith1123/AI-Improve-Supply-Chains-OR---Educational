export interface SupplyRoute {
  id: string
  workspaceId?: string
  createdAt?: string
  farm: string
  customer: string
  origin: string
  destination: string
  originDetail: string
  destinationDetail: string
  tripsPerMonth: number
  distanceMiles: number
  driveMinutes: number
  loadMinutes: number
  unloadMinutes: number
  fuelPrice: number
  mpg: number
  driveRate: number
  loadRate: number
  vehicle: string
  vehicleNote: string
  driver: string
  items: number
  weight: number
  volume: number
  enteredRevenue: number
  calculatedRevenue: number
  source?: 'demo' | 'user'
  products?: ShipmentProduct[]
  productCategory?: string
  product?: string
  productDescription?: string
  productUnit?: string
  productQuantity?: number
  productUnitCost?: number
  productPackaging?: string
  productHandling?: string
  shipmentCost?: number
  routeGeometry?: [number, number][]
  originCoordinates?: [number, number]
  destinationCoordinates?: [number, number]
  costs: {
    driverDrive: number
    driverLoad: number
    driverUnload: number
    fuel: number
    depreciation: number
    insurance: number
    maintenance: number
    goods: number
    other: number
  }
}

export interface ShipmentProduct {
  id: string
  category: string
  product: string
  description: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  packaging: string
  handling: string
}

export interface DemoWorkspace {
  id: string
  name: string
  region: string
  routes: SupplyRoute[]
}

const willametteValleyRoutes: SupplyRoute[] = [
  {
    id: 'OR-001',
    source: 'demo',
    product: 'Strawberries',
    farm: 'Green River Farm',
    customer: 'Red Barn Orchards',
    origin: 'Sauvie Island, OR',
    destination: 'Hood River, OR',
    originDetail: '4000 River Rd, Sauvie Island, OR',
    destinationDetail: '990 Fruit Loop Rd, Hood River, OR',
    tripsPerMonth: 18,
    distanceMiles: 352.4,
    driveMinutes: 345.73,
    loadMinutes: 60,
    unloadMinutes: 30,
    fuelPrice: 3.5,
    mpg: 18.5,
    driveRate: 25,
    loadRate: 18,
    vehicle: 'Sprinter Van 3',
    vehicleNote: 'Diesel · 18.5 MPG · Max weight 2,500 lb · Max volume 400 cu ft',
    driver: 'Pat',
    items: 1,
    weight: 100,
    volume: 6.25,
    enteredRevenue: 1500,
    calculatedRevenue: 674.38,
    costs: {
      driverDrive: 144.05,
      driverLoad: 18,
      driverUnload: 9,
      fuel: 66.68,
      depreciation: 15.2,
      insurance: 4.17,
      maintenance: 3.48,
      goods: 15.62,
      other: 300,
    },
  },
  {
    id: 'OR-002',
    source: 'demo',
    product: 'Cucumbers',
    farm: 'Juniper Table Farm',
    customer: 'Willamette Market Co-op',
    origin: 'McMinnville, OR',
    destination: 'Portland, OR',
    originDetail: '2180 Baker Creek Rd, McMinnville, OR',
    destinationDetail: 'SE Water Ave, Portland, OR',
    tripsPerMonth: 14,
    distanceMiles: 74.6,
    driveMinutes: 102,
    loadMinutes: 45,
    unloadMinutes: 35,
    fuelPrice: 3.62,
    mpg: 16.8,
    driveRate: 24,
    loadRate: 18,
    vehicle: 'Ford Transit 250',
    vehicleNote: 'Gas · 16.8 MPG · Max weight 3,000 lb · Max volume 350 cu ft',
    driver: 'Morgan',
    items: 24,
    weight: 860,
    volume: 112,
    enteredRevenue: 890,
    calculatedRevenue: 745,
    costs: {
      driverDrive: 40.8,
      driverLoad: 13.5,
      driverUnload: 10.5,
      fuel: 16.08,
      depreciation: 12.4,
      insurance: 4.17,
      maintenance: 5.6,
      goods: 96,
      other: 28,
    },
  },
  {
    id: 'OR-003',
    source: 'demo',
    product: 'Leafy greens',
    farm: 'Cedar Bench Produce',
    customer: 'Cascade Community Foods',
    origin: 'Bend, OR',
    destination: 'Sisters, OR',
    originDetail: '61400 Tumalo Reservoir Rd, Bend, OR',
    destinationDetail: 'Highway 20, Sisters, OR',
    tripsPerMonth: 11,
    distanceMiles: 48.2,
    driveMinutes: 64,
    loadMinutes: 35,
    unloadMinutes: 25,
    fuelPrice: 3.78,
    mpg: 15.4,
    driveRate: 26,
    loadRate: 19,
    vehicle: 'Isuzu NPR-HD',
    vehicleNote: 'Gas · 15.4 MPG · Max weight 6,500 lb · Max volume 780 cu ft',
    driver: 'Riley',
    items: 38,
    weight: 2480,
    volume: 286,
    enteredRevenue: 620,
    calculatedRevenue: 512,
    costs: {
      driverDrive: 27.73,
      driverLoad: 11.08,
      driverUnload: 7.92,
      fuel: 11.83,
      depreciation: 9.1,
      insurance: 5.2,
      maintenance: 6.8,
      goods: 82,
      other: 18,
    },
  },
  {
    id: 'OR-004',
    source: 'demo',
    product: 'Dairy',
    farm: 'Fern Hollow Farm',
    customer: 'Coastline Provisions',
    origin: 'Tillamook, OR',
    destination: 'Lincoln City, OR',
    originDetail: '7300 Long Prairie Rd, Tillamook, OR',
    destinationDetail: 'NE Highway 101, Lincoln City, OR',
    tripsPerMonth: 8,
    distanceMiles: 82.8,
    driveMinutes: 112,
    loadMinutes: 40,
    unloadMinutes: 30,
    fuelPrice: 3.69,
    mpg: 14.2,
    driveRate: 24,
    loadRate: 18,
    vehicle: 'Ram ProMaster 2500',
    vehicleNote: 'Gas · 14.2 MPG · Max weight 2,800 lb · Max volume 460 cu ft',
    driver: 'Casey',
    items: 17,
    weight: 1240,
    volume: 166,
    enteredRevenue: 780,
    calculatedRevenue: 625,
    costs: {
      driverDrive: 44.8,
      driverLoad: 12,
      driverUnload: 9,
      fuel: 21.52,
      depreciation: 13.8,
      insurance: 4.17,
      maintenance: 6.1,
      goods: 115,
      other: 26,
    },
  },
  {
    id: 'OR-005',
    source: 'demo',
    product: 'Strawberries',
    farm: 'Rose City Growers',
    customer: 'Lane County Food Hub',
    origin: 'Portland, OR',
    destination: 'Eugene, OR',
    originDetail: 'SE Portland market district, Portland, OR',
    destinationDetail: 'West Eugene Market, Eugene, OR',
    tripsPerMonth: 7,
    distanceMiles: 226.4,
    driveMinutes: 222,
    loadMinutes: 50,
    unloadMinutes: 35,
    fuelPrice: 3.54,
    mpg: 16.2,
    driveRate: 25,
    loadRate: 18,
    vehicle: 'Refrigerated Transit 250',
    vehicleNote: 'Diesel · 16.2 MPG · Max weight 3,200 lb · Max volume 390 cu ft',
    driver: 'Avery',
    items: 32,
    weight: 1850,
    volume: 210,
    enteredRevenue: 640,
    calculatedRevenue: 590,
    costs: {
      driverDrive: 92.5,
      driverLoad: 15,
      driverUnload: 10.5,
      fuel: 49.49,
      depreciation: 18.5,
      insurance: 4.75,
      maintenance: 15.25,
      goods: 135,
      other: 22,
    },
  },
  {
    id: 'OR-006',
    source: 'demo',
    product: 'Apples',
    farm: 'Orchard Ridge Cooperative',
    customer: 'Eastbank Produce Exchange',
    origin: 'Hood River, OR',
    destination: 'Portland, OR',
    originDetail: 'Fruit Loop, Hood River, OR',
    destinationDetail: 'SE Water Avenue, Portland, OR',
    tripsPerMonth: 12,
    distanceMiles: 143.8,
    driveMinutes: 154,
    loadMinutes: 48,
    unloadMinutes: 36,
    fuelPrice: 3.62,
    mpg: 16.5,
    driveRate: 25,
    loadRate: 18,
    vehicle: 'Ford Transit Refrigerated',
    vehicleNote: 'Gas · 16.5 MPG · Max weight 2,900 lb · Max volume 350 cu ft',
    driver: 'Taylor',
    items: 45,
    weight: 2180,
    volume: 296,
    enteredRevenue: 405,
    calculatedRevenue: 372,
    costs: {
      driverDrive: 64.17,
      driverLoad: 14.4,
      driverUnload: 10.8,
      fuel: 31.55,
      depreciation: 14.8,
      insurance: 4.5,
      maintenance: 8.75,
      goods: 215,
      other: 30,
    },
  },
  {
    id: 'OR-007',
    source: 'demo',
    product: 'Cucumbers',
    farm: 'North Coast Growers',
    customer: 'Neskowin Farm Stand',
    origin: 'Astoria, OR',
    destination: 'Neskowin, OR',
    originDetail: 'Marine Drive, Astoria, OR',
    destinationDetail: 'Pacific Avenue, Neskowin, OR',
    tripsPerMonth: 4,
    distanceMiles: 156.6,
    driveMinutes: 168,
    loadMinutes: 55,
    unloadMinutes: 30,
    fuelPrice: 3.75,
    mpg: 14.8,
    driveRate: 26,
    loadRate: 18,
    vehicle: 'Isuzu NPR-HD',
    vehicleNote: 'Gas · 14.8 MPG · Max weight 6,500 lb · Max volume 780 cu ft',
    driver: 'Jordan',
    items: 19,
    weight: 1460,
    volume: 178,
    enteredRevenue: 296,
    calculatedRevenue: 330,
    costs: {
      driverDrive: 72.8,
      driverLoad: 16.5,
      driverUnload: 9,
      fuel: 39.68,
      depreciation: 12.4,
      insurance: 5,
      maintenance: 13.3,
      goods: 90,
      other: 16,
    },
  },
]

interface DemoRouteSeed {
  id: string
  product: string
  farm: string
  customer: string
  origin: string
  destination: string
  tripsPerMonth: number
  distanceMiles: number
  driveMinutes: number
  loadMinutes: number
  unloadMinutes: number
  fuelPrice: number
  mpg: number
  vehicle: string
  vehicleNote: string
  driver: string
  items: number
  weight: number
  volume: number
  enteredRevenue: number
  calculatedRevenue: number
  goodsCost: number
  otherCost: number
}

function roundMoney(amount: number) {
  return Math.round(amount * 100) / 100
}

function buildWorkspaceRoutes(workspaceId: string, seeds: DemoRouteSeed[]): SupplyRoute[] {
  return seeds.map((seed, index) => {
    const { goodsCost, otherCost, ...routeFields } = seed
    const driveRate = 24
    const loadRate = 18

    return {
      ...routeFields,
      workspaceId,
      createdAt: new Date(Date.UTC(2026, 1, index + 1)).toISOString(),
      source: 'demo',
      originDetail: seed.origin,
      destinationDetail: seed.destination,
      driveRate,
      loadRate,
      costs: {
        driverDrive: roundMoney((seed.driveMinutes / 60) * driveRate),
        driverLoad: roundMoney((seed.loadMinutes / 60) * loadRate),
        driverUnload: roundMoney((seed.unloadMinutes / 60) * loadRate),
        fuel: roundMoney((seed.distanceMiles / seed.mpg) * seed.fuelPrice),
        depreciation: roundMoney(seed.distanceMiles * 0.055),
        insurance: 4.5,
        maintenance: roundMoney(seed.distanceMiles * 0.045),
        goods: goodsCost,
        other: otherCost,
      },
    }
  })
}

const oregonCoastId = 'oregon-coast'
const centralOregonId = 'central-oregon'

const oregonCoastRoutes = buildWorkspaceRoutes(oregonCoastId, [
  {
    id: 'OC-001', product: 'Blackberries', farm: 'Cape Lookout Berries', customer: 'North Coast Co-op',
    origin: 'Tillamook, OR', destination: 'Astoria, OR', tripsPerMonth: 13, distanceMiles: 126.4,
    driveMinutes: 142, loadMinutes: 42, unloadMinutes: 30, fuelPrice: 3.68, mpg: 15.2,
    vehicle: 'Refrigerated Transit 250', vehicleNote: 'Diesel · 15.2 MPG · Max weight 3,100 lb · Max volume 380 cu ft',
    driver: 'Quinn', items: 28, weight: 1740, volume: 218, enteredRevenue: 520, calculatedRevenue: 548,
    goodsCost: 126, otherCost: 24,
  },
  {
    id: 'OC-002', product: 'Dairy', farm: 'Netarts Bay Creamery', customer: 'Lincoln City Market',
    origin: 'Tillamook, OR', destination: 'Lincoln City, OR', tripsPerMonth: 9, distanceMiles: 94.2,
    driveMinutes: 119, loadMinutes: 36, unloadMinutes: 28, fuelPrice: 3.72, mpg: 14.6,
    vehicle: 'Ram ProMaster Refrigerated', vehicleNote: 'Gas · 14.6 MPG · Max weight 2,700 lb · Max volume 440 cu ft',
    driver: 'Morgan', items: 20, weight: 1320, volume: 186, enteredRevenue: 390, calculatedRevenue: 225,
    goodsCost: 116, otherCost: 19,
  },
  {
    id: 'OC-003', product: 'Oysters', farm: 'Yaquina Bay Shellfish', customer: 'Portland Fresh Exchange',
    origin: 'Newport, OR', destination: 'Portland, OR', tripsPerMonth: 6, distanceMiles: 232.8,
    driveMinutes: 238, loadMinutes: 50, unloadMinutes: 40, fuelPrice: 3.61, mpg: 15.8,
    vehicle: 'Isuzu NPR Refrigerated', vehicleNote: 'Diesel · 15.8 MPG · Max weight 5,800 lb · Max volume 690 cu ft',
    driver: 'Reese', items: 34, weight: 2860, volume: 342, enteredRevenue: 780, calculatedRevenue: 812,
    goodsCost: 302, otherCost: 42,
  },
  {
    id: 'OC-004', product: 'Crab', farm: 'South Slough Seafood', customer: 'Rogue Valley Grocers',
    origin: 'Coos Bay, OR', destination: 'Medford, OR', tripsPerMonth: 3, distanceMiles: 316.2,
    driveMinutes: 302, loadMinutes: 58, unloadMinutes: 44, fuelPrice: 3.77, mpg: 13.9,
    vehicle: 'Freightliner M2 Reefer', vehicleNote: 'Diesel · 13.9 MPG · Max weight 9,000 lb · Max volume 1,050 cu ft',
    driver: 'Drew', items: 42, weight: 3900, volume: 488, enteredRevenue: 1120, calculatedRevenue: 1035,
    goodsCost: 460, otherCost: 88,
  },
  {
    id: 'OC-005', product: 'Hazelnuts', farm: 'Neskowin Ridge Farm', customer: 'Salem Food Collective',
    origin: 'Neskowin, OR', destination: 'Salem, OR', tripsPerMonth: 5, distanceMiles: 166.8,
    driveMinutes: 177, loadMinutes: 32, unloadMinutes: 25, fuelPrice: 3.59, mpg: 17.1,
    vehicle: 'Ford Transit 350', vehicleNote: 'Gas · 17.1 MPG · Max weight 3,500 lb · Max volume 460 cu ft',
    driver: 'Sam', items: 16, weight: 980, volume: 125, enteredRevenue: 420, calculatedRevenue: 398,
    goodsCost: 88, otherCost: 15,
  },
])

const centralOregonRoutes = buildWorkspaceRoutes(centralOregonId, [
  {
    id: 'CO-001', product: 'Wheat', farm: 'High Desert Grain', customer: 'Willamette Milling Co.',
    origin: 'Bend, OR', destination: 'Salem, OR', tripsPerMonth: 8, distanceMiles: 322.6,
    driveMinutes: 294, loadMinutes: 65, unloadMinutes: 45, fuelPrice: 3.64, mpg: 12.8,
    vehicle: 'Kenworth T680', vehicleNote: 'Diesel · 12.8 MPG · Max weight 24,000 lb · Max volume 2,200 cu ft',
    driver: 'Alex', items: 1, weight: 17200, volume: 1450, enteredRevenue: 1450, calculatedRevenue: 1510,
    goodsCost: 575, otherCost: 105,
  },
  {
    id: 'CO-002', product: 'Potatoes', farm: 'Three Sisters Produce', customer: 'Eastside Portland Market',
    origin: 'Redmond, OR', destination: 'Portland, OR', tripsPerMonth: 10, distanceMiles: 296.4,
    driveMinutes: 275, loadMinutes: 54, unloadMinutes: 38, fuelPrice: 3.67, mpg: 15.1,
    vehicle: 'Freightliner M2', vehicleNote: 'Diesel · 15.1 MPG · Max weight 10,000 lb · Max volume 1,150 cu ft',
    driver: 'Jamie', items: 48, weight: 6400, volume: 790, enteredRevenue: 940, calculatedRevenue: 905,
    goodsCost: 348, otherCost: 56,
  },
  {
    id: 'CO-003', product: 'Cattle', farm: 'Juniper Basin Ranch', customer: 'Central Oregon Livestock Exchange',
    origin: 'Prineville, OR', destination: 'Madras, OR', tripsPerMonth: 4, distanceMiles: 82.6,
    driveMinutes: 96, loadMinutes: 72, unloadMinutes: 48, fuelPrice: 3.81, mpg: 8.9,
    vehicle: 'Peterbilt Stock Hauler', vehicleNote: 'Diesel · 8.9 MPG · Max weight 20,000 lb · Livestock trailer',
    driver: 'Chris', items: 18, weight: 11200, volume: 0, enteredRevenue: 1180, calculatedRevenue: 1095,
    goodsCost: 395, otherCost: 72,
  },
  {
    id: 'CO-004', product: 'Apples', farm: 'Rogue Foothill Orchards', customer: 'Umpqua Valley Produce',
    origin: 'Medford, OR', destination: 'Roseburg, OR', tripsPerMonth: 7, distanceMiles: 178.4,
    driveMinutes: 188, loadMinutes: 46, unloadMinutes: 34, fuelPrice: 3.73, mpg: 16.4,
    vehicle: 'Refrigerated Transit 350', vehicleNote: 'Gas · 16.4 MPG · Max weight 3,400 lb · Max volume 440 cu ft',
    driver: 'Robin', items: 39, weight: 2460, volume: 318, enteredRevenue: 695, calculatedRevenue: 398,
    goodsCost: 228, otherCost: 36,
  },
  {
    id: 'CO-005', product: 'Carrots', farm: 'Pine Mountain Roots', customer: 'Klamath Basin Food Hub',
    origin: 'La Pine, OR', destination: 'Klamath Falls, OR', tripsPerMonth: 5, distanceMiles: 142.8,
    driveMinutes: 163, loadMinutes: 40, unloadMinutes: 32, fuelPrice: 3.69, mpg: 15.7,
    vehicle: 'Chevrolet Express 3500', vehicleNote: 'Gas · 15.7 MPG · Max weight 3,200 lb · Max volume 420 cu ft',
    driver: 'Lee', items: 25, weight: 1610, volume: 190, enteredRevenue: 470, calculatedRevenue: 432,
    goodsCost: 155, otherCost: 23,
  },
])

export const demoWorkspaces: DemoWorkspace[] = [
  {
    id: 'willamette-valley',
    name: 'Willamette Valley',
    region: 'Western Oregon',
    routes: willametteValleyRoutes.map((route, index) => ({
      ...route,
      workspaceId: 'willamette-valley',
      createdAt: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
    })),
  },
  {
    id: oregonCoastId,
    name: 'Oregon Coast',
    region: 'Coastal Oregon',
    routes: oregonCoastRoutes,
  },
  {
    id: centralOregonId,
    name: 'Central Oregon',
    region: 'Central and Southern Oregon',
    routes: centralOregonRoutes,
  },
]