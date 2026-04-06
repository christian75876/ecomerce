import { useEffect, useState } from 'react';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';

export type StoreFormState = {
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  secondaryColor: string;
  phone: string;
  email: string;
  isActive: boolean;
};

const initialStoreForm: StoreFormState = {
  name: '',
  slug: '',
  description: '',
  logoUrl: '',
  bannerUrl: '',
  primaryColor: '',
  secondaryColor: '',
  phone: '',
  email: '',
  isActive: true,
};

export const useStoresManagement = () => {
  const [stores, setStores] = useState<IStore[]>([]);
  const [form, setForm] = useState<StoreFormState>(initialStoreForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await StoresRepository.getStores();
      setStores(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar tiendas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStores();
  }, []);

  const updateForm = <K extends keyof StoreFormState>(
    key: K,
    value: StoreFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(initialStoreForm);
    setEditingId(null);
  };

  const submitForm = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      setError('Nombre y slug son obligatorios');
      return false;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        description: form.description.trim() || undefined,
        logoUrl: form.logoUrl.trim() || undefined,
        bannerUrl: form.bannerUrl.trim() || undefined,
        primaryColor: form.primaryColor.trim() || undefined,
        secondaryColor: form.secondaryColor.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        isActive: form.isActive,
      };

      if (editingId) {
        await StoresRepository.updateStore(editingId, payload);
      } else {
        await StoresRepository.createStore(payload);
      }

      resetForm();
      await loadStores();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible guardar la tienda');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (store: IStore) => {
    setEditingId(store.id);
    setForm({
      name: store.name,
      slug: store.slug,
      description: store.description ?? '',
      logoUrl: store.logoUrl ?? '',
      bannerUrl: store.bannerUrl ?? '',
      primaryColor: store.primaryColor ?? '',
      secondaryColor: store.secondaryColor ?? '',
      phone: store.phone ?? '',
      email: store.email ?? '',
      isActive: store.isActive,
    });
  };

  return {
    stores,
    form,
    editingId,
    loading,
    submitting,
    error,
    updateForm,
    submitForm,
    startEditing,
    resetForm,
    reload: loadStores,
  };
};
