"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { API_ENDPOINTS } from '@/app/config/api';
import { fetchWithCredentials } from '@/app/utils/fetch';
import Button from '@/app/components/ui/Button/Button';
import Table from '@/app/components/ui/Table/Table';

const UserList = () => {
  const router = useRouter();
  const t = useTranslations('home.userList');
  const tUsers = useTranslations('users');
  const tCommon = useTranslations('common');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchWithCredentials(API_ENDPOINTS.users.getAll);
      setUsers(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('deleteConfirm'))) return;
    try {
      await fetchWithCredentials(API_ENDPOINTS.users.delete(id), {
        method: 'DELETE'
      });
      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.message || t('deleteError'));
    }
  };

  if (loading) return <div>{tCommon('loading')}</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const columns = t.raw('columns');

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <Button
          onClick={() => router.push('/dashboard/user-management/users/create')}
          variant="primary"
        >
          {t('addUser')}
        </Button>
      </div>

      <Table
        headers={[
          { key: 'id', label: columns.id },
          { key: 'username', label: columns.username },
          { key: 'email', label: columns.email },
          { key: 'firstName', label: columns.firstName },
          { key: 'lastName', label: columns.lastName },
          { key: 'personnelNumber', label: columns.personnelNumber },
          { key: 'actions', label: columns.actions }
        ]}
        data={users.map(user => ({
          ...user,
          actions: (
            <div className="flex gap-2">
              <Button
                onClick={() => router.push(`/dashboard/user-management/users/${user.id}`)}
                variant="secondary"
                size="small"
              >
                {tUsers('view')}
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/user-management/users/${user.id}/edit`)}
                variant="secondary"
                size="small"
              >
                {tUsers('edit')}
              </Button>
              <Button
                onClick={() => handleDelete(user.id)}
                variant="danger"
                size="small"
              >
                {tUsers('delete')}
              </Button>
            </div>
          )
        }))}
      />
    </div>
  );
};

export default UserList;
