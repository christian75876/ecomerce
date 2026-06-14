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
  accentColor: string;
  bgColor: string;
  textColor: string;
  fontStyle: 'MODERN' | 'CLASSIC' | 'PLAYFUL';
  buttonStyle: 'ROUNDED' | 'SHARP' | 'PILL';
  layoutStyle: 'GRID' | 'LIST';
  coverStyle: 'GRADIENT' | 'SOLID' | 'MINIMAL';
  phone: string;
  whatsappNumber: string;
  email: string;
  isActive: boolean;
  deliveryOptions: 'DELIVERY' | 'PICKUP' | 'BOTH';
};

const initialStoreForm: StoreFormState = {
  name: '',
  slug: '',
  description: '',
  logoUrl: '',
  bannerUrl: '',
  primaryColor: '#6366f1',
  secondaryColor: '#a5b4fc',
  accentColor: '#f59e0b',
  bgColor: '#ffffff',
  textColor: '#1e293b',
  fontStyle: 'MODERN',
  buttonStyle: 'ROUNDED',
  layoutStyle: 'GRID',
  coverStyle: 'GRADIENT',
  phone: '',
  whatsappNumber: '',
  email: '',
  isActive: true,
  deliveryOptions: 'BOTH',
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
        whatsappNumber: form.whatsappNumber.trim() || undefined,
        email: form.email.trim() || undefined,
        isActive: form.isActive,
        deliveryOptions: form.deliveryOptions,
        accentColor: form.accentColor.trim() || undefined,
        bgColor: form.bgColor.trim() || undefined,
        textColor: form.textColor.trim() || undefined,
        fontStyle: form.fontStyle,
        buttonStyle: form.buttonStyle,
        layoutStyle: form.layoutStyle,
        coverStyle: form.coverStyle,
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
      primaryColor: store.primaryColor ?? '#6366f1',
      secondaryColor: store.secondaryColor ?? '#a5b4fc',
      phone: store.phone ?? '',
      whatsappNumber: store.whatsappNumber ?? '',
      email: store.email ?? '',
      isActive: store.isActive,
      deliveryOptions: store.deliveryOptions ?? 'BOTH',
      accentColor: store.accentColor ?? '#f59e0b',
      bgColor: store.bgColor ?? '#ffffff',
      textColor: store.textColor ?? '#1e293b',
      fontStyle: store.fontStyle ?? 'MODERN',
      buttonStyle: store.buttonStyle ?? 'ROUNDED',
      layoutStyle: store.layoutStyle ?? 'GRID',
      coverStyle: store.coverStyle ?? 'GRADIENT',
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
