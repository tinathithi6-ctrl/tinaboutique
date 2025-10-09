import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface FilterSidebarProps {
  onFilterChange?: (filters: any) => void;
}

const FilterSidebar = ({ onFilterChange }: FilterSidebarProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState('');

  const categories = [
    {
      id: 'clothing',
      name: 'Vêtements',
      subcategories: ['Mode Femme', 'Mode Homme', 'Mode Enfants', 'Accessoires']
    },
    {
      id: 'shoes',
      name: 'Chaussures',
      subcategories: ['Talons', 'Bottes', 'Sandales', 'Baskets']
    },
    {
      id: 'accessories',
      name: 'Accessoires',
      subcategories: ['Sacs', 'Bijoux', 'Ceintures', 'Écharpes']
    },
    {
      id: 'beauty',
      name: 'Beauté',
      subcategories: ['Soins de la peau', 'Maquillage', 'Parfums', 'Soins cheveux']
    }
  ];

  const colors = [
    { name: 'Noir', value: 'black', hex: '#000000' },
    { name: 'Blanc', value: 'white', hex: '#ffffff' },
    { name: 'Rouge', value: 'red', hex: '#e74c3c' },
    { name: 'Bleu', value: 'blue', hex: '#3498db' },
    { name: 'Vert', value: 'green', hex: '#2ecc71' },
    { name: 'Jaune', value: 'yellow', hex: '#f1c40f' },
    { name: 'Violet', value: 'purple', hex: '#9b59b6' },
    { name: 'Orange', value: 'orange', hex: '#e67e22' },
    { name: 'Rose', value: 'pink', hex: '#fd79a8' },
    { name: 'Marron', value: 'brown', hex: '#795548' }
  ];

  const brands = [
    { name: 'Nike', count: 24 },
    { name: 'Adidas', count: 18 },
    { name: 'Zara', count: 32 },
    { name: 'H&M', count: 28 },
    { name: 'Gucci', count: 12 },
    { name: 'Prada', count: 15 }
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Catégories</h3>
        <ul className="space-y-2">
          {categories.map(category => (
            <li key={category.id}>
              <div
                className="flex items-center justify-between cursor-pointer py-2 hover:text-gold transition-colors"
                onClick={() => toggleCategory(category.id)}
              >
                <span className="font-medium text-gray-700">{category.name}</span>
                {expandedCategories.includes(category.id) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
              {expandedCategories.includes(category.id) && (
                <ul className="ml-4 mt-2 space-y-2">
                  {category.subcategories.map(sub => (
                    <li key={sub}>
                      <a
                        href="#"
                        className="text-sm text-gray-600 hover:text-gold transition-colors"
                      >
                        {sub}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Fourchette de Prix</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{priceRange.min}€</span>
            <span>{priceRange.max}€</span>
          </div>
          
          <input
            type="range"
            min="0"
            max="1000"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Min</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Max</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          <button className="w-full py-2 bg-gold text-white rounded-lg font-semibold hover:bg-gold/90 transition-colors">
            Appliquer le Filtre
          </button>
        </div>
      </div>

      {/* Colors */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Filtrer par Couleur</h3>
        <div className="grid grid-cols-5 gap-3">
          {colors.map(color => (
            <button
              key={color.value}
              onClick={() => toggleColor(color.value)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                selectedColors.includes(color.value)
                  ? 'border-gold scale-110'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {color.value === 'white' && (
                <div className="w-full h-full rounded-full border border-gray-200" />
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setSelectedColors([])}
            className="flex-1 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Effacer
          </button>
          <button className="flex-1 py-2 text-sm bg-gold text-white rounded-lg hover:bg-gold/90 transition-colors">
            Appliquer
          </button>
        </div>
      </div>

      {/* Brands */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Filtrer par Marque</h3>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher des marques..."
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
        </div>

        {/* Brand List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredBrands.map(brand => (
            <label
              key={brand.name}
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.name)}
                  onChange={() => toggleBrand(brand.name)}
                  className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold"
                />
                <span className="text-sm text-gray-700">{brand.name}</span>
              </div>
              <span className="text-xs text-gray-500">({brand.count})</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
