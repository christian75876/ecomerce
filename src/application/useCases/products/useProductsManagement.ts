import { useCallback, useEffect, useState } from 'react';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';
import {
  ICreateProductRequest,
} from '@/application/dtos/products/request/ProductRequest';
import { IProduct, IProductImage, IProductVideo } from '@/application/dtos/products/response/ProductResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { IMenuCategory } from '@/application/dtos/menu-categories/response/MenuCategoryResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import { CategoriesRepository } from '@/infrastructure/repositories/api/categories/CategoriesRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { SuppliersRepository } from '@/infrastructure/repositories/api/suppliers/SuppliersRepository';
import { MenuCategoriesRepository } from '@/infrastructure/repositories/api/menu-categories/MenuCategoriesRepository';
import { useAdminStoreFilterContext } from '@/shared/context/AdminStoreFilterContext';
import { getAuthenticatedRole } from '@/shared/utils/checkIsUserAuthenticated.util';

export type ProductFormState = {
  name: string;
  description: string;
  sku: string;
  price: string;
  cost: string;
  compareAtPrice: string;
  categoryId: string;
  storeId: string;
  menuCategoryId: string;
  supplierId: string;
  initialStock: string;
  imageUrl: string;
  showStock: boolean;
  isPerishable: boolean;
  trackBatches: boolean;
  lowStockThreshold: string;
  initialExpiresAt: string;
};

export const initialProductFormState: ProductFormState = {
  name: '',
  description: '',
  sku: '',
  price: '',
  cost: '',
  compareAtPrice: '',
  categoryId: '',
  storeId: '',
  menuCategoryId: '',
  supplierId: '',
  initialStock: '',
  imageUrl: '',
  showStock: false,
  isPerishable: false,
  trackBatches: true,
  lowStockThreshold: '',
  initialExpiresAt: '',
};

