import React, { useState, useEffect } from 'react';

// Définir les types pour la clarté
interface Category {
  id: number;
  name: string;
}

interface Product {
  id?: number;
  name: string;
  description: string;
  category_id: number;
  price_eur: number;
  price_usd: number;
  price_cdf: number;
  stock_quantity: number;
  images: string[];
  is_active?: boolean;
}

interface ProductFormProps {
  productToEdit?: Product | null;
  onFormSubmit: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ productToEdit, onFormSubmit, onCancel }) => {
  const [product, setProduct] = useState<Product>({
    name: '',
    description: '',
    category_id: 0,
    price_eur: 0,
    price_usd: 0,
    price_cdf: 0,
    stock_quantity: 0,
    images: [],
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState('');

  useEffect(() => {
    // Charger les catégories pour le menu déroulant
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError('Impossible de charger les catégories.');
      }
    };

    fetchCategories();

    // Si on édite un produit, pré-remplir le formulaire
    if (productToEdit) {
      setProduct(productToEdit);
      setImageUrls(productToEdit.images.join(', '));
    }
  }, [productToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrls(e.target.value);
    setProduct(prev => ({ ...prev, images: e.target.value.split(',').map(url => url.trim()) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const method = productToEdit ? 'PUT' : 'POST';
    const url = productToEdit
      ? `http://localhost:3001/api/admin/products/${productToEdit.id}`
      : 'http://localhost:3001/api/admin/products';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error(productToEdit ? 'Erreur lors de la mise à jour du produit.' : 'Erreur lors de la création du produit.');
      }

      onFormSubmit(); // Rafraîchir la liste des produits
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{productToEdit ? 'Modifier le Produit' : 'Ajouter un Produit'}</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom du produit */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom du produit</label>
              <input type="text" name="name" id="name" value={product.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>

            {/* Catégorie */}
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Catégorie</label>
              <select name="category_id" id="category_id" value={product.category_id} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                <option value={0} disabled>Sélectionner une catégorie</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" id="description" value={product.description} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
          </div>

          {/* Prix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <label htmlFor="price_eur" className="block text-sm font-medium text-gray-700">Prix (EUR)</label>
              <input type="number" name="price_eur" id="price_eur" value={product.price_eur} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="price_usd" className="block text-sm font-medium text-gray-700">Prix (USD)</label>
              <input type="number" name="price_usd" id="price_usd" value={product.price_usd} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="price_cdf" className="block text-sm font-medium text-gray-700">Prix (CDF)</label>
              <input type="number" name="price_cdf" id="price_cdf" value={product.price_cdf} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>

          {/* Stock */}
          <div className="mt-6">
            <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700">Quantité en stock</label>
            <input type="number" name="stock_quantity" id="stock_quantity" value={product.stock_quantity} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>

          {/* Images */}
          <div className="mt-6">
            <label htmlFor="images" className="block text-sm font-medium text-gray-700">URLs des images (séparées par une virgule)</label>
            <input type="text" name="images" id="images" value={imageUrls} onChange={handleImageChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
