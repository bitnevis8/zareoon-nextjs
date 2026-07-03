// تعیین هوشمند آدرس API بدون نیاز به .env
const isProduction = process.env.NODE_ENV === 'production';

// تشخیص خودکار سرور واقعی بر اساس دامنه
const isRealProduction = (() => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    // اگر دامنه zareoon.ir است، سرور واقعی است
    return hostname === 'zareoon.ir' || hostname === 'www.zareoon.ir';
  }
  // در SSR، از متغیر محیطی استفاده کن
  return process.env.VERCEL_URL?.includes('zareoon.ir') || 
         process.env.NEXT_PUBLIC_VERCEL_URL?.includes('zareoon.ir') ||
         false;
})();

let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  if (isProduction) {
    // در production همیشه از api.zareoon.ir استفاده کن
    API_BASE_URL = 'https://api.zareoon.ir';
  } else {
    // توسعه: از آدرس فرانت استفاده کن و پورت را به 3000 (بک‌اند) نگاشت بده
    try {
      if (typeof window !== 'undefined' && window.location) {
        const loc = window.location;
        const host = loc.hostname; // آی‌پی یا دامنه لوکال
        // اگر پورتی وجود دارد روی فرانت، API را روی 3000 هدف بگیر
        const protocol = loc.protocol || 'http:';
        API_BASE_URL = `${protocol}//${host}:3000`;
      } else {
        // SSR توسعه
        API_BASE_URL = 'http://localhost:3000';
      }
    } catch {
      API_BASE_URL = 'http://localhost:3000';
    }
  }
}

// Log the API URL for debugging
if (typeof window !== 'undefined') {
  console.log('🔍 API Configuration:');
  console.log('  - API_BASE_URL:', API_BASE_URL);
  console.log('  - isProduction:', isProduction);
  console.log('  - isRealProduction:', isRealProduction);
  console.log('  - hostname:', window.location.hostname);
  console.log('  - port:', window.location.port);
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
} else {
  // SSR logging
  console.log('🔍 API Configuration (SSR):');
  console.log('  - API_BASE_URL:', API_BASE_URL);
  console.log('  - isProduction:', isProduction);
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
}

