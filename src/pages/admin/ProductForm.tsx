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
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'existing'>('upload');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [selectedExistingImages, setSelectedExistingImages] = useState<string[]>([]);

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
      setSelectedExistingImages(productToEdit.images);
    }
  }, [productToEdit]);

  // Charger les images existantes quand la catégorie change
  useEffect(() => {
    if (product.category_id && product.category_id > 0) {
      const fetchExistingImages = async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/admin/images/${product.category_id}`);
          const data = await response.json();
          setExistingImages(data.images || []);
        } catch (err) {
          console.error('Erreur lors du chargement des images existantes:', err);
        }
      };
      fetchExistingImages();
    }
  }, [product.category_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrls(e.target.value);
    setProduct(prev => ({ ...prev, images: e.target.value.split(',').map(url => url.trim()) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleExistingImageToggle = (imageUrl: string) => {
    setSelectedExistingImages(prev => {
      const newSelection = prev.includes(imageUrl)
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl];
      setProduct(prevProduct => ({ ...prevProduct, images: newSelection }));
      return newSelection;
    });
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    const response = await fetch('http://localhost:3001/api/admin/upload-images', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'upload des images');
    }

    const data = await response.json();
    return data.images.map((img: any) => img.url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let finalImages = product.images;

      // Si on utilise l'upload de fichiers, uploader d'abord les fichiers
      if (uploadMethod === 'upload' && selectedFiles.length > 0) {
        const uploadedUrls = await uploadFiles();
        finalImages = uploadedUrls;
      } else if (uploadMethod === 'existing') {
        finalImages = selectedExistingImages;
      }

      const productData = {
        ...product,
        images: finalImages,
      };

      const method = productToEdit ? 'PUT' : 'POST';
      const url = productToEdit
        ? `http://localhost:3001/api/admin/products/${productToEdit.id}`
        : 'http://localhost:3001/api/admin/products';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
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
            <label className="block text-sm font-medium text-gray-700 mb-3">Images du produit</label>

            {/* Sélecteur de méthode d'upload */}
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="upload"
                  checked={uploadMethod === 'upload'}
                  onChange={() => setUploadMethod('upload')}
                  className="mr-2"
                />
                Télécharger de nouveaux fichiers
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="existing"
                  checked={uploadMethod === 'existing'}
                  onChange={() => setUploadMethod('existing')}
                  className="mr-2"
                />
                Utiliser des images existantes
              </label>
            </div>

            {/* Upload de fichiers */}
            {uploadMethod === 'upload' && (
              <div>
                <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner des images (max 10 fichiers, 5MB chacun)
                </label>
                <input
                  type="file"
                  id="fileUpload"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {selectedFiles.length} fichier(s) sélectionné(s)
                  </div>
                )}
              </div>
            )}

            {/* Sélection d'images existantes */}
            {uploadMethod === 'existing' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images disponibles pour cette catégorie
                </label>
                {existingImages.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4 max-h-48 overflow-y-auto border rounded p-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={`http://localhost:3001${image.url}`}
                          alt={`Image ${index + 1}`}
                          className={`w-full h-20 object-cover rounded cursor-pointer border-2 ${
                            selectedExistingImages.includes(image.url) ? 'border-blue-500' : 'border-gray-300'
                          }`}
                          onClick={() => handleExistingImageToggle(image.url)}
                        />
                        {selectedExistingImages.includes(image.url) && (
                          <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            ✓
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Aucune image disponible pour cette catégorie.</p>
                )}
                <div className="mt-2">
                  <label htmlFor="manualUrls" className="block text-sm font-medium text-gray-700 mb-1">
                    Ou saisir des URLs manuellement (séparées par une virgule)
                  </label>
                  <input
                    type="text"
                    id="manualUrls"
                    value={imageUrls}
                    onChange={handleImageChange}
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
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
