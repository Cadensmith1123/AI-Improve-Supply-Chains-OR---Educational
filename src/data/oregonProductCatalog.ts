export interface OregonProductOption {
  id: string
  name: string
  defaultUnit: string
  units: string[]
  suggestedUnitCost: number
}

export interface OregonProductCategory {
  id: string
  name: string
  handlingOptions: string[]
  defaultHandling: string
  packagingOptions: string[]
  products: OregonProductOption[]
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function makeCategory(
  id: string,
  name: string,
  productNames: string[],
  units: string[],
  baseUnitCost: number,
  defaultHandling: string,
  packagingOptions: string[],
): OregonProductCategory {
  return {
    id,
    name,
    defaultHandling,
    handlingOptions: ['Chilled / refrigerated', 'Frozen', 'Dry / ambient', 'Protected plant material', 'Live animal ventilation', 'Custom instructions'],
    packagingOptions,
    products: productNames.map((productName, index) => ({
      id: `${id}-${slug(productName)}`,
      name: productName,
      defaultUnit: units[index % units.length],
      units,
      suggestedUnitCost: Math.round((baseUnitCost * (1 + ((index % 5) - 2) * 0.08)) * 100) / 100,
    })),
  }
}

export const oregonProductCategories: OregonProductCategory[] = [
  makeCategory(
    'berries-small-fruit',
    'Berries & small fruit',
    ['Strawberries', 'Blueberries', 'Raspberries', 'Blackberries', 'Marionberries', 'Boysenberries', 'Cranberries', 'Kiwiberries', 'Fuzzy kiwifruit', 'Table grapes'],
    ['lb', 'flat', 'crate', 'case'],
    2.4,
    'Chilled / refrigerated',
    ['Clamshell case', 'Berry flat', 'Reusable crate', 'Bulk bin', 'Other'],
  ),
  makeCategory(
    'tree-fruit',
    'Tree fruit & orchard crops',
    ['Apples', 'Pears', 'Sweet cherries', 'Peaches', 'Nectarines', 'Plums', 'Prunes', 'Apricots', 'Persimmons', 'Quince'],
    ['lb', 'box', 'crate', 'bin'],
    1.15,
    'Chilled / refrigerated',
    ['Produce box', 'Reusable crate', 'Orchard bin', 'Palletized cartons', 'Other'],
  ),
  makeCategory(
    'vegetables-specialty-seeds',
    'Vegetables & specialty seeds',
    ['Potatoes', 'Sweet corn', 'Snap beans', 'Green peas', 'Squash', 'Pumpkins', 'Carrots', 'Onions', 'Beets', 'Cabbage', 'Broccoli', 'Cauliflower', 'Lettuce', 'Spinach', 'Kale', 'Cucumbers', 'Tomatoes', 'Bell peppers', 'Garlic', 'Asparagus', 'Dry beans', 'Specialty seed'],
    ['lb', 'case', 'crate', 'sack'],
    1.05,
    'Chilled / refrigerated',
    ['Produce case', 'Reusable crate', 'Sack', 'Bulk bin', 'Palletized cartons', 'Other'],
  ),
  makeCategory(
    'nuts',
    'Nuts',
    ['Hazelnuts', 'Walnuts', 'Chestnuts', 'Other tree nuts'],
    ['lb', 'sack', 'bin', 'ton'],
    2.1,
    'Dry / ambient',
    ['Sack', 'Tote', 'Bulk bin', 'Palletized cartons', 'Other'],
  ),
  makeCategory(
    'field-grain-forage',
    'Field crops, grains & forage',
    ['Winter wheat', 'Spring wheat', 'Barley', 'Oats', 'Grain corn', 'Alfalfa hay', 'Grass hay', 'Grass seed', 'Clover seed', 'Meadowfoam seed', 'Quinoa', 'Flax', 'Rye', 'Silage'],
    ['lb', 'bushel', 'bale', 'ton', 'sack'],
    0.38,
    'Dry / ambient',
    ['Bulk', 'Sack', 'Bale', 'Tote', 'Grain trailer', 'Other'],
  ),
  makeCategory(
    'wine-grapes-hops',
    'Wine grapes & hops',
    ['Pinot noir grapes', 'Pinot gris grapes', 'Chardonnay grapes', 'Other wine grapes', 'Hops', 'Hop bines'],
    ['lb', 'lug', 'bin', 'bale'],
    1.8,
    'Temperature controlled',
    ['Harvest lug', 'Ventilated bin', 'Bale', 'Bulk', 'Other'],
  ),
  makeCategory(
    'nursery-greenhouse',
    'Nursery, greenhouse & floriculture',
    ['Nursery trees', 'Nursery shrubs', 'Conifer seedlings', 'Vegetable starts', 'Bedding plants', 'Potted flowering plants', 'Foliage plants', 'Cut flowers', 'Bulbs', 'Christmas trees', 'Greenhouse ornamentals'],
    ['plant', 'flat', 'tray', 'cart', 'pallet'],
    4.5,
    'Protected plant material',
    ['Plant tray', 'Rack/cart', 'Sleeved bunches', 'Pallet', 'Other'],
  ),
  makeCategory(
    'livestock',
    'Livestock & live animals',
    ['Beef cattle', 'Dairy cattle', 'Feeder calves', 'Sheep', 'Lambs', 'Meat goats', 'Dairy goats', 'Pigs', 'Poultry', 'Other livestock'],
    ['head', 'animal', 'load'],
    325,
    'Live animal ventilation',
    ['Livestock trailer', 'Poultry crates', 'Ventilated trailer', 'Other'],
  ),
  makeCategory(
    'dairy-eggs-poultry',
    'Dairy, eggs & poultry products',
    ['Fluid milk', 'Cream', 'Cheese', 'Butter', 'Yogurt', 'Shell eggs', 'Poultry meat'],
    ['gallon', 'lb', 'dozen', 'case'],
    4.25,
    'Chilled / refrigerated',
    ['Insulated tote', 'Egg flat', 'Refrigerated case', 'Palletized cartons', 'Other'],
  ),
  makeCategory(
    'herbs-specialty',
    'Herbs & specialty crops',
    ['Peppermint', 'Spearmint', 'Mint oil', 'Culinary herbs', 'Lavender', 'Hemp fiber', 'Hemp seed', 'Mushrooms', 'Industrial hemp'],
    ['lb', 'oz', 'case', 'bale', 'drum'],
    3.1,
    'Dry / ambient',
    ['Food-grade case', 'Sack', 'Bale', 'Drum', 'Ventilated crate', 'Other'],
  ),
  makeCategory(
    'custom',
    'Other / custom agricultural product',
    ['Other agricultural product'],
    ['lb', 'kg', 'case', 'crate', 'pallet', 'ton', 'item'],
    1,
    'Custom instructions',
    ['Box', 'Crate', 'Pallet', 'Bulk', 'Other'],
  ),
]