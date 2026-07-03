'use client';

import { useState, useRef } from 'react';
import { API_ENDPOINTS } from "@/app/config/api";
import { getAuthHeaders } from "@/app/utils/authHeaders";

export default function DocumentUpload({ onUploadSuccess, className = "" }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      // بررسی نوع فایل
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(`فرمت فایل ${file.name} مجاز نیست`);
        return;
      }

      // بررسی اندازه فایل (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`حجم فایل ${file.name} نباید بیشتر از 5 مگابایت باشد`);
        return;
      }

      uploadFile(file);
    });
  };

  const uploadFile = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(API_ENDPOINTS.fileUpload.uploadUserDocument, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedFiles(prev => [...prev, result.data]);
        if (onUploadSuccess) {
          onUploadSuccess(result.data);
        }
        alert(`مدرک ${file.name} با موفقیت آپلود شد`);
      } else {
        alert(result.message || 'خطا در آپلود مدرک');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('خطا در آپلود مدرک');
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileId) => {
    try {
      const response = await fetch(API_ENDPOINTS.fileUpload.deleteFile(fileId), {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (result.success) {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
        alert('مدرک با موفقیت حذف شد');
      } else {
        alert(result.message || 'خطا در حذف مدرک');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('خطا در حذف مدرک');
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('image')) return '🖼️';
    return '📎';
  };

  return (
    <div className={`document-upload ${className}`}>
      <div className="space-y-4">
        {/* انتخاب فایل */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            multiple
            className="hidden"
            id="document-upload"
          />
          <label
            htmlFor="document-upload"
            className="cursor-pointer"
          >
            <div className="text-4xl mb-2">📁</div>
            <p className="text-lg font-medium text-gray-700">
              {uploading ? 'در حال آپلود...' : 'انتخاب مدارک'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              PDF, Word, تصاویر - حداکثر 5 مگابایت
            </p>
          </label>
        </div>

        {/* لیست فایل‌های آپلود شده */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-700">مدارک آپلود شده:</h3>
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                  <div>
                    <p className="font-medium text-sm">{file.originalName}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={file.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    مشاهده
                  </a>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
