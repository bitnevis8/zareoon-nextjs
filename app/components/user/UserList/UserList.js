"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/app/config/api';
import { fetchWithCredentials } from '@/app/utils/fetch';
import Button from '@/app/components/ui/Button/Button';
import Table from '@/app/components/ui/Table/Table';

const UserList = () => {
  const router = useRouter();
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
    if (!confirm('آیا از حذف این کاربر اطمینان دارید؟')) return;
    try {
      await fetchWithCredentials(API_ENDPOINTS.users.delete(id), {
        method: 'DELETE'
      });
      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.message || 'خطا در حذف کاربر');
    }
  };

  if (loading) return <div>در حال بارگذاری...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">لیست کاربران</h2>
        <Button
          onClick={() => router.push('/dashboard/user-management/users/create')}
          variant="primary"
        >
          افزودن کاربر جدید
        </Button>
      </div>

      <Table
        headers={[
          { key: 'id', label: 'شناسه' },
          { key: 'username', label: 'نام کاربری' },
          { key: 'email', label: 'ایمیل' },
          { key: 'firstName', label: 'نام' },
          { key: 'lastName', label: 'نام خانوادگی' },
          { key: 'personnelNumber', label: 'شماره پرسنلی' },
          { key: 'actions', label: 'عملیات' }
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
                مشاهده
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/user-management/users/${user.id}/edit`)}
                variant="secondary"
                size="small"
              >
                ویرایش
              </Button>
              <Button
                onClick={() => handleDelete(user.id)}
                variant="danger"
                size="small"
              >
                حذف
              </Button>
            </div>
          )
        }))}
      />
    </div>
  );
};

export default UserList; 