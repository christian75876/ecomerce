import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useStoresManagement } from '@/application/useCases/stores/useStoresManagement';
import { StoresManagementView } from '@/presentation/ui/organisms/stores/StoresManagementView';

const UnsavedChangesModal = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center bg-neutral-dark/50 px-4 backdrop-blur-sm'
      onClick={onCancel}
    >
      <div
        className='w-full max-w-sm rounded-[1.75rem] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.22)]'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100'>
          <i className='bx bx-error text-2xl text-amber-500' aria-hidden='true' />
        </div>
        <h2 className='text-lg font-bold text-neutral-dark'>Cambios sin guardar</h2>
        <p className='mt-2 text-sm text-neutral-dark/65'>
          Tienes cambios pendientes en tu tienda. Si sales ahora se perderán.
        </p>
        <div className='mt-6 flex flex-col gap-2'>
          <button
            type='button'
            onClick={onCancel}
            className='w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95'
          >
            Volver y guardar
          </button>
          <button
            type='button'
            onClick={onConfirm}
            className='w-full rounded-xl border border-neutral-gray/30 px-4 py-2.5 text-sm font-semibold text-neutral-dark/70 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95'
          >
            Salir sin guardar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const StoresPage = () => {
  const storesManagement = useStoresManagement();
  const navigate = useNavigate();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const originalPushState = useRef<typeof history.pushState | null>(null);

  // Intercept SPA navigation when there are unsaved changes
  useEffect(() => {
    if (!storesManagement.isDirty) return;

    originalPushState.current = history.pushState.bind(history);

    history.pushState = (state, unused, url) => {
      if (url) {
        try {
          const newPath = new URL(String(url), window.location.origin).pathname;
          if (newPath !== window.location.pathname) {
            setPendingPath(newPath);
            return; // block navigation
          }
        } catch { /* non-parseable url — allow through */ }
      }
      originalPushState.current!(state, unused, url);
    };

    return () => {
      if (originalPushState.current) {
        history.pushState = originalPushState.current;
        originalPushState.current = null;
      }
    };
  }, [storesManagement.isDirty]);

  // Block browser tab close / refresh
  useEffect(() => {
    if (!storesManagement.isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [storesManagement.isDirty]);

  const handleConfirm = () => {
    const path = pendingPath;
    setPendingPath(null);
    // Restore original pushState before navigating so it doesn't get intercepted again
    if (originalPushState.current) {
      history.pushState = originalPushState.current;
      originalPushState.current = null;
    }
    if (path) navigate(path);
  };

  return (
    <>
      <StoresManagementView
        stores={storesManagement.stores}
        form={storesManagement.form}
        editingId={storesManagement.editingId}
        loading={storesManagement.loading}
        submitting={storesManagement.submitting}
        error={storesManagement.error}
        isSeller={storesManagement.isSeller}
        isDirty={storesManagement.isDirty}
        onFormChange={storesManagement.updateForm}
        onSubmit={storesManagement.submitForm}
        onEdit={storesManagement.startEditing}
        onReset={storesManagement.resetForm}
        onToggleActive={storesManagement.isSeller ? undefined : storesManagement.toggleActive}
        onDelete={storesManagement.isSeller ? undefined : storesManagement.deleteStore}
      />

      {pendingPath !== null ? (
        <UnsavedChangesModal
          onConfirm={handleConfirm}
          onCancel={() => setPendingPath(null)}
        />
      ) : null}
    </>
  );
};

export default StoresPage;
