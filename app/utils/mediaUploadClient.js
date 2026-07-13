import { API_ENDPOINTS } from "@/app/config/api";
import { getAuthHeaders } from "@/app/utils/authHeaders";

export async function uploadMediaFile(file, entityId, module = "inventory") {
  const inferredType = file.type.startsWith("video/") ? "videos" : "images";
  const form = new FormData();
  form.append("file", file);
  form.append("module", module);
  form.append("fileType", inferredType);
  form.append("entityId", String(entityId));

  const r = await fetch(API_ENDPOINTS.fileUpload.upload, {
    method: "POST",
    body: form,
    credentials: "include",
    headers: getAuthHeaders(),
  });
  const j = await r.json();
  if (!j?.success) throw new Error(j?.message || "خطا در آپلود");
  return j.data;
}

export async function uploadMediaFiles(files, entityId, module = "inventory") {
  for (const file of files) {
    await uploadMediaFile(file, entityId, module);
  }
}
