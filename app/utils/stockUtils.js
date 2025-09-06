// تابع محاسبه کلاس بر اساس مقدار مطلق موجودی (کیلوگرم)
export function getStockClass(availableStock) {
  if (availableStock === 0) return 'stock-empty';
  if (availableStock < 5000) return 'stock-low';        // زیر 5000 کیلوگرم → سبز روشن
  if (availableStock < 20000) return 'stock-medium';    // 5000-20000 کیلوگرم → سبز متوسط
  return 'stock-high';                                   // 20000+ کیلوگرم → سبز تیره
}

// تابع محاسبه موجودی برای دسته‌های مادر (همه سطوح)
export function calculateParentStockQuantity(products, parentId, inventoryLots = []) {
  let totalStock = 0;

  const findChildrenRecursive = (currentParentId) => {
    const directChildren = products.filter(p => p.parentId === currentParentId);
    console.log(`Looking for children of parent ${currentParentId}, found ${directChildren.length} children`);
    directChildren.forEach(child => {
      if (child.isOrderable) {
        // محصول نهایی - محاسبه موجودی از InventoryLot ها
        const productLots = inventoryLots.filter(lot => lot.productId === child.id);
        console.log(`Product ${child.name} (${child.id}): ${productLots.length} inventory lots`);
        if (productLots.length > 0) {
          const childTotalStock = productLots.reduce((sum, lot) => {
            const total = parseFloat(lot.totalQuantity || 0);
            return sum + (isNaN(total) ? 0 : total);
          }, 0);
          const childReservedStock = productLots.reduce((sum, lot) => {
            const reserved = parseFloat(lot.reservedQuantity || 0);
            return sum + (isNaN(reserved) ? 0 : reserved);
          }, 0);
          const childAvailableStock = childTotalStock - childReservedStock;
          
          if (childAvailableStock > 0) {
            totalStock += childAvailableStock;
            console.log(`Added ${childAvailableStock} kg from ${child.name}`);
          }
        }
      } else {
        // دسته - بازگشت به زیردسته‌ها
        console.log(`Recursing into category ${child.name} (${child.id})`);
        findChildrenRecursive(child.id);
      }
    });
  };

  findChildrenRecursive(parentId);
  
  return totalStock;
}

// تابع جدید برای دریافت موجودی سلسله مراتبی از API
export async function getHierarchicalStock(productId) {
  try {
    const response = await fetch(`/api/products/${productId}/hierarchical-stock`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching hierarchical stock:', error);
    return null;
  }
}

// تابع محاسبه موجودی سلسله مراتبی محلی (برای استفاده در صورت عدم دسترسی به API)
export function calculateHierarchicalStockLocal(product, allProducts, inventoryLots = []) {
  const result = {
    totalStock: 0,
    availableStock: 0,
    reservedStock: 0,
    batches: [],
    children: []
  };

  if (product.isOrderable) {
    // محصول نهایی - محاسبه از بچ‌ها
    const productLots = inventoryLots.filter(lot => lot.productId === product.id);
    
    // گروه‌بندی بر اساس درجه کیفیت
    const batchesByGrade = {};
    productLots.forEach(lot => {
      const grade = lot.qualityGrade || 'بدون درجه';
      if (!batchesByGrade[grade]) {
        batchesByGrade[grade] = {
          grade: grade,
          totalStock: 0,
          availableStock: 0,
          reservedStock: 0,
          lots: []
        };
      }
      
      const total = parseFloat(lot.totalQuantity || 0);
      const reserved = parseFloat(lot.reservedQuantity || 0);
      const available = total - reserved;
      
      batchesByGrade[grade].totalStock += total;
      batchesByGrade[grade].availableStock += available;
      batchesByGrade[grade].reservedStock += reserved;
      batchesByGrade[grade].lots.push({
        id: lot.id,
        totalQuantity: total,
        availableQuantity: available,
        reservedQuantity: reserved,
        unit: lot.unit,
        status: lot.status
      });
    });

    result.batches = Object.values(batchesByGrade);
    result.totalStock = result.batches.reduce((sum, batch) => sum + batch.totalStock, 0);
    result.availableStock = result.batches.reduce((sum, batch) => sum + batch.availableStock, 0);
    result.reservedStock = result.batches.reduce((sum, batch) => sum + batch.reservedStock, 0);

  } else {
    // دسته - محاسبه از زیرمجموعه‌ها
    const children = allProducts.filter(p => p.parentId === product.id && p.isActive);
    
    for (const child of children) {
      const childStock = calculateHierarchicalStockLocal(child, allProducts, inventoryLots);
      result.children.push({
        product: {
          id: child.id,
          name: child.name,
          isOrderable: child.isOrderable
        },
        stock: childStock
      });
      
      result.totalStock += childStock.totalStock;
      result.availableStock += childStock.availableStock;
      result.reservedStock += childStock.reservedStock;
    }
  }

  return result;
}

// تابع محاسبه موجودی برای هر محصول یا دسته
export function calculateAvailableStock(product, allProducts, inventoryLots = []) {
  if (!product || !allProducts) return 0;
  
  if (product.isOrderable) {
    // محصول نهایی - محاسبه از بچ‌ها
    const productLots = inventoryLots.filter(lot => lot.productId === product.id);
    if (productLots.length > 0) {
      const totalStock = productLots.reduce((sum, lot) => {
        const total = parseFloat(lot.totalQuantity || 0);
        return sum + (isNaN(total) ? 0 : total);
      }, 0);
      const reservedStock = productLots.reduce((sum, lot) => {
        const reserved = parseFloat(lot.reservedQuantity || 0);
        return sum + (isNaN(reserved) ? 0 : reserved);
      }, 0);
      return totalStock - reservedStock;
    }
    return 0;
  } else {
    // دسته - محاسبه از زیرمجموعه‌ها
    return calculateParentStockQuantity(allProducts, product.id, inventoryLots);
  }
}

// تابع اصلی برای تعیین کلاس
export function getProductStockClass(product, allProducts, inventoryLots = []) {
  // بررسی null بودن product
  if (!product || !allProducts) return 'stock-empty';
  
  console.log(`Getting stock class for: ${product.name} (${product.id}), isOrderable: ${product.isOrderable}, parentId: ${product.parentId}`);
  
  // Debug: Check if wheat products exist in allProducts
  if (product.id === 1001) { // گندم
    const wheatProducts = allProducts.filter(p => p.parentId === 1001);
    console.log(`Wheat products in allProducts:`, wheatProducts.map(p => `${p.name} (${p.id}, orderable: ${p.isOrderable})`));
  }
  
  const availableStock = calculateAvailableStock(product, allProducts, inventoryLots);
  console.log(`${product.name} (${product.id}): ${availableStock} kg available stock`);
  
  return getStockClass(availableStock);
}
