import { useEffect, useState } from 'react';
import { IPurchase } from '@/application/dtos/purchases/response/PurchaseResponse';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { PurchasesRepository } from '@/infrastructure/repositories/api/purchases/PurchasesRepository';
import { SuppliersRepository } from '@/infrastructure/repositories/api/suppliers/SuppliersRepository';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { CategoriesRepository } from '@/infrastructure/repositories/api/categories/CategoriesRepository';
import { ICategory } from '@/application/dtos/categories/response/CategoryResponse';

export type PurchaseItemForm = {
  productId: string;
  quantity: string;
  unitCost: string;
  expiresAt: string;
  batchCode: string;
};

export type InlineSupplierForm = {
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

export type InlineProductForm = {
  name: string;
  description: string;
  sku: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  showStock: boolean;
  isPerishable: boolean;
  trackBatches: boolean;
};

export type PurchasePaymentForm = {
  amount: string;
  note: string;
  paidAt: string;
};

export type PurchaseEditForm = {
  purchaseDate: string;
  note: string;
};

export type PurchaseCancelForm = {
  reason: string;
};

export type PurchaseListFilters = {
  search: string;
  supplierId: string;
  dateFrom: string;
  dateTo: string;
};

const emptyItem: PurchaseItemForm = {
  productId: '',
  quantity: '1',
  unitCost: '',
  expiresAt: '',
  batchCode: '',
};

const emptySupplierForm: InlineSupplierForm = {
  name: '',
  document: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

const emptyProductForm: InlineProductForm = {
  name: '',
  description: '',
  sku: '',
  price: '',
  categoryId: '',
  imageUrl: '',
  showStock: true,
  isPerishable: false,
  trackBatches: true,
};

const emptyPaymentForm: PurchasePaymentForm = {
  amount: '',
  note: '',
  paidAt: '',
};

const emptyEditForm: PurchaseEditForm = {
  purchaseDate: '',
  note: '',
};

const emptyCancelForm: PurchaseCancelForm = {
  reason: '',
};

const toDateTimeLocal = (value: string | null | undefined) => {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const offset = parsed.getTimezoneOffset();
  const local = new Date(parsed.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
};

export const usePurchasesManagement = () => {
  const [purchases, setPurchases] = useState<IPurchase[]>([]);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [stores, setStores] = useState<IStore[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [storeId, setStoreId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<PurchaseItemForm[]>([emptyItem]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState<InlineSupplierForm>(emptySupplierForm);
  const [productForm, setProductForm] = useState<InlineProductForm>(emptyProductForm);
  const [supplierSubmitting, setSupplierSubmitting] = useState(false);
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [productTargetIndex, setProductTargetIndex] = useState<number | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<IPurchase | null>(null);
  const [isPurchaseDetailModalOpen, setIsPurchaseDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailSubmitting, setDetailSubmitting] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState<PurchasePaymentForm>(emptyPaymentForm);
  const [editForm, setEditForm] = useState<PurchaseEditForm>(emptyEditForm);
  const [cancelForm, setCancelForm] = useState<PurchaseCancelForm>(emptyCancelForm);
  const [filters, setFilters] = useState<PurchaseListFilters>({
    search: '',
    supplierId: '',
    dateFrom: '',
    dateTo: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  const loadStaticData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [suppliersResponse, storesResponse, productsResponse, categoriesResponse] =
        await Promise.all([
          SuppliersRepository.getSuppliers(),
          StoresRepository.getStores(),
          ProductRepository.getProducts(),
          CategoriesRepository.getCategories(true),
        ]);
      setSuppliers(suppliersResponse.data.filter((item) => item.isActive));
      setStores(storesResponse.data.filter((item) => item.isActive));
      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar compras');
    } finally {
      setLoading(false);
    }
  };

  const loadPurchases = async (
    page = currentPage,
    activeFilters = filters,
    preserveLoadingState = false,
  ) => {
    if (!preserveLoadingState) {
      setLoading(true);
    }
    setError(null);

    try {
      const purchasesResponse = await PurchasesRepository.getPurchases({
        page,
        limit: itemsPerPage,
        search: activeFilters.search.trim() || undefined,
        supplierId: activeFilters.supplierId || undefined,
        dateFrom: activeFilters.dateFrom || undefined,
        dateTo: activeFilters.dateTo || undefined,
      });

      setPurchases(purchasesResponse.data.items);
      setCurrentPage(purchasesResponse.data.pagination.currentPage);
      setTotalPages(purchasesResponse.data.pagination.totalPages);
      setTotalItems(purchasesResponse.data.pagination.totalItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar compras');
    } finally {
      if (!preserveLoadingState) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void (async () => {
      await loadStaticData();
      await loadPurchases(1, {
        search: '',
        supplierId: '',
        dateFrom: '',
        dateTo: '',
      }, true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateItem = (index: number, key: keyof PurchaseItemForm, value: string) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  };

  const addItem = () => setItems((current) => [...current, emptyItem]);
  const removeItem = (index: number) =>
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));

  const resetForm = () => {
    setSupplierId('');
    setStoreId('');
    setPurchaseDate('');
    setPaidAmount('');
    setNote('');
    setItems([emptyItem]);
  };

  const resetSupplierModal = () => {
    setSupplierForm(emptySupplierForm);
    setModalError(null);
    setIsSupplierModalOpen(false);
  };

  const resetProductModal = () => {
    setProductForm(emptyProductForm);
    setModalError(null);
    setIsProductModalOpen(false);
    setProductTargetIndex(null);
  };

  const hydratePurchaseDetail = (purchase: IPurchase) => {
    setSelectedPurchase(purchase);
    setPaymentForm({
      amount: purchase.balance > 0 ? String(purchase.balance) : '',
      note: '',
      paidAt: '',
    });
    setEditForm({
      purchaseDate: toDateTimeLocal(purchase.purchaseDate),
      note: purchase.note ?? '',
    });
    setCancelForm(emptyCancelForm);
  };

  const replacePurchaseInState = (nextPurchase: IPurchase) => {
    setPurchases((current) =>
      current.map((purchase) =>
        purchase.id === nextPurchase.id ? nextPurchase : purchase,
      ),
    );
    hydratePurchaseDetail(nextPurchase);
  };

  const availableProducts = products.filter(
    (product) => !storeId || product.storeId === storeId,
  );

  const submitForm = async () => {
    if (!supplierId || !storeId || !purchaseDate) {
      setError('Proveedor, tienda y fecha son obligatorios');
      return false;
    }

    const normalizedItems = items
      .filter((item) => item.productId && item.quantity && item.unitCost)
      .map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
        expiresAt: item.expiresAt || undefined,
        batchCode: item.batchCode.trim() || undefined,
      }));

    if (normalizedItems.length === 0) {
      setError('Debes agregar al menos un ítem válido');
      return false;
    }

    setSubmitting(true);
    setError(null);
    try {
      await PurchasesRepository.createPurchase({
        supplierId,
        storeId,
        purchaseDate: new Date(purchaseDate).toISOString(),
        paidAmount: paidAmount ? Number(paidAmount) : undefined,
        note: note.trim() || undefined,
        items: normalizedItems,
      });
      resetForm();
      await loadPurchases(1, filters);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible registrar compra');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updateSupplierForm = (key: keyof InlineSupplierForm, value: string) => {
    setSupplierForm((current) => ({ ...current, [key]: value }));
  };

  const updateProductForm = <K extends keyof InlineProductForm>(
    key: K,
    value: InlineProductForm[K],
  ) => {
    setProductForm((current) => ({ ...current, [key]: value }));
  };

  const openSupplierModal = () => {
    setModalError(null);
    setIsSupplierModalOpen(true);
  };

  const openProductModal = (index: number) => {
    setModalError(null);
    setProductTargetIndex(index);
    setIsProductModalOpen(true);
  };

  const openPurchaseDetailModal = async (purchaseId: string) => {
    setDetailLoading(true);
    setDetailError(null);
    setIsPurchaseDetailModalOpen(true);

    try {
      const response = await PurchasesRepository.getPurchaseById(purchaseId);
      hydratePurchaseDetail(response.data);
    } catch (err) {
      setSelectedPurchase(null);
      setDetailError(
        err instanceof Error ? err.message : 'No fue posible cargar el detalle',
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closePurchaseDetailModal = () => {
    setIsPurchaseDetailModalOpen(false);
    setSelectedPurchase(null);
    setDetailError(null);
    setDetailLoading(false);
    setDetailSubmitting(false);
    setPaymentForm(emptyPaymentForm);
    setEditForm(emptyEditForm);
    setCancelForm(emptyCancelForm);
  };

  const createSupplierInline = async () => {
    if (!supplierForm.name.trim()) {
      setModalError('El nombre del proveedor es obligatorio');
      return false;
    }

    setSupplierSubmitting(true);
    setModalError(null);

    try {
      const response = await SuppliersRepository.createSupplier({
        name: supplierForm.name.trim(),
        document: supplierForm.document.trim() || undefined,
        phone: supplierForm.phone.trim() || undefined,
        email: supplierForm.email.trim() || undefined,
        address: supplierForm.address.trim() || undefined,
        notes: supplierForm.notes.trim() || undefined,
      });

      setSuppliers((current) => [...current, response.data]);
      setSupplierId(response.data.id);
      resetSupplierModal();
      return true;
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : 'No fue posible crear el proveedor',
      );
      return false;
    } finally {
      setSupplierSubmitting(false);
    }
  };

  const createProductInline = async () => {
    if (!storeId) {
      setModalError('Selecciona primero la tienda de la compra');
      return false;
    }

    if (
      !productForm.name.trim() ||
      !productForm.description.trim() ||
      !productForm.sku.trim() ||
      !productForm.price ||
      !productForm.categoryId
    ) {
      setModalError('Completa nombre, descripción, SKU, precio y categoría');
      return false;
    }

    setProductSubmitting(true);
    setModalError(null);

    try {
      const response = await ProductRepository.createProduct({
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        sku: productForm.sku.trim(),
        price: Number(productForm.price),
        categoryId: productForm.categoryId,
        storeId,
        supplierId: supplierId || undefined,
        imageUrl: productForm.imageUrl.trim() || undefined,
        showStock: productForm.showStock,
        isPerishable: productForm.isPerishable,
        trackBatches: productForm.trackBatches,
        isActive: true,
      });

      setProducts((current) => [...current, response.data]);
      if (productTargetIndex !== null) {
        updateItem(productTargetIndex, 'productId', response.data.id);
      }
      resetProductModal();
      return true;
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : 'No fue posible crear el producto',
      );
      return false;
    } finally {
      setProductSubmitting(false);
    }
  };

  const updatePaymentForm = (key: keyof PurchasePaymentForm, value: string) => {
    setPaymentForm((current) => ({ ...current, [key]: value }));
  };

  const updateEditForm = (key: keyof PurchaseEditForm, value: string) => {
    setEditForm((current) => ({ ...current, [key]: value }));
  };

  const updateCancelForm = (key: keyof PurchaseCancelForm, value: string) => {
    setCancelForm((current) => ({ ...current, [key]: value }));
  };

  const updateFilters = (key: keyof PurchaseListFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = async () => {
    await loadPurchases(1, filters);
  };

  const clearFilters = async () => {
    const nextFilters = {
      search: '',
      supplierId: '',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(nextFilters);
    await loadPurchases(1, nextFilters);
  };

  const changePage = async (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    await loadPurchases(page, filters);
  };

  const submitPurchasePayment = async () => {
    if (!selectedPurchase) {
      return false;
    }

    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      setDetailError('El abono debe ser mayor a cero');
      return false;
    }

    setDetailSubmitting(true);
    setDetailError(null);
    try {
      const response = await PurchasesRepository.registerPurchasePayment(
        selectedPurchase.id,
        {
          amount: Number(paymentForm.amount),
          note: paymentForm.note.trim() || undefined,
          paidAt: paymentForm.paidAt
            ? new Date(paymentForm.paidAt).toISOString()
            : undefined,
        },
      );
      replacePurchaseInState(response.data);
      setPaymentForm({
        amount: response.data.balance > 0 ? String(response.data.balance) : '',
        note: '',
        paidAt: '',
      });
      return true;
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : 'No fue posible registrar el abono',
      );
      return false;
    } finally {
      setDetailSubmitting(false);
    }
  };

  const submitPurchaseEdit = async () => {
    if (!selectedPurchase) {
      return false;
    }

    if (!editForm.purchaseDate) {
      setDetailError('La fecha de compra es obligatoria');
      return false;
    }

    setDetailSubmitting(true);
    setDetailError(null);
    try {
      const response = await PurchasesRepository.updatePurchase(
        selectedPurchase.id,
        {
          purchaseDate: new Date(editForm.purchaseDate).toISOString(),
          note: editForm.note.trim() || undefined,
        },
      );
      replacePurchaseInState(response.data);
      return true;
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : 'No fue posible editar la compra',
      );
      return false;
    } finally {
      setDetailSubmitting(false);
    }
  };

  const submitPurchaseCancel = async () => {
    if (!selectedPurchase) {
      return false;
    }

    setDetailSubmitting(true);
    setDetailError(null);
    try {
      const response = await PurchasesRepository.cancelPurchase(selectedPurchase.id, {
        reason: cancelForm.reason.trim() || undefined,
      });
      replacePurchaseInState(response.data);
      return true;
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : 'No fue posible cancelar la compra',
      );
      return false;
    } finally {
      setDetailSubmitting(false);
    }
  };

  return {
    purchases,
    suppliers,
    stores,
    categories,
    products: availableProducts,
    supplierId,
    storeId,
    purchaseDate,
    paidAmount,
    note,
    items,
    loading,
    submitting,
    error,
    isSupplierModalOpen,
    isProductModalOpen,
    supplierForm,
    productForm,
    supplierSubmitting,
    productSubmitting,
    modalError,
    selectedPurchase,
    isPurchaseDetailModalOpen,
    detailLoading,
    detailSubmitting,
    detailError,
    paymentForm,
    editForm,
    cancelForm,
    setSupplierId,
    setStoreId,
    setPurchaseDate,
    setPaidAmount,
    setNote,
    updateItem,
    addItem,
    removeItem,
    submitForm,
    openSupplierModal,
    openProductModal,
    openPurchaseDetailModal,
    closeSupplierModal: resetSupplierModal,
    closeProductModal: resetProductModal,
    closePurchaseDetailModal,
    updateSupplierForm,
    updateProductForm,
    updatePaymentForm,
    updateEditForm,
    updateCancelForm,
    createSupplierInline,
    createProductInline,
    submitPurchasePayment,
    submitPurchaseEdit,
    submitPurchaseCancel,
    filters,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    updateFilters,
    applyFilters,
    clearFilters,
    changePage,
    reload: () => loadPurchases(currentPage, filters),
  };
};
