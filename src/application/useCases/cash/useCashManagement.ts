import { useEffect, useState } from 'react';
import { ICashMovement, ICashSession } from '@/application/dtos/cash/response/CashResponse';
import { CashRepository } from '@/infrastructure/repositories/api/cash/CashRepository';
import { StoresRepository } from '@/infrastructure/repositories/api/stores/StoresRepository';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';

export const useCashManagement = () => {
  const [sessions, setSessions] = useState<ICashSession[]>([]);
  const [stores, setStores] = useState<IStore[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [movements, setMovements] = useState<ICashMovement[]>([]);
  const [storeId, setStoreId] = useState('');
  const [openingAmount, setOpeningAmount] = useState('');
  const [closingAmount, setClosingAmount] = useState('');
  const [movementType, setMovementType] = useState<'MANUAL_IN' | 'MANUAL_OUT' | 'ADJUSTMENT'>('MANUAL_IN');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScreen = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionsResponse, storesResponse] = await Promise.all([
        CashRepository.getSessions(),
        StoresRepository.getStores(),
      ]);
      setSessions(sessionsResponse.data);
      setStores(storesResponse.data.filter((item) => item.isActive));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar caja');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadScreen();
  }, []);

  useEffect(() => {
    if (!selectedSessionId) {
      setMovements([]);
      return;
    }
    void CashRepository.getSessionMovements(selectedSessionId)
      .then((response) => setMovements(response.data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'No fue posible cargar movimientos'),
      );
  }, [selectedSessionId]);

  const openSession = async () => {
    if (!storeId || !openingAmount) {
      setError('Selecciona tienda e ingresa monto inicial');
      return false;
    }

    setSubmitting(true);
    setError(null);
    try {
      await CashRepository.openSession({
        storeId,
        openingAmount: Number(openingAmount),
      });
      setOpeningAmount('');
      await loadScreen();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible abrir caja');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const closeSession = async () => {
    if (!selectedSessionId || !closingAmount) {
      setError('Selecciona sesión e ingresa monto de cierre');
      return false;
    }

    setSubmitting(true);
    setError(null);
    try {
      await CashRepository.closeSession(selectedSessionId, {
        closingAmount: Number(closingAmount),
      });
      setClosingAmount('');
      await loadScreen();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cerrar caja');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const createMovement = async () => {
    if (!selectedSessionId || !movementAmount || !movementReason.trim()) {
      setError('Completa sesión, valor y motivo');
      return false;
    }

    setSubmitting(true);
    setError(null);
    try {
      await CashRepository.createMovement(selectedSessionId, {
        type: movementType,
        amount: Number(movementAmount),
        reason: movementReason.trim(),
      });
      setMovementAmount('');
      setMovementReason('');
      const response = await CashRepository.getSessionMovements(selectedSessionId);
      setMovements(response.data);
      await loadScreen();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible registrar movimiento');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    sessions,
    stores,
    selectedSessionId,
    movements,
    storeId,
    openingAmount,
    closingAmount,
    movementType,
    movementAmount,
    movementReason,
    loading,
    submitting,
    error,
    setSelectedSessionId,
    setStoreId,
    setOpeningAmount,
    setClosingAmount,
    setMovementType,
    setMovementAmount,
    setMovementReason,
    openSession,
    closeSession,
    createMovement,
    reload: loadScreen,
  };
};
