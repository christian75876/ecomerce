import { useEffect, useState } from 'react';
import { IInvitation, InvitationsRepository } from '@/infrastructure/repositories/api/invitations/InvitationsRepository';

export const useInvitations = () => {
  const [invitations, setInvitations] = useState<IInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await InvitationsRepository.getAll();
      setInvitations(res.data ?? []);
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
    setLastInviteUrl(null);
    try {
      const res = await InvitationsRepository.create(email.trim());
      setSuccess(res.data.message);
      setLastInviteUrl(res.data.inviteUrl ?? null);
      setEmail('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la invitación');
    } finally {
      setSubmitting(false);
    }
  };

  return { invitations, loading, submitting, email, setEmail, error, success, lastInviteUrl, sendInvitation };
};