export const useProductsManagement = () => {
  const { selectedStore, stores: contextStores } = useAdminStoreFilterContext();
  const isSeller = getAuthenticatedRole() === 'seller';
  const sellerStoreId = isSeller ? (selectedStore?.id ?? contextStores[0]?.id ?? '') : '';

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [stores, setStores] = useState<IStore[]>([]);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [menuCategories, setMenuCategories] = useState<IMenuCategory[]>([]);
  const [form, setForm] = useState<ProductFormState>(initialProductFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image upload state (separate from form since File can't go in ProductFormState)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Gallery state
  const [gallery, setGallery] = useState<IProductImage[]>([]);
  const [gallerySubmitting, setGallerySubmitting] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  // Videos state
  const [videos, setVideos] = useState<IProductVideo[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoSubmitting, setVideoSubmitting] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    const response = await CategoriesRepository.getCategories(true, sellerStoreId || undefined);
    setCategories(response.data);
  }, [sellerStoreId]);

  const loadStores = useCallback(async () => {
    const response = await StoresRepository.getStores({ active: true });
    setStores(response.data);
  }, []);

  const loadSuppliers = useCallback(async () => {
    const response = await SuppliersRepository.getSuppliers();
    setSuppliers(response.data.filter((supplier) => supplier.isActive));
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ProductRepository.getProducts({
        search: search || undefined,
        categoryId: selectedCategoryId || undefined,
      });
      setProducts(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar los productos',
      );
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategoryId]);

  const loadVideos = useCallback(async (productId: string) => {
    try {
      const response = await ProductRepository.getProductVideos(productId);
      setVideos(response.data);
    } catch {
      setVideos([]);
    }
  }, []);

  const loadGallery = useCallback(async (productId: string) => {
    try {
      const response = await ProductRepository.getProductGallery(productId);
      setGallery(response.data);
    } catch {
      setGallery([]);
    }
  }, []);

  // Auto-select seller's store when not editing
  useEffect(() => {
    if (isSeller && sellerStoreId) {
      setForm(f => (f.storeId ? f : { ...f, storeId: sellerStoreId }));
    }
  }, [isSeller, sellerStoreId]);

  useEffect(() => {
    void Promise.all([loadCategories(), loadStores(), loadSuppliers()]).catch((err: unknown) => {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar el módulo',
      );
      setLoading(false);
    });
  }, [loadCategories, loadStores, loadSuppliers]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const selectedStore = stores.find((s) => s.id === form.storeId);
    if (!selectedStore || selectedStore.storeType !== 'RESTAURANT') {
      setMenuCategories([]);
      return;
    }
    MenuCategoriesRepository.getByStore(form.storeId)
      .then((resp) => setMenuCategories(resp.data))
      .catch(() => setMenuCategories([]));
  }, [form.storeId, stores]);

  const updateForm = <K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const setImageFile = (file: File | null) => {
    setPendingImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const resetForm = () => {
    setForm({ ...initialProductFormState, storeId: sellerStoreId });
    setEditingId(null);
    setPendingImageFile(null);
    setImagePreview(null);
    setGallery([]);
    setGalleryError(null);
    setVideos([]);
    setVideoUrl('');
    setVideoTitle('');
    setVideoError(null);
  };

  const buildPayload = (currentForm: ProductFormState): ICreateProductRequest | null => {
    if (
      !currentForm.name.trim() ||
      !currentForm.price ||
      !currentForm.categoryId ||
      !currentForm.storeId
    ) {
      setError('Completa nombre, precio, categoría y tienda');
      return null;
    }

    if (Number(currentForm.price) < 0) {
      setError('El precio no puede ser negativo');
      return null;
    }

    if (currentForm.cost && Number(currentForm.cost) < 0) {
      setError('El costo no puede ser negativo');
      return null;
    }

    if (currentForm.initialStock && Number(currentForm.initialStock) < 0) {
      setError('El stock inicial no puede ser negativo');
      return null;
    }

    if (
      currentForm.isPerishable &&
      currentForm.initialStock &&
      Number(currentForm.initialStock) > 0 &&
      !currentForm.initialExpiresAt
    ) {
      setError('Los productos perecederos requieren vencimiento para el stock inicial');
      return null;
    }

    return {
      name: currentForm.name.trim(),
      description: currentForm.description.trim(),
      sku: currentForm.sku?.trim() || undefined,
      price: Number(currentForm.price),
      categoryId: currentForm.categoryId,
      storeId: currentForm.storeId,
      menuCategoryId: currentForm.menuCategoryId || undefined,
      supplierId: currentForm.supplierId || undefined,
      cost: currentForm.cost ? Number(currentForm.cost) : undefined,
      compareAtPrice: currentForm.compareAtPrice ? Number(currentForm.compareAtPrice) : undefined,
      initialStock: currentForm.initialStock
        ? Number(currentForm.initialStock)
        : undefined,
      imageUrl: currentForm.imageUrl.trim() || undefined,
      showStock: currentForm.showStock,
      isPerishable: currentForm.isPerishable,
      trackBatches: currentForm.trackBatches,
      lowStockThreshold: currentForm.lowStockThreshold ? Number(currentForm.lowStockThreshold) : undefined,
      initialExpiresAt: currentForm.initialExpiresAt || undefined,
      isActive: true,
    };
  };

  const submitForm = async () => {
    const payload = buildPayload(form);
    if (!payload) {
      return false;
    }

    setSubmitting(true);
    setError(null);

    try {
      let savedId: string;

      if (editingId) {
        const response = await ProductRepository.updateProduct(editingId, payload);
        savedId = response.data.id;
      } else {
        const response = await ProductRepository.createProduct(payload);
        savedId = response.data.id;
      }

      // Upload image file if user selected one
      if (pendingImageFile) {
        await ProductRepository.uploadProductImage(savedId, pendingImageFile);
      }

      resetForm();
      await loadProducts();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible guardar el producto',
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (product: IProduct) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      sku: product.sku ?? '',
      price: String(product.price),
      cost: product.cost ? String(product.cost) : '',
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
      categoryId: product.categoryId,
      storeId: product.storeId ?? '',
      menuCategoryId: product.menuCategoryId ?? '',
      supplierId: product.supplierId ?? '',
      initialStock: '',
      imageUrl: product.imageUrl ?? '',
      showStock: product.showStock,
      isPerishable: product.isPerishable,
      trackBatches: product.trackBatches,
      lowStockThreshold: product.lowStockThreshold != null ? String(product.lowStockThreshold) : '',
      initialExpiresAt: '',
    });
    setPendingImageFile(null);
    setImagePreview(product.imageUrl ?? null);
    setGalleryError(null);
    setVideoUrl('');
    setVideoTitle('');
    setVideoError(null);
    setError(null);
    void loadVideos(product.id);
    void loadGallery(product.id);
  };

  const toggleStatus = async (product: IProduct) => {
    setSubmitting(true);
    setError(null);

    try {
      await ProductRepository.updateStatus(product.id, !product.isActive);
      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible actualizar el estado del producto',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const uploadGalleryImages = async (files: File[]) => {
    if (!editingId || files.length === 0) return;
    setGallerySubmitting(true);
    setGalleryError(null);
    try {
      for (const file of files) {
        await ProductRepository.uploadGalleryImage(editingId, file);
      }
      await loadGallery(editingId);
    } catch (err) {
      setGalleryError(err instanceof Error ? err.message : 'No se pudo subir la imagen');
    } finally {
      setGallerySubmitting(false);
    }
  };

  const removeGalleryImage = async (imageId: string) => {
    if (!editingId) return;
    setGallerySubmitting(true);
    setGalleryError(null);
    try {
      await ProductRepository.removeGalleryImage(editingId, imageId);
      await loadGallery(editingId);
    } catch (err) {
      setGalleryError(err instanceof Error ? err.message : 'No se pudo eliminar la imagen');
    } finally {
      setGallerySubmitting(false);
    }
  };

  const reorderGallery = async (imageIds: string[]) => {
    if (!editingId) return;
    setGallery((prev) => {
      const map = new Map(prev.map((img) => [img.id, img]));
      return imageIds.map((id, i) => ({ ...map.get(id)!, order: i }));
    });
    try {
      await ProductRepository.reorderGallery(editingId, imageIds);
    } catch {
      await loadGallery(editingId);
    }
  };

  const addVideo = async () => {
    if (!editingId || !videoUrl.trim()) return;
    setVideoSubmitting(true);
    setVideoError(null);
    try {
      await ProductRepository.addProductVideo(editingId, videoUrl.trim(), videoTitle.trim() || undefined);
      setVideoUrl('');
      setVideoTitle('');
      await loadVideos(editingId);
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : 'No se pudo agregar el video');
    } finally {
      setVideoSubmitting(false);
    }
  };

  const createCategory = async (name: string): Promise<ICategory | null> => {
    try {
      const response = await CategoriesRepository.createCategory({ name: name.trim(), isActive: true });
      const newCat = response.data;
      setCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
      return newCat;
    } catch {
      return null;
    }
  };

  const createSupplier = async (name: string, phone?: string, email?: string): Promise<ISupplier | null> => {
    try {
      const response = await SuppliersRepository.createSupplier({
        name: name.trim(),
        phone: phone || undefined,
        email: email || undefined,
      });
      const newSup = response.data;
      setSuppliers(prev => [...prev, newSup].sort((a, b) => a.name.localeCompare(b.name)));
      return newSup;
    } catch {
      return null;
    }
  };

  const removeVideo = async (videoId: string) => {
    if (!editingId) return;
    setVideoSubmitting(true);
    setVideoError(null);
    try {
      await ProductRepository.removeProductVideo(editingId, videoId);
      await loadVideos(editingId);
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : 'No se pudo eliminar el video');
    } finally {
      setVideoSubmitting(false);
    }
  };

  return {
    products,
    categories,
    stores,
    suppliers,
    menuCategories,
    isSeller,
    createCategory,
    createSupplier,
    form,
    editingId,
    search,
    selectedCategoryId,
    loading,
    submitting,
    error,
    pendingImageFile,
    imagePreview,
    gallery,
    gallerySubmitting,
    galleryError,
    videos,
    videoUrl,
    videoTitle,
    videoSubmitting,
    videoError,
    setSearch,
    setSelectedCategoryId,
    updateForm,
    setImageFile,
    uploadGalleryImages,
    removeGalleryImage,
    reorderGallery,
    setVideoUrl,
    setVideoTitle,
    addVideo,
    removeVideo,
    submitForm,
    startEditing,
    toggleStatus,
    resetForm,
  };
};
