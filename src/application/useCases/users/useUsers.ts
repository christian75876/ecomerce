import { useEffect, useState } from 'react';
import { IAdminUser, UsersRepository } from '@/infrastructure/repositories/api/users/UsersRepository';

export const useUsers = () => {
  const [users, setUsers] = useState<IAdminUser[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionIds, setActionIds] = useState<Set<number>>(new Set());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        UsersRepository.getAllUsers(),
        UsersRepository.getAllRolesAdmin(),
      ]);
      setUsers(usersRes.data.items ?? []);
      setRoles(rolesRes.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const createUser = async () => {
    if (!email.trim() || !password.trim() || !roleId) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await UsersRepository.createUser({ email: email.trim(), password, roleId });
      setSuccess('Usuario creado correctamente');
      setEmail('');
      setPassword('');
      setRoleId('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const updateUserRole = async (id: number, newRoleId: string) => {
    setActionIds((prev) => new Set(prev).add(id));
    setError(null);
    setSuccess(null);
    try {
      await UsersRepository.updateUser(id, { roleId: newRoleId });
      setSuccess('Rol actualizado');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el rol');
    } finally {
      setActionIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  const toggleVerified = async (id: number, isEmailVerified: boolean) => {
    setActionIds((prev) => new Set(prev).add(id));
    setError(null);
    setSuccess(null);
    try {
      await UsersRepository.updateUser(id, { isEmailVerified });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el usuario');
    } finally {
      setActionIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  const deleteUser = async (id: number) => {
    setActionIds((prev) => new Set(prev).add(id));
    setError(null);
    setSuccess(null);
    try {
      await UsersRepository.deleteUser(id);
      setSuccess('Usuario eliminado');
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el usuario');
    } finally {
      setActionIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  return {
    users, roles, loading, submitting, actionIds,
    email, setEmail, password, setPassword, roleId, setRoleId,
    error, success,
    createUser, updateUserRole, toggleVerified, deleteUser,
  };
};
