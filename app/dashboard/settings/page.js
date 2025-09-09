'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/app/config/api';
import { useAuth } from '@/app/context/AuthContext';
import AvatarUpload from '@/app/components/ui/AvatarUpload';
import DocumentUpload from '@/app/components/ui/DocumentUpload';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [userFiles, setUserFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    loadUserFiles();
  }, []);

  const loadUserFiles = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.fileUpload.getUserFiles, {
        credentials: 'include'
      });
      const result = await response.json();
      
      if (result.success) {
        setUserFiles(result.data);
      }
    } catch (error) {
      console.error('Error loading user files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (fileData) => {
    // آواتار در AuthContext به‌روزرسانی می‌شود
    loadUserFiles(); // بارگذاری مجدد لیست فایل‌ها
  };

  const handleDocumentUpload = (fileData) => {
    setUserFiles(prev => [fileData, ...prev]);
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('image')) return '🖼️';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const tabs = [
    { id: 'profile', name: 'پروفایل', icon: '👤' },
    { id: 'documents', name: 'مدارک', icon: '📄' },
    { id: 'files', name: 'فایل‌های من', icon: '📁' }
  ];

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">حساب کاربری</h1>

        {/* تب‌ها */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap sm:flex-nowrap space-x-2 sm:space-x-8 px-2 sm:px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="ml-1 sm:ml-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-3 sm:p-6">
            {/* تب پروفایل */}
            {activeTab === 'profile' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">اطلاعات پروفایل</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-sm sm:text-md font-medium text-gray-700 mb-3 sm:mb-4">آواتار</h3>
                    <AvatarUpload
                      currentAvatar={user?.avatar}
                      onUploadSuccess={handleAvatarUpload}
                    />
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        نام
                      </label>
                      <input
                        type="text"
                        value={user?.firstName || ''}
                        className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        نام خانوادگی
                      </label>
                      <input
                        type="text"
                        value={user?.lastName || ''}
                        className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        ایمیل
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* تب مدارک */}
            {activeTab === 'documents' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">مدارک و اسناد</h2>
                <DocumentUpload onUploadSuccess={handleDocumentUpload} />
              </div>
            )}

            {/* تب فایل‌های من */}
            {activeTab === 'files' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">فایل‌های من</h2>
                
                {loading ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-sm sm:text-base text-gray-500">در حال بارگذاری...</p>
                  </div>
                ) : userFiles.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {userFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border gap-2 sm:gap-0"
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                          <span className="text-xl sm:text-2xl flex-shrink-0">{getFileIcon(file.mimeType)}</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{file.originalName}</p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {formatFileSize(file.size)} • {file.fileType} • {new Date(file.uploadDate).toLocaleDateString('fa-IR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <a
                            href={file.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 sm:px-3 py-1 bg-blue-500 text-white text-xs sm:text-sm rounded hover:bg-blue-600 transition-colors whitespace-nowrap"
                          >
                            دانلود
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <p className="text-sm sm:text-base">هنوز فایلی آپلود نکرده‌اید</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}