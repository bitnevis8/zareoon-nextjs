"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";
import { getAuthHeaders } from "@/app/utils/authHeaders";

export default function DocumentUpload({ onUploadSuccess, className = "" }) {
  const t = useTranslations("shared");
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);

    files.forEach((file) => {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(t("documentUpload.invalidFormat", { name: file.name }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(t("documentUpload.fileTooLarge", { name: file.name }));
        return;
      }

      uploadFile(file);
    });
  };

  const uploadFile = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(API_ENDPOINTS.fileUpload.uploadUserDocument, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedFiles((prev) => [...prev, result.data]);
        if (onUploadSuccess) {
          onUploadSuccess(result.data);
        }
        alert(t("documentUpload.uploadSuccess", { name: file.name }));
      } else {
        alert(result.message || t("documentUpload.uploadError"));
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(t("documentUpload.uploadError"));
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
        setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
        alert(t("documentUpload.deleteSuccess"));
      } else {
        alert(result.message || t("documentUpload.deleteError"));
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(t("documentUpload.deleteError"));
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word")) return "📝";
    if (mimeType.includes("image")) return "🖼️";
    return "📎";
  };

  return (
    <div className={`document-upload ${className}`}>
      <div className="space-y-4">
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
          <label htmlFor="document-upload" className="cursor-pointer">
            <div className="text-4xl mb-2">📁</div>
            <p className="text-lg font-medium text-gray-700">
              {uploading ? t("documentUpload.uploading") : t("documentUpload.selectDocuments")}
            </p>
            <p className="text-sm text-gray-500 mt-1">{t("documentUpload.hint")}</p>
          </label>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-700">{t("documentUpload.uploadedTitle")}</h3>
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                  <div>
                    <p className="font-medium text-sm">{file.originalName}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={file.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    {t("documentUpload.view")}
                  </a>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    {t("documentUpload.delete")}
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
