import { useCallback, useEffect, useState } from 'react';
import { usePagination } from '@/application/useCases/common/usePagination';
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
  const pagination = usePagination(20);
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

  // Pending queue for creation mode
  const [pendingGalleryFiles, setPendingGalleryFiles] = useState<{ file: File; preview: string }[]>([]);
  const [pendingVideos, setPendingVideos] = useState<{ url: string; title: string }[]>([]);

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
        page: pagination.page,
        limit: pagination.limit,
      });
      setProducts(response.data.items);
      pagination.updateMeta(response.data.pagination);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar los productos',
      );
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategoryId, pagination.page, pagination.limit]);

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
    pendingGalleryFiles.forEach(f => URL.revokeObjectURL(f.preview));
    setPendingGalleryFiles([]);
    setPendingVideos([]);
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
    if (!payload) return false;

    setSubmitting(true);
    setError(null);

    try {
      let savedId: string;
      const isCreating = !editingId;

      if (editingId) {
        const response = await ProductRepository.updateProduct(editingId, payload);
        savedId = response.data.id;
      } else {
        const response = await ProductRepository.createProduct(payload);
        savedId = response.data.id;
      }

      if (pendingImageFile) {
        await ProductRepository.uploadProductImage(savedId, pendingImageFile);
      }

      // Flush pending gallery + videos queued during creation
      if (isCreating && (pendingGalleryFiles.length > 0 || pendingVideos.length > 0)) {
        const failures: string[] = [];

        for (let i = 0; i < pendingGalleryFiles.length; i++) {
          try {
            await ProductRepository.uploadGalleryImage(savedId, pendingGalleryFiles[i].file);
          } catch {
            failures.push(`Imagen ${i + 1}`);
          }
        }

        for (const video of pendingVideos) {
          try {
            await ProductRepository.addProductVideo(savedId, video.url, video.title || undefined);
          } catch {
            failures.push(`Video "${video.title || video.url.slice(0, 30)}"`);
          }
        }

        if (failures.length > 0) {
          // Auto-switch to edit mode so the user can retry from the same form
          const savedProductResp = await ProductRepository.getProductById(savedId);
          startEditing(savedProductResp.data);
          await Promise.all([loadGallery(savedId), loadVideos(savedId)]);
          await loadProducts();
          setError(
            `Producto creado, pero ${failures.length} elemento(s) no se guardaron: ${failures.join(', ')}. Puedes reintentarlos aquí.`
          );
          setSubmitting(false);
          return false;
        }
      }

      resetForm();
      await loadProducts();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible guardar el producto');
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
    if (files.length === 0) return;
    if (editingId) {
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
    } else {
      // Creation mode: queue locally
      const newPending = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
      setPendingGalleryFiles(prev => [...prev, ...newPending]);
    }
  };

  const removePendingGalleryFile = (index: number) => {
    setPendingGalleryFiles(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
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
    if (!videoUrl.trim()) return;
    if (editingId) {
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
    } else {
      // Creation mode: queue locally
      setPendingVideos(prev => [...prev, { url: videoUrl.trim(), title: videoTitle.trim() }]);
      setVideoUrl('');
      setVideoTitle('');
    }
  };

  const removePendingVideo = (index: number) => {
    setPendingVideos(prev => prev.filter((_, i) => i !== index));
  };

  const deleteProduct = async (productId: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await ProductRepository.deleteProduct(productId);
      if (editingId === productId) resetForm();
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible eliminar el producto');
    } finally {
      setSubmitting(false);
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
    pendingGalleryFiles,
    pendingVideos,
    videos,
    videoUrl,
    videoTitle,
    videoSubmitting,
    videoError,
    setSearch: (v: string) => { pagination.reset(); setSearch(v); },
    setSelectedCategoryId: (v: string) => { pagination.reset(); setSelectedCategoryId(v); },
    updateForm,
    setImageFile,
    uploadGalleryImages,
    removeGalleryImage,
    removePendingGalleryFile,
    reorderGallery,
    removePendingVideo,
    setVideoUrl,
    setVideoTitle,
    addVideo,
    removeVideo,
    submitForm,
    startEditing,
    toggleStatus,
    deleteProduct,
    pagination,
    resetForm,
  };
};
