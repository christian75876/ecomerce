import { useCallback, useEffect, useState } from 'react';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import { SuppliersRepository } from '@/infrastructure/repositories/api/suppliers/SuppliersRepository';

export type SupplierFormState = {
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

const initialSupplierForm: SupplierFormState = {
  name: '',
  document: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

const SUPPLIERS_PER_PAGE = 15;

export const useSuppliersManagement = () => {
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [suppliersPage, setSuppliersPage] = useState(1);
  const [suppliersTotalPages, setSuppliersTotalPages] = useState(1);
  const [form, setForm] = useState<SupplierFormState>(initialSupplierForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (page: number, term: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await SuppliersRepository.getSuppliers(term || undefined, page, SUPPLIERS_PER_PAGE);
      setSuppliers(response.data.items);
      setSuppliersPage(response.data.page);
      setSuppliersTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar proveedores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(1, search);
  }, [search, loadPage]);

  const updateForm = <K extends keyof SupplierFormState>(
    key: K,
    value: SupplierFormState[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const resetForm = () => {
    setForm(initialSupplierForm);
    setEditingId(null);
  };

  const submitForm = async () => {
    if (!form.name.trim()) {
      setError('El nombre del proveedor es obligatorio');
      return false;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        document: form.document.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };

      if (editingId) {
        await SuppliersRepository.updateSupplier(editingId, payload);
      } else {
        await SuppliersRepository.createSupplier(payload);
      }

      resetForm();
      await loadPage(1, search);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible guardar proveedor');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (supplier: ISupplier) => {
    setEditingId(supplier.id);
    setForm({
      name: supplier.name,
      document: supplier.document ?? '',
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      address: supplier.address ?? '',
      notes: supplier.notes ?? '',
    });
  };

  const toggleStatus = async (supplier: ISupplier) => {
    setSubmitting(true);
    setError(null);
    try {
      await SuppliersRepository.updateSupplier(supplier.id, {
        isActive: !supplier.isActive,
      });
      await loadPage(suppliersPage, search);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible actualizar proveedor');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    suppliers,
    suppliersPage,
    suppliersTotalPages,
    goToSuppliersPage: (page: number) => void loadPage(page, search),
    form,
    editingId,
    search,
    loading,
    submitting,
    error,
    setSearch,
    updateForm,
    submitForm,
    startEditing,
    toggleStatus,
    resetForm,
  };
};
