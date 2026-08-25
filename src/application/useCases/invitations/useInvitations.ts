import { useEffect, useState } from 'react';
import { IInvitation, InvitationsRepository } from '@/infrastructure/repositories/api/invitations/InvitationsRepository';

export const useInvitations = () => {
  const [invitations, setInvitations] = useState<IInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionIds, setActionIds] = useState<Set<string>>(new Set());
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await InvitationsRepository.getAll();
      setInvitations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar invitaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const sendInvitation = async () => {
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    const timeout = setTimeout(() => {
      setSubmitting(false);
      setSuccess('Invitación registrada — el correo se está procesando en segundo plano. Revisa la tabla en unos segundos.');
      void load();
    }, 20_000);
    try {
      const res = await InvitationsRepository.create(email.trim());
      clearTimeout(timeout);
      setSuccess(res.data.message ?? 'Invitación enviada');
      if (res.data.emailSent === false) setError('La invitación se guardó pero el correo no pudo enviarse. Revisa los logs del servidor.');
      setEmail('');
      await load();
    } catch (err) {
      clearTimeout(timeout);
      setError(err instanceof Error ? err.message : 'No se pudo enviar la invitación');
    } finally {
      clearTimeout(timeout);
      setSubmitting(false);
    }
  };

  const resendInvitation = async (id: string) => {
    setActionIds((prev) => new Set(prev).add(id));
    setError(null);
    setSuccess(null);
    try {
      const res = await InvitationsRepository.resend(id);
      setSuccess(res.data.message ?? 'Invitación reenviada');
      if (res.data.emailSent === false) setError('La invitación se renovó pero el correo no pudo enviarse.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reenviar la invitación');
    } finally {
      setActionIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  const deleteInvitation = async (id: string) => {
    setActionIds((prev) => new Set(prev).add(id));
    setError(null);
    setSuccess(null);
    try {
      await InvitationsRepository.delete(id);
      setSuccess('Invitación eliminada');
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la invitación');
    } finally {
      setActionIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  return {
    invitations, loading, submitting, actionIds,
    email, setEmail, error, success,
    sendInvitation, resendInvitation, deleteInvitation,
  };
};
