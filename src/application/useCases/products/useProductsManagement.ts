import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
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
import { getAuthenticatedRole } from '@/shared/utils/checkIsUserAuthenticated.util';
import { useAdminStore } from '@/shared/contexts/AdminStoreContext';

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

const optionalNonNegative = z
  .string()
  .refine((v) => v === '' || (Number(v) >= 0 && !isNaN(Number(v))), 'Debe ser un número válido');

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  sku: z.string().min(1, 'El SKU es obligatorio'),
  price: z
    .string()
    .refine((v) => v !== '' && Number(v) > 0, 'Ingresa un precio mayor a cero'),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  storeId: z.string().min(1, 'Selecciona una tienda'),
  cost: optionalNonNegative,
  compareAtPrice: optionalNonNegative,
  initialStock: optionalNonNegative,
});

export type ProductFieldErrors = Partial<Record<keyof typeof productSchema.shape, string>>;

export const useProductsManagement = () => {
  const isSeller = getAuthenticatedRole() === 'seller';
  const isAdmin = getAuthenticatedRole() === 'admin';
  const { selectedStoreId: contextStoreId } = useAdminStore();
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
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  // Image upload state (separate from form since File can't go in ProductFormState)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Gallery state
  const [gallery, setGallery] = useState<IProductImage[]>([]);
  const [gallerySubmitting, setGallerySubmitting] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  // Pending gallery files for create mode (uploaded after product is saved)
  const [pendingGalleryFiles, setPendingGalleryFiles] = useState<File[]>([]);
  const [pendingGalleryPreviews, setPendingGalleryPreviews] = useState<string[]>([]);

  // Videos state
  const [videos, setVideos] = useState<IProductVideo[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoSubmitting, setVideoSubmitting] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Pending videos for create mode (submitted after product is saved)
  const [pendingVideos, setPendingVideos] = useState<Array<{ videoUrl: string; videoTitle: string }>>([]);

  const loadCategories = useCallback(async () => {
    const response = await CategoriesRepository.getCategories(true);
    setCategories(response.data);
  }, []);

  const loadStores = useCallback(async () => {
    if (isSeller) {
      const response = await StoresRepository.getMyStores();
      const loaded: IStore[] = Array.isArray(response.data)
        ? response.data
        : (response.data as unknown as { items?: IStore[] }).items ?? [];
      setStores(loaded);
    } else {
      const response = await StoresRepository.getStores({ active: true });
      const loaded: IStore[] = Array.isArray(response.data)
        ? response.data
        : (response.data as unknown as { items?: IStore[] }).items ?? [];
      setStores(loaded);
    }
  }, [isSeller]);

  const loadSuppliers = useCallback(async () => {
    const response = await SuppliersRepository.getSuppliers();
    const raw = response.data as unknown;
    const items: ISupplier[] = Array.isArray(raw)
      ? raw
      : ((raw as { items?: ISupplier[] }).items ?? []);
    setSuppliers(items.filter((s) => s.isActive));
  }, []);

  const loadProducts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await ProductRepository.getProducts({
        search: search || undefined,
        categoryId: selectedCategoryId || undefined,
        storeId: isAdmin ? contextStoreId : undefined,
        page,
        limit: itemsPerPage,
      });
      const data = response.data as unknown as {
        items?: IProduct[];
        pagination?: { currentPage: number; totalPages: number; totalItems: number };
      };
      setProducts(data.items ?? []);
      setCurrentPage(data.pagination?.currentPage ?? page);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setTotalItems(data.pagination?.totalItems ?? 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar los productos',
      );
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategoryId, isAdmin, contextStoreId]);

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

  // Auto-select the seller's only store when stores load
  useEffect(() => {
    if (isSeller && stores.length > 0) {
      setForm((prev) => prev.storeId ? prev : { ...prev, storeId: stores[0].id });
    }
  }, [isSeller, stores]);

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

  const addPendingGalleryFiles = (files: File[]) => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPendingGalleryFiles((prev) => [...prev, ...files]);
    setPendingGalleryPreviews((prev) => [...prev, ...urls]);
  };

  const removePendingGalleryFile = (index: number) => {
    setPendingGalleryPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
    setPendingGalleryFiles((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const resetForm = () => {
    setForm((prev) => ({
      ...initialProductFormState,
      storeId: isSeller ? prev.storeId : '',
    }));
    setEditingId(null);
    setPendingImageFile(null);
    setImagePreview(null);
    setGallery([]);
    setGalleryError(null);
    setVideos([]);
    setVideoUrl('');
    setVideoTitle('');
    setVideoError(null);
    setPendingGalleryPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    setPendingGalleryFiles([]);
    setPendingVideos([]);
    setFieldErrors({});
    setError(null);
  };

  const quickCreateCategory = async (name: string): Promise<ICategory | null> => {
    try {
      const response = await CategoriesRepository.createCategory({ name, isActive: true });
      await loadCategories();
      return response.data;
    } catch {
      return null;
    }
  };

  const quickCreateSupplier = async (name: string): Promise<ISupplier | null> => {
    try {
      const response = await SuppliersRepository.createSupplier({ name });
      await loadSuppliers();
      return response.data;
    } catch {
      return null;
    }
  };

  const buildPayload = (currentForm: ProductFormState): ICreateProductRequest | null => {
    const parsed = productSchema.safeParse(currentForm);

    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const errors: ProductFieldErrors = {};
      for (const [k, msgs] of Object.entries(flat)) {
        if (msgs?.[0]) errors[k as keyof ProductFieldErrors] = msgs[0];
      }
      setFieldErrors(errors);
      return null;
    }

    setFieldErrors({});

    if (
      currentForm.isPerishable &&
      currentForm.initialStock &&
      Number(currentForm.initialStock) > 0 &&
      !currentForm.initialExpiresAt
    ) {
      setError('Los productos perecederos requieren fecha de vencimiento para el stock inicial');
      return null;
    }

    return {
      name: currentForm.name.trim(),
      description: currentForm.description.trim(),
      sku: currentForm.sku.trim(),
      price: Number(currentForm.price),
      categoryId: currentForm.categoryId,
      storeId: currentForm.storeId,
      menuCategoryId: currentForm.menuCategoryId || undefined,
      supplierId: currentForm.supplierId || undefined,
      cost: currentForm.cost ? Number(currentForm.cost) : undefined,
      compareAtPrice: currentForm.compareAtPrice ? Number(currentForm.compareAtPrice) : undefined,
      initialStock: currentForm.initialStock ? Number(currentForm.initialStock) : undefined,
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

      // Upload pending gallery files (create mode only)
      if (!editingId && pendingGalleryFiles.length > 0) {
        for (const file of pendingGalleryFiles) {
          await ProductRepository.uploadGalleryImage(savedId, file);
        }
      }

      // Upload pending videos (create mode only)
      if (!editingId && pendingVideos.length > 0) {
        for (const pv of pendingVideos) {
          await ProductRepository.addProductVideo(savedId, pv.videoUrl, pv.videoTitle || undefined);
        }
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
      sku: product.sku,
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
    if (!videoUrl.trim()) return;
    if (!editingId) {
      // Create mode: store locally, submitted after product is saved
      setPendingVideos((prev) => [
        ...prev,
        { videoUrl: videoUrl.trim(), videoTitle: videoTitle.trim() },
      ]);
      setVideoUrl('');
      setVideoTitle('');
      return;
    }
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

  const removePendingVideo = (index: number) => {
    setPendingVideos((prev) => prev.filter((_, i) => i !== index));
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

  const changePage = async (page: number) => {
    await loadProducts(page);
  };

  return {
    isSeller,
    products,
    categories,
    stores,
    suppliers,
    menuCategories,
    form,
    editingId,
    search,
    selectedCategoryId,
    loading,
    submitting,
    error,
    fieldErrors,
    pendingImageFile,
    imagePreview,
    gallery,
    gallerySubmitting,
    galleryError,
    pendingGalleryFiles,
    pendingGalleryPreviews,
    addPendingGalleryFiles,
    removePendingGalleryFile,
    videos,
    pendingVideos,
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
    removePendingVideo,
    removeVideo,
    submitForm,
    startEditing,
    toggleStatus,
    resetForm,
    quickCreateCategory,
    quickCreateSupplier,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    changePage,
  };
};
