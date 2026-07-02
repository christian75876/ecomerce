import { useState } from 'react';
import { IAsyncOption } from '@/application/dtos/common/AsyncOption';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { PurchasesRepository } from '@/infrastructure/repositories/api/purchases/PurchasesRepository';
import { SuppliersRepository } from '@/infrastructure/repositories/api/suppliers/SuppliersRepository';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import {
  mapPurchaseProductToAsyncOption,
  mapSupplierToAsyncOption,
  normalizePurchaseItems,
  toIsoDateTimeString,
} from '../helpers/purchaseMappers';
import {
  createEmptyPurchaseItem,
  emptyProductForm,
  emptySupplierForm,
} from '../helpers/purchaseInitialState';
import {
  InlineProductForm,
  InlineSupplierForm,
  PurchaseItemForm,
} from '../purchase.types';
import {
  validateInlineProductForm,
  validateInlineSupplierForm,
  validatePurchaseDraft,
} from '../helpers/purchaseValidation';

interface UsePurchaseRegistrationFlowParams {
  onPurchaseCreated: () => Promise<void>;
  onSupplierCreated: (supplier: ISupplier) => void;
}

export const usePurchaseRegistrationFlow = ({
  onPurchaseCreated,
  onSupplierCreated,
}: UsePurchaseRegistrationFlowParams) => {
  const [selectedSupplierOption, setSelectedSupplierOption] =
    useState<IAsyncOption | null>(null);
  const [supplierId, setSupplierId] = useState('');
  const [storeId, setStoreId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<PurchaseItemForm[]>([
    createEmptyPurchaseItem(),
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [supplierForm, setSupplierForm] =
    useState<InlineSupplierForm>(emptySupplierForm);
  const [productForm, setProductForm] =
    useState<InlineProductForm>(emptyProductForm);
  const [supplierSubmitting, setSupplierSubmitting] = useState(false);
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [productTargetIndex, setProductTargetIndex] = useState<number | null>(
    null,
  );

  const updateStoreSelection = (value: string) => {
    setStoreId(value);
    setItems((current) =>
      current.map((item) => ({
        ...item,
        productId: '',
        selectedProductOption: null,
      })),
    );
  };

  const updateItem = <K extends keyof PurchaseItemForm>(
    index: number,
    key: K,
    value: PurchaseItemForm[K],
  ) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  };

  const addItem = () =>
    setItems((current) => [...current, createEmptyPurchaseItem()]);

  const removeItem = (index: number) =>
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));

  const resetForm = () => {
    setSupplierId('');
    setSelectedSupplierOption(null);
    setStoreId('');
    setPurchaseDate('');
    setPaidAmount('');
    setNote('');
    setItems([createEmptyPurchaseItem()]);
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

  const submitForm = async () => {
    const validationError = validatePurchaseDraft({
      supplierId,
      storeId,
      purchaseDate,
      items,
    });

    if (validationError) {
      setError(validationError);
      return false;
    }

    setSubmitting(true);
    setError(null);

    try {
      await PurchasesRepository.createPurchase({
        supplierId,
        storeId,
        purchaseDate: toIsoDateTimeString(purchaseDate),
        paidAmount: paidAmount ? Number(paidAmount) : undefined,
        note: note.trim() || undefined,
        items: normalizePurchaseItems(items),
      });
      resetForm();
      await onPurchaseCreated();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible registrar compra',
      );
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

  const selectSupplierOption = (option: IAsyncOption | null) => {
    setSupplierId(option?.id ?? '');
    setSelectedSupplierOption(option);
  };

  const selectProductOption = (index: number, option: IAsyncOption | null) => {
    updateItem(index, 'productId', option?.id ?? '');
    updateItem(index, 'selectedProductOption', option);
  };

  const loadSupplierOptions = async ({
    search,
    page,
  }: {
    search: string;
    page: number;
  }) => {
    const response = await SuppliersRepository.getSupplierOptions({
      search: search.trim() || undefined,
      page,
      limit: 10,
    });

    return {
      items: response.data.items,
      currentPage: response.data.pagination.currentPage,
      totalPages: response.data.pagination.totalPages,
    };
  };

  const loadProductOptions = async ({
    search,
    page,
  }: {
    search: string;
    page: number;
  }) => {
    if (!storeId) {
      return {
        items: [],
        currentPage: 1,
        totalPages: 1,
      };
    }

    const response = await ProductRepository.getProductOptions({
      search: search.trim() || undefined,
      storeId,
      page,
      limit: 10,
    });

    return {
      items: response.data.items,
      currentPage: response.data.pagination.currentPage,
      totalPages: response.data.pagination.totalPages,
    };
  };

  const createSupplierInline = async () => {
    const validationError = validateInlineSupplierForm(supplierForm);
    if (validationError) {
      setModalError(validationError);
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

      onSupplierCreated(response.data);
      selectSupplierOption(mapSupplierToAsyncOption(response.data));
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
    const validationError = validateInlineProductForm({
      form: productForm,
      storeId,
    });

    if (validationError) {
      setModalError(validationError);
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

      if (productTargetIndex !== null) {
        selectProductOption(
          productTargetIndex,
          mapPurchaseProductToAsyncOption({
            id: response.data.id,
            name: response.data.name,
            sku: response.data.sku,
            isPerishable: response.data.isPerishable,
            showStock: response.data.showStock,
            storeId: response.data.storeId,
            store: response.data.store,
          }),
        );
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

  return {
    supplierId,
    selectedSupplierOption,
    storeId,
    purchaseDate,
    paidAmount,
    note,
    items,
    submitting,
    error,
    isSupplierModalOpen,
    isProductModalOpen,
    supplierForm,
    productForm,
    supplierSubmitting,
    productSubmitting,
    modalError,
    setSupplierId,
    setStoreId: updateStoreSelection,
    setPurchaseDate,
    setPaidAmount,
    setNote,
    updateItem,
    addItem,
    removeItem,
    submitForm,
    openSupplierModal,
    openProductModal,
    closeSupplierModal: resetSupplierModal,
    closeProductModal: resetProductModal,
    updateSupplierForm,
    updateProductForm,
    selectSupplierOption,
    selectProductOption,
    loadSupplierOptions,
    loadProductOptions,
    createSupplierInline,
    createProductInline,
  };
};
