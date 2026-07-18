import { useCallback, useEffect, useState } from 'react';
import { ISupplier } from '@/application/dtos/suppliers/response/SupplierResponse';
import { SuppliersRepository } from '@/infrastructure/repositories/api/suppliers/SuppliersRepository';
import { useAdminStore } from '@/shared/contexts/AdminStoreContext';

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

const itemsPerPage = 20;

export const useSuppliersManagement = () => {
  const { selectedStoreId: contextStoreId } = useAdminStore();
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [form, setForm] = useState<SupplierFormState>(initialSupplierForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadSuppliers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await SuppliersRepository.getSuppliers(search || undefined, contextStoreId, page, itemsPerPage);
      const raw = response.data as unknown as { items: ISupplier[]; total: number; page: number; totalPages: number };
      setSuppliers(raw.items ?? []);
      setCurrentPage(raw.page ?? 1);
      setTotalPages(raw.totalPages ?? 1);
      setTotalItems(raw.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar proveedores');
    } finally {
      setLoading(false);
    }
  }, [search, contextStoreId]);

  useEffect(() => {
    void loadSuppliers();
  }, [loadSuppliers]);

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
      await loadSuppliers();
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
      await loadSuppliers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible actualizar proveedor');
    } finally {
      setSubmitting(false);
    }
  };

  const changePage = async (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    await loadSuppliers(page);
  };

  return {
    suppliers,
    form,
    editingId,
    search,
    loading,
    submitting,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    setSearch,
    updateForm,
    submitForm,
    startEditing,
    toggleStatus,
    resetForm,
    changePage,
    reload: loadSuppliers,
  };
};
