import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";

export const AdminProducts = () => {
  const { t } = useTranslation();
  const { data: products, isLoading, refetch } = useProducts();
  const { data: categories } = useCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image_url: "",
    // Champs de promotion
    sale_price: "",
    sale_start_date: "",
    sale_end_date: "",
    bulk_discount_threshold: "",
    bulk_discount_percentage: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category_id: "",
      image_url: "",
      // Champs de promotion
      sale_price: "",
      sale_start_date: "",
      sale_end_date: "",
      bulk_discount_threshold: "",
      bulk_discount_percentage: "",
      is_active: true,
    });
    setEditingProduct(null);
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        category_id: formData.category_id || null,
        price_eur: parseFloat(formData.price),
        price_usd: parseFloat(formData.price) * 0.85, // Simple conversion, adjust as needed
        price_cdf: parseFloat(formData.price) * 2800, // Simple conversion
        // Champs de promotion
        sale_price_eur: formData.sale_price ? parseFloat(formData.sale_price) : null,
        sale_price_usd: formData.sale_price ? parseFloat(formData.sale_price) * 0.85 : null,
        sale_price_cdf: formData.sale_price ? parseFloat(formData.sale_price) * 2800 : null,
        sale_start_date: formData.sale_start_date || null,
        sale_end_date: formData.sale_end_date || null,
        // Champs de réduction par quantité
        bulk_discount_threshold: formData.bulk_discount_threshold ? parseInt(formData.bulk_discount_threshold) : null,
        bulk_discount_percentage: formData.bulk_discount_percentage ? parseFloat(formData.bulk_discount_percentage) : null,
        stock_quantity: parseInt(formData.stock),
        images: formData.image_url ? [formData.image_url] : null,
        is_active: formData.is_active,
      };

      const url = editingProduct
        ? `http://localhost:3001/api/admin/products/${editingProduct.id}`
        : 'http://localhost:3001/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error('Failed to save product');

      toast.success(editingProduct ? t("admin.products.updated") : t("admin.products.created"));
      setIsDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(t("admin.products.error"));
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price_eur.toString(),
      stock: product.stock_quantity.toString(),
      category_id: product.category_id || "",
      image_url: product.images ? product.images[0] : "",
      // Champs de promotion
      sale_price: product.sale_price_eur ? product.sale_price_eur.toString() : "",
      sale_start_date: product.sale_start_date ? new Date(product.sale_start_date).toISOString().split('T')[0] : "",
      sale_end_date: product.sale_end_date ? new Date(product.sale_end_date).toISOString().split('T')[0] : "",
      bulk_discount_threshold: product.bulk_discount_threshold ? product.bulk_discount_threshold.toString() : "",
      bulk_discount_percentage: product.bulk_discount_percentage ? product.bulk_discount_percentage.toString() : "",
      is_active: product.is_active,
    });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.products.confirmDelete"))) return;

    try {
      const response = await fetch(`http://localhost:3001/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      toast.success(t("admin.products.deleted"));
      refetch();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(t("admin.products.error"));
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">{t("common.loading")}</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("admin.products.title")}</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("admin.products.add")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? t("admin.products.edit") : t("admin.products.add")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">{t("admin.products.name")}</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="description">{t("admin.products.description")}</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">{t("admin.products.price")}</Label>
                  <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="stock">{t("admin.products.stock")}</Label>
                  <Input id="stock" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
                </div>
              </div>
              <div>
                <Label htmlFor="category">{t("admin.products.category")}</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("admin.products.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Section Promotions */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">Promotions et Réductions</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sale_price">Prix promotionnel (EUR)</Label>
                    <Input
                      id="sale_price"
                      type="number"
                      step="0.01"
                      value={formData.sale_price}
                      onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                      placeholder="Ex: 45.99"
                    />
                    <p className="text-sm text-gray-500 mt-1">Laissez vide pour pas de promotion</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="sale_start_date">Début promo</Label>
                      <Input
                        id="sale_start_date"
                        type="date"
                        value={formData.sale_start_date}
                        onChange={(e) => setFormData({ ...formData, sale_start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sale_end_date">Fin promo</Label>
                      <Input
                        id="sale_end_date"
                        type="date"
                        value={formData.sale_end_date}
                        onChange={(e) => setFormData({ ...formData, sale_end_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="bulk_discount_threshold">Seuil réduction quantité</Label>
                    <Input
                      id="bulk_discount_threshold"
                      type="number"
                      min="2"
                      value={formData.bulk_discount_threshold}
                      onChange={(e) => setFormData({ ...formData, bulk_discount_threshold: e.target.value })}
                      placeholder="Ex: 3"
                    />
                    <p className="text-sm text-gray-500 mt-1">Nombre d'articles minimum</p>
                  </div>

                  <div>
                    <Label htmlFor="bulk_discount_percentage">Réduction quantité (%)</Label>
                    <Input
                      id="bulk_discount_percentage"
                      type="number"
                      min="1"
                      max="50"
                      value={formData.bulk_discount_percentage}
                      onChange={(e) => setFormData({ ...formData, bulk_discount_percentage: e.target.value })}
                      placeholder="Ex: 10"
                    />
                    <p className="text-sm text-gray-500 mt-1">Pourcentage de réduction</p>
                  </div>
                </div>
              </div>

              {/* Image Upload Field - Temporarily disabled */}
              {/* <div>
                <Label htmlFor="imageFile">{t("admin.products.imageFile")}</Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  disabled={uploading}
                />
              </div> */}

              {/* Image Preview */}
              {formData.image_url && (
                <div className="my-4">
                  <Label>{t("admin.products.preview")}</Label>
                  <div className="mt-2 w-32 h-32 border rounded-md flex items-center justify-center overflow-hidden">
                    <img
                      src={formData.image_url}
                      alt={t("admin.products.preview")}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch id="active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                <Label htmlFor="active">{t("admin.products.active")}</Label>
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("admin.products.uploading")}</>
                ) : editingProduct ? (
                  t("common.update")
                ) : (
                  t("common.create")
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.products.imageHeader")}</TableHead>
              <TableHead>{t("admin.products.name")}</TableHead>
              <TableHead>{t("admin.products.price")}</TableHead>
              <TableHead>{t("admin.products.stock")}</TableHead>
              <TableHead>{t("admin.products.active")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.images && product.images[0] && <img src={product.images[0]} alt={product.name} className="h-10 w-10 object-cover rounded-md" />}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>€{product.price_eur}</TableCell>
                <TableCell>{product.stock_quantity}</TableCell>
                <TableCell>{product.is_active ? "✓" : "✗"}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};