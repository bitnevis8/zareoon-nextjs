'use client';

import { useState, useRef } from 'react';
import { API_ENDPOINTS } from '@/app/config/api';
import { useAuth } from '@/app/context/AuthContext';

export default function AvatarUpload({ onUploadSuccess, currentAvatar, className = "", userId = null }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const { user, updateUser } = useAuth();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // بررسی نوع فایل
      if (!file.type.startsWith('image/')) {
        alert('فقط فایل‌های تصویری مجاز است');
        return;
      }

      // بررسی اندازه فایل (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم فایل نباید بیشتر از 5 مگابایت باشد');
        return;
      }

      // ایجاد پیش‌نمایش
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // اگر userId مشخص شده باشد، آن را اضافه می‌کنیم
      if (userId) {
        formData.append('userId', userId);
      }

      const response = await fetch(API_ENDPOINTS.fileUpload.uploadAvatar, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // اگر آواتار برای کاربر فعلی است، اطلاعات کاربر را به‌روزرسانی می‌کنیم
        if (!userId && updateUser) {
          updateUser({ ...user, avatar: result.data.downloadUrl });
        }
        
        setPreview(null);
        if (onUploadSuccess) {
          onUploadSuccess(result.data);
        }
        
        alert('آواتار با موفقیت آپلود شد');
      } else {
        alert(result.message || 'خطا در آپلود آواتار');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('خطا در آپلود آواتار');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const handleDelete = async () => {
    if (!currentAvatar) return;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.fileUpload.deleteFileByUrl}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fileUrl: currentAvatar })
      });

      const result = await response.json();
      
      if (result.success) {
        if (onUploadSuccess) {
          onUploadSuccess(null); // حذف آواتار
        }
        alert('آواتار حذف شد');
      } else {
        throw new Error(result.message || 'خطا در حذف آواتار');
      }
    } catch (error) {
      console.error('خطا در حذف آواتار:', error);
      alert('خطا در حذف آواتار: ' + error.message);
    }
  };

  return (
    <div className={`avatar-upload ${className}`}>
      <div className="flex items-center space-x-4">
        {/* نمایش آواتار */}
        <div className="flex-shrink-0">
          <img
            src={preview || currentAvatar || '/images/default/male.png'}
            alt="آواتار"
            className="w-20 h-20 rounded-lg object-cover"
          />
        </div>

        {/* دکمه‌ها */}
        <div className="flex flex-col space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="avatar-upload"
          />
          
          <label
            htmlFor="avatar-upload"
            className="inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition-colors text-sm"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            انتخاب تصویر
          </label>
          
          {currentAvatar && (
            <button
              onClick={handleDelete}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
            >
              حذف تصویر
            </button>
          )}
          
          {preview && (
            <div className="flex space-x-2">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {uploading ? 'آپلود...' : 'آپلود'}
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
              >
                لغو
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
