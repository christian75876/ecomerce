import {
  InlineProductForm,
  InlineSupplierForm,
  PurchaseEditForm,
  PurchaseItemForm,
  PurchasePaymentForm,
} from '../purchase.types';

export const validatePurchaseDraft = (params: {
  supplierId: string;
  storeId: string;
  purchaseDate: string;
  items: PurchaseItemForm[];
}) => {
  if (!params.supplierId || !params.storeId || !params.purchaseDate) {
    return 'Proveedor, tienda y fecha son obligatorios';
  }

  const hasValidItems = params.items.some(
    (item) => item.productId && item.quantity && item.unitCost,
  );

  if (!hasValidItems) {
    return 'Debes agregar al menos un ítem válido';
  }

  return null;
};

export const validateInlineSupplierForm = (form: InlineSupplierForm) => {
  if (!form.name.trim()) {
    return 'El nombre del proveedor es obligatorio';
  }

  return null;
};

export const validateInlineProductForm = (params: {
  form: InlineProductForm;
  storeId: string;
}) => {
  if (!params.storeId) {
    return 'Selecciona primero la tienda de la compra';
  }

  const { form } = params;

  if (
    !form.name.trim() ||
    !form.description.trim() ||
    !form.sku.trim() ||
    !form.price ||
    !form.categoryId
  ) {
    return 'Completa nombre, descripción, SKU, precio y categoría';
  }

  return null;
};

export const validatePurchasePaymentForm = (form: PurchasePaymentForm) => {
  if (!form.amount || Number(form.amount) <= 0) {
    return 'El abono debe ser mayor a cero';
  }

  return null;
};

export const validatePurchaseEditForm = (form: PurchaseEditForm) => {
  if (!form.purchaseDate) {
    return 'La fecha de compra es obligatoria';
  }

  return null;
};