export const API_ENDPOINTS = {
  // تمام بخش‌های مربوط به aryafoulad حذف شود (unit-locations, mission-orders, rate-settings, warehouse-module و ...)
  // ... existing code ...
  users: {
    base: `${API_BASE_URL}/user/user`,
    getAll: `${API_BASE_URL}/user/user/getAll`,
    getById: (id) => `${API_BASE_URL}/user/user/getOne/${id}`,
    create: `${API_BASE_URL}/user/user/create`,
    update: (id) => `${API_BASE_URL}/user/user/update/${id}`,
    delete: (id) => `${API_BASE_URL}/user/user/delete/${id}`,
    search: `${API_BASE_URL}/user/user/search`,
  },
  roles: {
    base: `${API_BASE_URL}/user/role`,
    getAll: `${API_BASE_URL}/user/role/getAll`,
    getById: (id) => `${API_BASE_URL}/user/role/getOne/${id}`,
    create: `${API_BASE_URL}/user/role/create`,
    update: (id) => `${API_BASE_URL}/user/role/update/${id}`,
    delete: (id) => `${API_BASE_URL}/user/role/delete/${id}`,
  },
  // انبارداری
  warehouse: {
    base: `${API_BASE_URL}/aryafoulad/warehouse-module/warehouse`,
    getAll: `${API_BASE_URL}/aryafoulad/warehouse-module/warehouse/getAll`,
    getById: (id) => `${API_BASE_URL}/aryafoulad/warehouse-module/warehouse/getOne/${id}`,
    create: `${API_BASE_URL}/aryafoulad/warehouse-module/warehouse/create`,
    update: (id) => `${API_BASE_URL}/aryafoulad/warehouse-module/warehouse/update/${id}`,
    delete: (id) => `${API_BASE_URL}/aryafoulad/warehouse-module/warehouse/delete/${id}`,
    search: (query) => `${API_BASE_URL}/aryafoulad/warehouse-module/warehouse/search?query=${query}`,
  },
  items: {
    base: `${API_BASE_URL}/aryafoulad/warehouse-module/item`,
    getAll: `${API_BASE_URL}/aryafoulad/warehouse-module/item/getAll`,
    getById: (id) => `${API_BASE_URL}/aryafoulad/warehouse-module/item/getOne/${id}`,
    create: `${API_BASE_URL}/aryafoulad/warehouse-module/item/create`,
    update: (id) => `${API_BASE_URL}/aryafoulad/warehouse-module/item/update/${id}`,
    delete: (id) => `${API_BASE_URL}/aryafoulad/warehouse-module/item/delete/${id}`,
  },
  inventory: {
    base: `${API_BASE_URL}/aryafoulad/warehouse-module/inventory`,
    getAll: `${API_BASE_URL}/aryafoulad/warehouse-module/inventory/getAll`,
    getById: (id) => `${API_BASE_URL}/aryafoulad/warehouse-module/inventory/getOne/${id}`,
    create: `${API_BASE_URL}/aryafoulad/warehouse-module/inventory/create`,
    update: (id) => `${API_BASE_URL}/aryafoulad/warehouse-module/inventory/update/${id}`,
    delete: (id) => `${API_BASE_URL}/aryafoulad/warehouse-module/inventory/delete/${id}`,
  },
  itemAssignments: {
    base: `${API_BASE_URL}/aryafoulad/warehouse-module/item-assignment`,
    getAll: `${API_BASE_URL}/aryafoulad/warehouse-module/item-assignment/getAll`,
    getById: (id) => `${API_BASE_URL}/aryafoulad/warehouse-module/item-assignment/getOne/${id}`,
    create: `${API_BASE_URL}/aryafoulad/warehouse-module/item-assignment/create`,
    update: (id) => `${API_BASE_URL}/aryafoulad/warehouse-module/item-assignment/update/${id}`,
    delete: (id) => `${API_BASE_URL}/aryafoulad/warehouse-module/item-assignment/delete/${id}`,
  },
  auth: {
    checkIdentifier: `${API_BASE_URL}/user/auth/check-identifier`,
    registerEmail: `${API_BASE_URL}/user/auth/register/email`,
    registerMobile: `${API_BASE_URL}/user/auth/register/mobile`,
    login: `${API_BASE_URL}/user/auth/login`,
    verifyEmail: `${API_BASE_URL}/user/auth/verify/email`,
    verifyCode: `${API_BASE_URL}/user/auth/verify-code`,
    sendCodeForRegistration: `${API_BASE_URL}/user/auth/send-code-for-registration`,
    resendCode: `${API_BASE_URL}/user/auth/resend-code`,
    resendEmailCode: `${API_BASE_URL}/user/auth/resend-code/email`,
    completeRegistration: `${API_BASE_URL}/user/auth/complete-registration`,
    me: `${API_BASE_URL}/user/auth/me`,
    updateProfile: `${API_BASE_URL}/user/auth/profile`,
    logout: `${API_BASE_URL}/user/auth/logout`,
    clearSessions: `${API_BASE_URL}/user/auth/clear-sessions`,
  },
  // File Upload endpoints (authenticated routes use Next.js proxy)
  fileUpload: {
    base: `${API_BASE_URL}/file-upload`,
    upload: `/api/file-upload/upload`,
    uploadAvatar: `/api/file-upload/upload/avatar`,
    uploadUserDocument: `/api/file-upload/upload/user-document`,
    getFile: (id) => `${API_BASE_URL}/file-upload/file/${id}`,
    deleteFile: (id) => `/api/file-upload/file/${id}`,
    deleteFileByUrl: `/api/file-upload/file`,
    getUserFiles: `/api/file-upload/user-files`,
    getUserFilesByType: (fileType) => `${API_BASE_URL}/file-upload/user-files/${fileType}`,
    getFilesByModule: (module) => `${API_BASE_URL}/file-upload/module/${module}`,
    initializeDirectories: `${API_BASE_URL}/file-upload/init-directories`,
  },
  // مقالات - حذف شده: برای سازگاری موقت، مسیرهای خنثی
  articles: {
    base: `${API_BASE_URL}/__removed_articles__`,
    getAll: `${API_BASE_URL}/__removed_articles__/getAll`,
    getById: (id) => `${API_BASE_URL}/__removed_articles__/getOne/${id}`,
    getByCategory: (categoryId, limit = 10) => `${API_BASE_URL}/__removed_articles__/getByCategory/${categoryId}?limit=${limit}`,
    getByCategorySlug: (categorySlug, limit = 10) => `${API_BASE_URL}/__removed_articles__/getByCategorySlug/${categorySlug}?limit=${limit}`,
    getByTag: (tagId, limit = 10) => `${API_BASE_URL}/__removed_articles__/getByTag/${tagId}?limit=${limit}`,
    getByTagSlug: (tagSlug, limit = 10) => `${API_BASE_URL}/__removed_articles__/getByTagSlug/${tagSlug}?limit=${limit}`,
    getByTags: (tagIds, limit = 10) => `${API_BASE_URL}/__removed_articles__/getByTags?tagIds=${tagIds}&limit=${limit}`,
    getByAgency: (agencyId, limit = 10) => `${API_BASE_URL}/__removed_articles__/getByAgency/${agencyId}?limit=${limit}`,
    search: `${API_BASE_URL}/__removed_articles__/search`,
    create: `${API_BASE_URL}/__removed_articles__/create`,
    update: (id) => `${API_BASE_URL}/__removed_articles__/update/${id}`,
    delete: (id) => `${API_BASE_URL}/__removed_articles__/delete/${id}`,
  },
  // تگ‌ها - حذف شده: مسیرهای خنثی
  tags: {
    base: `${API_BASE_URL}/__removed_articles__/tags`,
    getAll: `${API_BASE_URL}/__removed_articles__/tags/getAll`,
    getAllForSearch: `${API_BASE_URL}/__removed_articles__/tags/getAllForSearch`,
    getAllWithArticleCount: `${API_BASE_URL}/__removed_articles__/tags/getAllWithArticleCount`,
    getByClasses: `${API_BASE_URL}/__removed_articles__/tags/getByClasses`,
    testDatabase: `${API_BASE_URL}/__removed_articles__/tags/testDatabase`,
    getById: (id) => `${API_BASE_URL}/__removed_articles__/tags/getOne/${id}`,
    getByName: (name) => `${API_BASE_URL}/__removed_articles__/tags/getByName/${encodeURIComponent(name)}`,
    getByFamily: (familyId) => `${API_BASE_URL}/__removed_articles__/tags/getByFamily/${familyId}`,
    search: `${API_BASE_URL}/__removed_articles__/tags/search`,
    create: `${API_BASE_URL}/__removed_articles__/tags/create`,
    update: (id) => `${API_BASE_URL}/__removed_articles__/tags/update/${id}`,
    delete: (id) => `${API_BASE_URL}/__removed_articles__/tags/delete/${id}`,
  },
  // دسته‌بندی‌ها - حذف شده
  categories: {
    base: `${API_BASE_URL}/__removed_articles__/categories`,
    getAll: `${API_BASE_URL}/__removed_articles__/categories/getAll`,
    getById: (id) => `${API_BASE_URL}/__removed_articles__/categories/getOne/${id}`,
    create: `${API_BASE_URL}/__removed_articles__/categories/create`,
    update: (id) => `${API_BASE_URL}/__removed_articles__/categories/update/${id}`,
    delete: (id) => `${API_BASE_URL}/__removed_articles__/categories/delete/${id}`,
  },
  // کلاس‌ها - حذف شده
  classes: {
    base: `${API_BASE_URL}/__removed_articles__/classes`,
    getAll: `${API_BASE_URL}/__removed_articles__/classes`,
    getById: (id) => `${API_BASE_URL}/__removed_articles__/classes/${id}`,
    create: `${API_BASE_URL}/__removed_articles__/classes`,
    update: (id) => `${API_BASE_URL}/__removed_articles__/classes/${id}`,
    delete: (id) => `${API_BASE_URL}/__removed_articles__/classes/${id}`,
  },
  // آژانس‌ها - حذف شده
  agencies: {
    base: `${API_BASE_URL}/__removed_articles__/agencies`,
    getAll: `${API_BASE_URL}/__removed_articles__/agencies/getAll`,
    getById: (id) => `${API_BASE_URL}/__removed_articles__/agencies/getOne/${id}`,
    create: `${API_BASE_URL}/__removed_articles__/agencies/create`,
    update: (id) => `${API_BASE_URL}/__removed_articles__/agencies/update/${id}`,
    delete: (id) => `${API_BASE_URL}/__removed_articles__/agencies/delete/${id}`,
  },
  // خانواده‌های تگ - حذف شده
  tagFamilies: {
    base: `${API_BASE_URL}/__removed_articles__/tag-families`,
    getAll: `${API_BASE_URL}/__removed_articles__/tag-families/getAll`,
    getById: (id) => `${API_BASE_URL}/__removed_articles__/tag-families/getOne/${id}`,
    create: `${API_BASE_URL}/__removed_articles__/tag-families/create`,
    update: (id) => `${API_BASE_URL}/__removed_articles__/tag-families/update/${id}`,
    delete: (id) => `${API_BASE_URL}/__removed_articles__/tag-families/delete/${id}`,
  },
  // مکان‌ها
  locations: {
    base: `${API_BASE_URL}/location`,
    getAll: `${API_BASE_URL}/location/getAll`,
    getById: (id) => `${API_BASE_URL}/location/getOne/${id}`,
    getBySlug: (slug) => `${API_BASE_URL}/location/getBySlug/${encodeURIComponent(slug)}`,
    getByName: (name) => `${API_BASE_URL}/location/getByName/${encodeURIComponent(name)}`,
    getChildren: (parentId) => `${API_BASE_URL}/location/getChildren/${parentId}`,
    getChildrenBySlug: (parentSlug) => `${API_BASE_URL}/location/getChildrenBySlug/${encodeURIComponent(parentSlug)}`,
    getByDivisionType: (type) => `${API_BASE_URL}/location/getByDivisionType/${type}`,
    getHierarchy: (id) => `${API_BASE_URL}/location/getHierarchy/${id}`,
    getHierarchyBySlug: (slug) => `${API_BASE_URL}/location/getHierarchyBySlug/${encodeURIComponent(slug)}`,
    getLocationNews: (id, limit = 20, offset = 0) => `${API_BASE_URL}/location/getLocationNews/${id}?limit=${limit}&offset=${offset}`,
    getLocationNewsBySlug: (slug, limit = 20, offset = 0) => `${API_BASE_URL}/location/getLocationNewsBySlug/${encodeURIComponent(slug)}?limit=${limit}&offset=${offset}`,
    getWikiDetails: (id) => `${API_BASE_URL}/location/getWikiDetails/${id}`,
    getWikiDetailsBySlug: (slug) => `${API_BASE_URL}/location/getWikiDetailsBySlug/${encodeURIComponent(slug)}`,
    getWikidataInfo: (id) => `${API_BASE_URL}/location/getWikidataInfo/${id}`,
    getWikidataInfoBySlug: (slug) => `${API_BASE_URL}/location/getWikidataInfoBySlug/${encodeURIComponent(slug)}`,

    search: `${API_BASE_URL}/location/search`,
    create: `${API_BASE_URL}/location/create`,
    update: (id) => `${API_BASE_URL}/location/update/${id}`,
    updateBySlug: (slug) => `${API_BASE_URL}/location/updateBySlug/${encodeURIComponent(slug)}`,
    delete: (id) => `${API_BASE_URL}/location/delete/${id}`,
    deleteBySlug: (slug) => `${API_BASE_URL}/location/deleteBySlug/${encodeURIComponent(slug)}`,
  },
  // کلاس تگ‌ها - حذف شده
  classTags: {
    base: `${API_BASE_URL}/__removed_articles__/class-tags`,
    getAll: `${API_BASE_URL}/__removed_articles__/class-tags/getAll`,
    getById: (id) => `${API_BASE_URL}/__removed_articles__/class-tags/getOne/${id}`,
    getTagsByLocation: `${API_BASE_URL}/__removed_articles__/class-tags/get-tags-by-location`,
    testData: `${API_BASE_URL}/__removed_articles__/class-tags/test-data`,
    search: `${API_BASE_URL}/__removed_articles__/class-tags/search`,
    create: `${API_BASE_URL}/__removed_articles__/class-tags/create`,
    update: (id) => `${API_BASE_URL}/__removed_articles__/class-tags/update/${id}`,
    delete: (id) => `${API_BASE_URL}/__removed_articles__/class-tags/delete/${id}`,
    classifyTags: `${API_BASE_URL}/__removed_articles__/class-tags/classify-tags`,
    fixParentClasses: `${API_BASE_URL}/__removed_articles__/class-tags/fix-parent-classes`,
  },
  // Supplier module (تأمین‌کننده)
  supplier: {
    // productCategories merged into products
    products: {
      base: `${API_BASE_URL}/supplier/product`,
      getAll: `${API_BASE_URL}/supplier/product`,
      getById: (id) => `${API_BASE_URL}/supplier/product/${id}`,
      getOrderHistory: (id, limit = 50, offset = 0) => `${API_BASE_URL}/supplier/product/${id}/order-history?limit=${limit}&offset=${offset}`,
      getCartItems: (id, limit = 50, offset = 0) => `${API_BASE_URL}/supplier/product/${id}/cart-items?limit=${limit}&offset=${offset}`,
      create: `${API_BASE_URL}/supplier/product`,
      update: (id) => `${API_BASE_URL}/supplier/product/${id}`,
      delete: (id) => `${API_BASE_URL}/supplier/product/${id}`,
      exportEnglishCsvAll: `${API_BASE_URL}/supplier/product/export/english-csv/all`,
    },
    inventoryLots: {
      base: `${API_BASE_URL}/supplier/inventory-lot`,
      getAll: `${API_BASE_URL}/supplier/inventory-lot`,
      getById: (id) => `${API_BASE_URL}/supplier/inventory-lot/${id}`,
      create: `${API_BASE_URL}/supplier/inventory-lot`,
      update: (id) => `${API_BASE_URL}/supplier/inventory-lot/${id}`,
      delete: (id) => `${API_BASE_URL}/supplier/inventory-lot/${id}`,
      reserve: (id) => `${API_BASE_URL}/supplier/inventory-lot/${id}/reserve`,
      release: (id) => `${API_BASE_URL}/supplier/inventory-lot/${id}/release`,
    },
    orders: {
      base: `${API_BASE_URL}/supplier/order`,
      getAll: `${API_BASE_URL}/supplier/order`,
      getMine: `${API_BASE_URL}/supplier/order/me`,
      getCustomerOrders: `${API_BASE_URL}/supplier/order/customer`,
      getAdminOrders: `${API_BASE_URL}/supplier/order/admin`,
      getById: (id) => `${API_BASE_URL}/supplier/order/${id}`,
      create: `${API_BASE_URL}/supplier/order`,
      cancel: (id) => `${API_BASE_URL}/supplier/order/${id}/cancel`,
      complete: (id) => `${API_BASE_URL}/supplier/order/${id}/complete`,
      getItems: (id) => `${API_BASE_URL}/supplier/order/${id}/items`,
      updateItemStatus: (itemId) => `${API_BASE_URL}/supplier/order/item/${itemId}/status`,
      updateRequestItemStatus: (itemId) => `${API_BASE_URL}/supplier/order-request-item/${itemId}/status`,
      allocate: (id) => `${API_BASE_URL}/supplier/order/${id}/allocate`,
      approve: (id) => `${API_BASE_URL}/supplier/order/${id}/approve`,
      updateStatus: (id) => `${API_BASE_URL}/supplier/order/${id}/status`,
    },
    cart: {
      base: `${API_BASE_URL}/supplier/cart`,
    },
    attributeDefinitions: {
      base: `${API_BASE_URL}/supplier/attribute-definition`,
      getAll: `${API_BASE_URL}/supplier/attribute-definition`,
      getByCategoryId: (categoryId) => `${API_BASE_URL}/supplier/attribute-definition?categoryId=${categoryId}`,
      getByProductId: (productId) => `${API_BASE_URL}/supplier/attribute-definition?productId=${productId}`,
      getById: (id) => `${API_BASE_URL}/supplier/attribute-definition/${id}`,
      create: `${API_BASE_URL}/supplier/attribute-definition`,
      update: (id) => `${API_BASE_URL}/supplier/attribute-definition/${id}`,
      delete: (id) => `${API_BASE_URL}/supplier/attribute-definition/${id}`,
    },
    attributeValues: {
      base: `${API_BASE_URL}/supplier/attribute-value`,
      getAll: `${API_BASE_URL}/supplier/attribute-value`,
      getById: (id) => `${API_BASE_URL}/supplier/attribute-value/${id}`,
      create: `${API_BASE_URL}/supplier/attribute-value`,
      update: (id) => `${API_BASE_URL}/supplier/attribute-value/${id}`,
      delete: (id) => `${API_BASE_URL}/supplier/attribute-value/${id}`,
    },
  },
  lcRequests: {
    create: `${API_BASE_URL}/lc-request`,
    getAll: `${API_BASE_URL}/lc-request`,
    getById: (id) => `${API_BASE_URL}/lc-request/${id}`,
    updateStatus: (id) => `${API_BASE_URL}/lc-request/${id}/status`,
  },
  serviceRequests: {
    create: `${API_BASE_URL}/service-request`,
    getAll: `${API_BASE_URL}/service-request`,
    getById: (id) => `${API_BASE_URL}/service-request/${id}`,
    updateStatus: (id) => `${API_BASE_URL}/service-request/${id}/status`,
  },
  messaging: {
    base: `${API_BASE_URL}/messaging`,
    conversations: `${API_BASE_URL}/messaging/conversations`,
    unreadCount: `${API_BASE_URL}/messaging/unread-count`,
    userSearch: `${API_BASE_URL}/messaging/users/search`,
    conversation: (id) => `${API_BASE_URL}/messaging/conversations/${id}`,
    messages: (id) => `${API_BASE_URL}/messaging/conversations/${id}/messages`,
    messageImage: (id) => `${API_BASE_URL}/messaging/conversations/${id}/messages/image`,
    markRead: (id) => `${API_BASE_URL}/messaging/conversations/${id}/read`,
  },
  tamin: {
    base: `${API_BASE_URL}/tamin`,
    public: (slug) => `${API_BASE_URL}/tamin/public/${slug}`,
    posts: (slug) => `${API_BASE_URL}/tamin/public/${slug}/posts`,
    reviews: (slug) => `${API_BASE_URL}/tamin/public/${slug}/reviews`,
    me: `${API_BASE_URL}/tamin/me`,
    createPost: `${API_BASE_URL}/tamin/posts`,
    deletePost: (id) => `${API_BASE_URL}/tamin/posts/${id}`,
    follow: (id) => `${API_BASE_URL}/tamin/follow/${id}`,
    review: (id) => `${API_BASE_URL}/tamin/review/${id}`,
    entitySchemas: `${API_BASE_URL}/tamin/entity-schemas`,
  },
};

/** @deprecated alias — از API_ENDPOINTS.supplier استفاده کنید */
API_ENDPOINTS.farmer = API_ENDPOINTS.supplier;