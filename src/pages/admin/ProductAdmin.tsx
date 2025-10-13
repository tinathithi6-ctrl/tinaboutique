import React, { useState, useEffect } from 'react';
import apiFetch from '@/lib/api';
import ProductForm from './ProductForm'; // Importer le formulaire

// Définir le type pour un produit pour plus de clarté
interface Product {
  id: number;
  name: string;
  description: string;
  category_id: number;
  price_eur: number;
  price_usd: number;
  price_cdf: number;
  stock_quantity: number;
  images: string[];
  is_active: boolean;
  created_at: string;
}

const ProductAdmin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
  const data = await apiFetch('/api/products');
      setProducts(Array.isArray(data) ? data : []);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddNew = () => {
    setProductToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est réversible (le produit deviendra inactif).')) {
      try {
  await apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' } as any);
        setProducts(prev => prev.filter(p => p.id !== id));
        fetchProducts(); // Rafraîchir la liste
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      }
    }
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    fetchProducts(); // Rafraîchir la liste après ajout/modification
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
  };

  if (loading && products.length === 0) {
    return <div className="text-center p-8">Chargement des produits...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Erreur : {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {isFormOpen && (
        <ProductForm
          productToEdit={productToEdit}
          onFormSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Produits</h1>
        <button onClick={handleAddNew} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Ajouter un Produit
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Prix (EUR)
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-16 h-16">
                      <img
                        className="w-full h-full rounded-md object-cover"
                        src={product.images[0] || 'https://via.placeholder.com/150'}
                        alt={product.name}
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-900 whitespace-no-wrap font-semibold">{product.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{Number(product.price_eur || 0).toFixed(2)} €</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{product.stock_quantity}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span
                    className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      product.is_active ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-0 ${
                        product.is_active ? 'bg-green-200' : 'bg-red-200'
                      } opacity-50 rounded-full`}
                    ></span>
                    <span className="relative">{product.is_active ? 'Actif' : 'Inactif'}</span>
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                  <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900">Modifier</button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 ml-4">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductAdmin;
