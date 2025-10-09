# 📋 Plan de Migration - Boutique Tina NYC Style

## ✅ Ce qui a été fait

### 1. Préparation du Projet
- ✅ Projet cloné depuis GitHub
- ✅ Dépendances installées (`npm install`)
- ✅ Dépendances supplémentaires installées : `swiper`, `aos`, `react-toastify`
- ✅ 57 images copiées dans `public/assets/img/`

### 2. Composants Créés
- ✅ `TopBar.tsx` - Barre supérieure avec annonces et sélecteurs

---

## 📝 Composants à Copier

### Depuis `tinas-nyc-style-main/src/components/`

#### Layout Components
1. **Header.bootstrap-style.tsx** → `boutique/HeaderBootstrapStyle.tsx`
   - Header principal avec recherche et navigation

#### Home Components
2. **home/HeroSection.tsx** → `boutique/HeroSection.tsx`
   - Section héro avec animations AOS

3. **home/PromoCards.tsx** → `boutique/PromoCards.tsx`
   - Cartes promotionnelles (4 catégories)

4. **home/FeaturedProducts.tsx** → `boutique/FeaturedProducts.tsx`
   - Grille de produits vedettes

5. **home/Newsletter.tsx** → `boutique/Newsletter.tsx`
   - Section newsletter avec toast

#### Category Components
6. **category/FilterSidebar.tsx** → `boutique/FilterSidebar.tsx`
   - Sidebar avec filtres (catégories, prix, couleurs, marques)

7. **category/SortBar.tsx** → `boutique/SortBar.tsx`
   - Barre de tri et vue grille/liste

8. **category/ProductGrid.tsx** → `boutique/ProductGrid.tsx`
   - Grille de produits avec mode liste

9. **category/Pagination.tsx** → `boutique/Pagination.tsx`
   - Pagination avec numéros de pages

#### Other Components
10. **Features.nyc.tsx** → `boutique/Features.tsx`
11. **Testimonials.nyc.tsx** → `boutique/Testimonials.tsx`
12. **Footer.nyc.tsx** → `boutique/Footer.tsx`

---

## 🎯 Pages à Créer

### 1. Page Boutique Principale
**Fichier:** `src/pages/Boutique.tsx`

```tsx
import TopBar from "@/components/boutique/TopBar";
import HeaderBootstrapStyle from "@/components/boutique/HeaderBootstrapStyle";
import HeroSection from "@/components/boutique/HeroSection";
import PromoCards from "@/components/boutique/PromoCards";
import FeaturedProducts from "@/components/boutique/FeaturedProducts";
import Features from "@/components/boutique/Features";
import Testimonials from "@/components/boutique/Testimonials";
import Newsletter from "@/components/boutique/Newsletter";
import Footer from "@/components/boutique/Footer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Boutique = () => {
  return (
    <div className="min-h-screen">
      <TopBar />
      <HeaderBootstrapStyle />
      <main>
        <HeroSection />
        <PromoCards />
        <FeaturedProducts />
        <Features />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Boutique;
```

### 2. Page Catégorie
**Fichier:** `src/pages/Category.tsx`

```tsx
import TopBar from "@/components/boutique/TopBar";
import HeaderBootstrapStyle from "@/components/boutique/HeaderBootstrapStyle";
import FilterSidebar from "@/components/boutique/FilterSidebar";
import SortBar from "@/components/boutique/SortBar";
import ProductGrid from "@/components/boutique/ProductGrid";
import Pagination from "@/components/boutique/Pagination";
import Footer from "@/components/boutique/Footer";
import { useState } from 'react';

const Category = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Données de produits (à remplacer par vos vraies données)
  const products = [
    // ... vos produits
  ];

  return (
    <div className="min-h-screen">
      <TopBar />
      <HeaderBootstrapStyle />
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <nav className="text-sm">
            <a href="/" className="text-gray-600 hover:text-gold">Accueil</a>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Catégorie</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <SortBar
              totalProducts={products.length}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            <ProductGrid products={products} viewMode={viewMode} />
            <Pagination
              currentPage={currentPage}
              totalPages={10}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Category;
```

---

## 🔧 Modifications à Apporter

### 1. Ajouter les Routes dans `App.tsx`

```tsx
import Boutique from "./pages/Boutique";
import Category from "./pages/Category";

// Dans le <Routes>
<Route path="/boutique" element={<Boutique />} />
<Route path="/category" element={<Category />} />
```

### 2. Ajouter la couleur `gold` dans `tailwind.config.ts`

```typescript
colors: {
  gold: '#d4af37',
  // ... autres couleurs
}
```

### 3. Importer les CSS nécessaires dans `index.css`

```css
@import 'aos/dist/aos.css';
@import 'swiper/css';
@import 'react-toastify/dist/ReactToastify.css';
```

---

## 🚀 Commandes Utiles

```bash
# Démarrer le serveur de développement
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview
```

---

## 📌 Notes Importantes

1. **Page Index Préservée** : La page d'accueil actuelle (`/`) reste intacte
2. **Nouvelle Route** : Le nouveau design est accessible via `/boutique`
3. **Images** : Toutes les images sont dans `public/assets/img/`
4. **Composants** : Tous les composants sont dans `src/components/boutique/`

---

## ✨ Prochaines Étapes

1. Copier tous les composants listés ci-dessus
2. Créer les pages `Boutique.tsx` et `Category.tsx`
3. Ajouter les routes dans `App.tsx`
4. Configurer Tailwind pour la couleur `gold`
5. Tester l'application avec `npm run dev`
