import { Grid, List, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface SortBarProps {
  totalProducts: number;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onSortChange?: (sortBy: string) => void;
}

const SortBar = ({ 
  totalProducts, 
  viewMode = 'grid', 
  onViewModeChange,
  onSortChange 
}: SortBarProps) => {
  const [sortBy, setSortBy] = useState('popularity');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const sortOptions = [
    { value: 'popularity', label: 'Popularité' },
    { value: 'price-low', label: 'Prix: Croissant' },
    { value: 'price-high', label: 'Prix: Décroissant' },
    { value: 'newest', label: 'Plus Récents' },
    { value: 'rating', label: 'Meilleures Notes' }
  ];

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setShowSortDropdown(false);
    onSortChange?.(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Products Count */}
        <div className="text-gray-600">
          <span className="font-semibold text-gray-900">{totalProducts}</span> produits trouvés
        </div>

        {/* Right Side: Sort & View Mode */}
        <div className="flex items-center gap-4">
          
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors bg-white"
            >
              <span className="text-sm text-gray-700">
                Trier par: <span className="font-medium">
                  {sortOptions.find(opt => opt.value === sortBy)?.label}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showSortDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        sortBy === option.value
                          ? 'bg-gold/10 text-gold font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                      {sortBy === option.value && (
                        <span className="float-right">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange?.('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-gold text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Vue grille"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange?.('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-gold text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Vue liste"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortBar;
