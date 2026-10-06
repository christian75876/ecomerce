import { useEffect, useState } from 'react';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { getAuthenticatedRole } from '@/shared/utils/checkIsUserAuthenticated.util';
import { useAdminStore } from '@/shared/contexts/AdminStoreContext';

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
  // whatsappNumber vive solo en Mi Perfil (junto al API key de CallMeBot) —
  // editarlo también aquí duplicaba la UI para el mismo campo del backend.
  phone: string;
  email: string;
  isActive: boolean;
  isAdultContent: boolean;
  isPremiumAdvertiser: boolean;
  subscriptionExpiresAt: string;
  storeType: 'STORE' | 'RESTAURANT';
  menuPdfUrl: string;
  deliveryOptions: 'DELIVERY' | 'PICKUP' | 'BOTH';
  lat: number | null;
  lng: number | null;
  addressText: string;
  hideLocation: boolean;
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
  email: '',
  isActive: true,
  isAdultContent: false,
  isPremiumAdvertiser: false,
  subscriptionExpiresAt: '',
  storeType: 'STORE',
  menuPdfUrl: '',
  deliveryOptions: 'BOTH',
  lat: null,
  lng: null,
  addressText: '',
  hideLocation: false,
};

function storeToForm(store: IStore): StoreFormState {
  return {
    name: store.name,
    slug: store.slug,
    description: store.description ?? '',
    logoUrl: store.logoUrl ?? '',
    bannerUrl: store.bannerUrl ?? '',
    primaryColor: store.primaryColor ?? '#6366f1',
    secondaryColor: store.secondaryColor ?? '#a5b4fc',
    phone: store.phone ?? '',
    email: store.email ?? '',
    isActive: store.isActive,
    isAdultContent: store.isAdultContent ?? false,
    isPremiumAdvertiser: store.isPremiumAdvertiser ?? false,
    subscriptionExpiresAt: store.subscriptionExpiresAt
      ? store.subscriptionExpiresAt.split('T')[0]
      : '',
    storeType: store.storeType ?? 'STORE',
    menuPdfUrl: store.menuPdfUrl ?? '',
    deliveryOptions: store.deliveryOptions ?? 'BOTH',
    accentColor: store.accentColor ?? '#f59e0b',
    bgColor: store.bgColor ?? '#ffffff',
    textColor: store.textColor ?? '#1e293b',
    fontStyle: store.fontStyle ?? 'MODERN',
    buttonStyle: store.buttonStyle ?? 'ROUNDED',
    layoutStyle: store.layoutStyle ?? 'GRID',
    coverStyle: store.coverStyle ?? 'GRADIENT',
    lat: store.lat ?? null,
    lng: store.lng ?? null,
    addressText: store.addressText ?? '',
    hideLocation: store.hideLocation ?? false,
  };
}

export const useStoresManagement = () => {
  const isSeller = getAuthenticatedRole() === 'seller';
  const { selectedStoreId, setSelectedStoreId } = useAdminStore();
  const [stores, setStores] = useState<IStore[]>([]);
  const [form, setForm] = useState<StoreFormState>(initialStoreForm);
  const [savedForm, setSavedForm] = useState<StoreFormState>(initialStoreForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);

  const loadStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = isSeller
        ? await StoresRepository.getMyStores()
        : await StoresRepository.getStores();
      const loaded = response.data;
      setStores(loaded);
      if (isSeller && loaded.length > 0) {
        const f = storeToForm(loaded[0]);
        setEditingId(loaded[0].id);
        setForm(f);
        setSavedForm(f);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar tiendas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStores();
  }, []);

  // Un admin gestiona muchas tiendas — la tienda elegida en el selector del
  // sidebar (useAdminStore) y la que se está editando aquí deben ser la
  // misma, para no mostrar el formulario de "Nueva tienda" vacío mientras el
  // sidebar ya muestra una tienda específica seleccionada. Los sellers no
  // usan ese selector (solo tienen su propia tienda, ya precargada arriba).
  useEffect(() => {
    if (isSeller) return;
    if (!selectedStoreId) {
      setForm(initialStoreForm);
      setSavedForm(initialStoreForm);
      setEditingId(null);
      return;
    }
    const match = stores.find((s) => s.id === selectedStoreId);
    if (!match || match.id === editingId) return;
    const f = storeToForm(match);
    setEditingId(match.id);
    setForm(f);
    setSavedForm(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoreId, stores, isSeller]);

  const updateForm = <K extends keyof StoreFormState>(
    key: K,
    value: StoreFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(initialStoreForm);
    setSavedForm(initialStoreForm);
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
        isAdultContent: form.isAdultContent,
        isPremiumAdvertiser: form.isPremiumAdvertiser,
        subscriptionExpiresAt: form.subscriptionExpiresAt || null,
        storeType: form.storeType,
        menuPdfUrl: form.menuPdfUrl.trim() || undefined,
        deliveryOptions: form.deliveryOptions,
        accentColor: form.accentColor.trim() || undefined,
        bgColor: form.bgColor.trim() || undefined,
        textColor: form.textColor.trim() || undefined,
        fontStyle: form.fontStyle,
        buttonStyle: form.buttonStyle,
        layoutStyle: form.layoutStyle,
        coverStyle: form.coverStyle,
        lat: form.lat ?? undefined,
        lng: form.lng ?? undefined,
        addressText: form.addressText.trim() || undefined,
        hideLocation: form.hideLocation,
      };

      if (editingId) {
        await StoresRepository.updateStore(editingId, payload);
      } else {
        await StoresRepository.createStore(payload);
      }

      setSavedForm(form);
      if (!isSeller) resetForm();
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
    const f = storeToForm(store);
    setEditingId(store.id);
    setForm(f);
    setSavedForm(f);
    if (!isSeller) setSelectedStoreId(store.id);
  };

  const toggleActive = async (store: IStore) => {
    setSubmitting(true);
    setError(null);
    try {
      await StoresRepository.updateStore(store.id, { isActive: !store.isActive });
      await loadStores();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cambiar el estado de la tienda');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteStore = async (store: IStore) => {
    setSubmitting(true);
    setError(null);
    try {
      await StoresRepository.deleteStore(store.id);
      if (editingId === store.id) resetForm();
      await loadStores();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible eliminar la tienda');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isSeller,
    isDirty,
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
    toggleActive,
    deleteStore,
    reload: loadStores,
  };
};
